import { useCallback, useEffect, useState, type ReactNode } from "react";
import { fetchWithAuth } from "../../Utils/fetchWithAuth";
import {
  VehiclesContext,
  type AddVehicleItemInput,
  type Vehicle,
  type VehicleCheckSummary,
  type VehicleGroup,
  type VehicleInventoryItem,
  type VehiclePicture,
  type VehicleVerification,
  type VehiclesContextType,
} from "./VehiclesContext";

interface VehiclesProviderProps {
  children: ReactNode;
}

const isCountableItem = (item: { expected_quantity?: number | null }) =>
  (item.expected_quantity ?? 0) > 0;

const getVehicleCheckSummary = (items: VehicleInventoryItem[]): VehicleCheckSummary => {
  const countableItems = items.filter(isCountableItem);

  return {
    checked: countableItems.filter((item) => item.is_checked).length,
    total: countableItems.length,
  };
};

export const VehiclesProvider: React.FC<VehiclesProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCheckSummaryById, setVehicleCheckSummaryById] = useState<Record<number, VehicleCheckSummary>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleItems, setVehicleItems] = useState<VehicleInventoryItem[]>([]);
  const [vehicleItemsLoading, setVehicleItemsLoading] = useState(false);
  const [vehicleItemsError, setVehicleItemsError] = useState<string | null>(null);
  const [currentVehicleVerification, setCurrentVehicleVerification] = useState<VehicleVerification | null>(null);
  const [vehicleVerificationLoading, setVehicleVerificationLoading] = useState(false);
  const [vehiclePictures, setVehiclePictures] = useState<VehiclePicture[]>([]);
  const [vehiclePicturesLoading, setVehiclePicturesLoading] = useState(false);
  const [vehiclePicturesError, setVehiclePicturesError] = useState<string | null>(null);
  const [selectedVehiclePicture, setSelectedVehiclePicture] = useState<VehiclePicture | null>(null);
  const [selectedVehiclePictureLoading, setSelectedVehiclePictureLoading] = useState(false);
  const [selectedVehiclePictureError, setSelectedVehiclePictureError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth<Vehicle[]>("/vehicles");
      setVehicles(data);

      const summaries = await Promise.all(
        data.map(async (vehicle) => {
          const items = await fetchWithAuth<VehicleInventoryItem[]>(`/vehicles/${vehicle.id}/items`);

          return [
            vehicle.id,
            getVehicleCheckSummary(items),
          ] as const;
        }),
      );

      setVehicleCheckSummaryById(Object.fromEntries(summaries));
    } catch (err) {
      console.error("Error al recuperar los vehiculos:", err);
      setError(err instanceof Error ? err.message : "Ocurrio un error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicleItems = useCallback(async (vehicleId: number) => {
    setVehicleItemsLoading(true);
    setVehicleItemsError(null);

    try {
      const items = await fetchWithAuth<VehicleInventoryItem[]>(`/vehicles/${vehicleId}/items`);
      setVehicleItems(items);
    } catch (err) {
      console.error(`Error al recuperar los articulos del vehiculo ${vehicleId}:`, err);
      const message = err instanceof Error ? err.message : "Ocurrio un error desconocido";
      setVehicleItemsError(message);
      throw err;
    } finally {
      setVehicleItemsLoading(false);
    }
  }, []);

  const fetchVehiclePictures = useCallback(async (vehicleId: number) => {
    setVehiclePicturesLoading(true);
    setVehiclePicturesError(null);

    try {
      const pictures = await fetchWithAuth<VehiclePicture[]>(`/vehicles/${vehicleId}/pictures`);
      setVehiclePictures(pictures);
    } catch (err) {
      console.error(`Error al recuperar las fotos del vehiculo ${vehicleId}:`, err);
      const message = err instanceof Error ? err.message : "Ocurrio un error desconocido";
      setVehiclePicturesError(message);
      throw err;
    } finally {
      setVehiclePicturesLoading(false);
    }
  }, []);

  const fetchSingleVehiclePicture = useCallback(async (vehicleId: number, pictureId: number) => {
    setSelectedVehiclePictureLoading(true);
    setSelectedVehiclePictureError(null);

    try {
      const picture = await fetchWithAuth<VehiclePicture>(`/vehicles/${vehicleId}/pictures/${pictureId}`);
      setSelectedVehiclePicture(picture);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar la foto";
      setSelectedVehiclePictureError(message);
      setSelectedVehiclePicture(null);
      throw err;
    } finally {
      setSelectedVehiclePictureLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const updateVehicleInventoryStatus = useCallback(
    async (
      vehicleId: number,
      update: { inventory_done: boolean; verified_at: string | null; signature_key?: string | null },
    ) => {
      await fetchWithAuth(`/vehicles/${vehicleId}`, {
        method: "PATCH",
        body: update,
      });

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === vehicleId
            ? { ...vehicle, ...update }
            : vehicle,
        ),
      );
    },
    [],
  );

  const uploadVehicleSignature = useCallback(
    async (vehicleId: number, signatureBase64: string) => {
      return fetchWithAuth<{ signature_key: string }>(`/vehicles/${vehicleId}/signature`, {
        method: "POST",
        body: {
          signatureBase64,
        },
      });
    },
    [],
  );

  const updateVehicleItem = useCallback(
    async (
      vehicleId: number,
      itemId: number,
      update: {
        expected_quantity?: number | null;
        actual_quantity?: number | null;
        status?: string | null;
        status_note?: string | null;
        is_checked?: boolean | null;
      },
      options: {
        trackCheckedChange?: boolean;
      } = {},
    ) => {
      const trackCheckedChange = options.trackCheckedChange ?? true;

      await fetchWithAuth(`/vehicles/${vehicleId}/items/${itemId}`, {
        method: "PATCH",
        body: update,
      });

      const currentItem = vehicleItems.find((item) => item.item_id === itemId);

      if (
        trackCheckedChange &&
        typeof update.is_checked === "boolean" &&
        currentItem &&
        Boolean(currentItem.is_checked) !== update.is_checked
      ) {
        const checkedDelta = update.is_checked ? 1 : -1;

        setVehicleCheckSummaryById((prev) => {
          const currentSummary = prev[vehicleId];

          if (!currentSummary) {
            return prev;
          }

          return {
            ...prev,
            [vehicleId]: {
              ...currentSummary,
              checked: Math.max(0, currentSummary.checked + checkedDelta),
            },
          };
        });
      }

      const localUpdate = trackCheckedChange
        ? update
        : Object.fromEntries(
            Object.entries(update).filter(
              ([key, value]) => key !== "is_checked" || value !== currentItem?.is_checked,
            ),
          );

      setVehicleItems((prev) => {
        const nextItems = prev.map((item) =>
          item.item_id === itemId ? { ...item, ...localUpdate } : item,
        );

        setVehicleCheckSummaryById((prevSummary) => {
          const currentSummary = prevSummary[vehicleId];

          if (!currentSummary) {
            return prevSummary;
          }

          return {
            ...prevSummary,
            [vehicleId]: getVehicleCheckSummary(nextItems),
          };
        });

        return nextItems;
      });
    },
    [vehicleItems],
  );

  const addVehicleItemToGroup = useCallback(
    async (
      vehicleId: number,
      sectionId: number,
      groupId: number | null,
      item: AddVehicleItemInput,
    ) => {
      const groupIdParam = groupId === null ? "null" : String(groupId);

      await fetchWithAuth(`/vehicles/${vehicleId}/sections/${sectionId}/groups/${groupIdParam}/items`, {
        method: "POST",
        body: { ...item },
      });

      setVehicleCheckSummaryById((prev) => {
        const currentSummary = prev[vehicleId];

        if (!currentSummary) {
          return prev;
        }

        return {
          ...prev,
          [vehicleId]: {
            checked: currentSummary.checked + (isCountableItem(item) && item.is_checked ? 1 : 0),
            total: currentSummary.total + (isCountableItem(item) ? 1 : 0),
          },
        };
      });

      await fetchVehicleItems(vehicleId);
    },
    [fetchVehicleItems],
  );

  const reorderVehicleItems = useCallback(
    async (vehicleId: number, orderedItemIds: number[]) => {
      await fetchWithAuth(`/vehicles/${vehicleId}/items/reorder`, {
        method: "PATCH",
        body: {
          item_ids: orderedItemIds,
        },
      });

      setVehicleItems((prev) => {
        const orderedItemIdSet = new Set(orderedItemIds);
        const itemsById = new Map(prev.map((item) => [item.item_id, item]));
        const orderedItems = orderedItemIds
          .map((itemId, index) => {
            const item = itemsById.get(itemId);

            return item ? { ...item, item_order: index + 1 } : null;
          })
          .filter((item): item is VehicleInventoryItem => item !== null);

        let insertedOrderedItems = false;
        const nextItems: VehicleInventoryItem[] = [];

        prev.forEach((item) => {
          if (!orderedItemIdSet.has(item.item_id)) {
            nextItems.push(item);
            return;
          }

          if (!insertedOrderedItems) {
            nextItems.push(...orderedItems);
            insertedOrderedItems = true;
          }
        });

        return nextItems;
      });
    },
    [],
  );

  const addVehicleGroup = useCallback(
    async (
      vehicleId: number,
      sectionId: number,
      group: {
        name: string;
        position_order?: number | null;
      },
    ) => {
      const response = await fetchWithAuth<{ group: VehicleGroup }>(
        `/vehicles/${vehicleId}/sections/${sectionId}/groups`,
        {
          method: "POST",
          body: { ...group },
        },
      );

      await fetchVehicleItems(vehicleId);

      return response.group;
    },
    [fetchVehicleItems],
  );

  const fetchVehicleVerification = useCallback(async (vehicleId: number) => {
    setVehicleVerificationLoading(true);

    try {
      const res = await fetchWithAuth<VehicleVerification>(`/vehicles/${vehicleId}/verification`);
      setCurrentVehicleVerification(res);
    } catch (err) {
      console.error("Error al verificar los vehiculos:", err);
    } finally {
      setVehicleVerificationLoading(false);
    }
  }, []);

  const value: VehiclesContextType = {
    vehicles,
    vehicleCheckSummaryById,
    vehicleItems,
    vehicleItemsLoading,
    vehicleItemsError,
    fetchVehicles,
    fetchVehicleItems,
    fetchVehicleVerification,
    currentVehicleVerification,
    vehiclePictures,
    vehiclePicturesLoading,
    vehiclePicturesError,
    fetchVehiclePictures,
    selectedVehiclePicture,
    selectedVehiclePictureLoading,
    selectedVehiclePictureError,
    fetchSingleVehiclePicture,
    updateVehicleInventoryStatus,
    uploadVehicleSignature,
    updateVehicleItem,
    reorderVehicleItems,
    addVehicleItemToGroup,
    addVehicleGroup,
    vehicleVerificationLoading,
    loading,
    error,
  };

  return (
    <VehiclesContext.Provider value={value}>
      {children}
    </VehiclesContext.Provider>
  );
};
