import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchWithAuth } from '../../Utils/fetchWithAuth';
import {
  ToolBoxesContext,
  type ToolBox,
  type AddToolboxItemInput,
  type ToolboxCheckSummary,
  type ToolboxGroup,
  type ToolboxInventoryItem,
  type ToolBoxesContextType,
  type ToolboxVerification,
  type ToolboxPicture,
} from './ToolBoxesContext';

interface ToolBoxesProviderProps {
  children: ReactNode;
}

const isCountableItem = (item: { expected_quantity?: number | null }) =>
  (item.expected_quantity ?? 0) > 0;

const getToolboxCheckSummary = (items: ToolboxInventoryItem[]): ToolboxCheckSummary => {
  const countableItems = items.filter(isCountableItem);

  return {
    checked: countableItems.filter((item) => item.is_checked).length,
    total: countableItems.length,
  };
};

export const ToolBoxesProvider: React.FC<ToolBoxesProviderProps> = ({ children }) => {
  const [toolBoxes, setToolBoxes] = useState<ToolBox[]>([]);
  const [toolboxCheckSummaryById, setToolboxCheckSummaryById] = useState<Record<number, ToolboxCheckSummary>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolboxItems, setToolboxItems] = useState<ToolboxInventoryItem[]>([]);
  const [toolboxItemsLoading, setToolboxItemsLoading] = useState(false);
  const [toolboxItemsError, setToolboxItemsError] = useState<string | null>(null);
  const [currentVerification, setCurrentVerification] = useState<ToolboxVerification | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [toolboxPictures, setToolboxPictures] = useState<ToolboxPicture[]>([]);
const [toolboxPicturesLoading, setToolboxPicturesLoading] = useState(false);
const [toolboxPicturesError, setToolboxPicturesError] = useState<string | null>(null);

  const fetchToolBoxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<ToolBox[]>("/toolboxes");
      setToolBoxes(data);
      const summaries = await Promise.all(
        data.map(async (toolbox) => {
          const items = await fetchWithAuth<ToolboxInventoryItem[]>(`/toolboxes/${toolbox.id}/items`);

          return [
            toolbox.id,
            getToolboxCheckSummary(items),
          ] as const;
        }),
      );

      setToolboxCheckSummaryById(Object.fromEntries(summaries));
    } catch (err) {
      console.error("Error al recuperar las cajas de herramientas :", err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchToolboxItems = useCallback(async (toolboxId: number) => {
    setToolboxItemsLoading(true);
    setToolboxItemsError(null);
    try {
      const items = await fetchWithAuth<ToolboxInventoryItem[]>(`/toolboxes/${toolboxId}/items`);
      setToolboxItems(items);
    } catch (err) {
      console.error(`Error al recuperar los artículos de la caja ${toolboxId} :`, err);
      const message = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
      setToolboxItemsError(message);
      throw err;
    } finally {
      setToolboxItemsLoading(false);
    }
  }, []);

const fetchToolboxPictures = useCallback(async (toolboxId: number) => {
  setToolboxPicturesLoading(true);
  setToolboxPicturesError(null);

  try {
    const pictures = await fetchWithAuth<ToolboxPicture[]>(
      `/toolboxes/${toolboxId}/pictures`,
    );

    setToolboxPictures(pictures);
  } catch (err) {
    console.error(`Error al recuperar las fotos de la caja ${toolboxId} :`, err);

    const message =
      err instanceof Error ? err.message : 'Ocurrió un error desconocido';

    setToolboxPicturesError(message);
    throw err;
  } finally {
    setToolboxPicturesLoading(false);
  }
}, []);


  useEffect(() => {
    const loadToolBoxes = async () => {
      await fetchToolBoxes();
    };

    void loadToolBoxes();
  }, [fetchToolBoxes]);

const updateToolboxInventoryStatus = useCallback(
  async (
    toolboxId: number,
    update: { inventory_done: boolean; verified_at: string | null; signature_key?: string | null },
  ) => {
    await fetchWithAuth(`/toolboxes/${toolboxId}`, {
      method: 'PATCH',
      body: update,
    });

    setToolBoxes((prev) =>
      prev.map((toolbox) =>
        toolbox.id === toolboxId
          ? { ...toolbox, ...update }
          : toolbox,
      ),
    );
  },
  [],
);

  const uploadToolboxSignature = useCallback(
    async (toolboxId: number, signatureBase64: string) => {
      return fetchWithAuth<{ signature_key: string }>(`/toolboxes/${toolboxId}/signature`, {
        method: 'POST',
        body: {
          signatureBase64,
        },
      });
    },
    [],
  );

  const updateToolboxItem = useCallback(
    async (
      toolboxId: number,
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

      await fetchWithAuth(`/toolboxes/${toolboxId}/items/${itemId}`, {
        method: 'PATCH',
        body: update,
      });

      const currentItem = toolboxItems.find((item) => item.item_id === itemId);
      if (
        trackCheckedChange &&
        typeof update.is_checked === 'boolean' &&
        currentItem &&
        Boolean(currentItem.is_checked) !== update.is_checked
      ) {
        const checkedDelta = update.is_checked ? 1 : -1;
        setToolboxCheckSummaryById((prev) => {
          const currentSummary = prev[toolboxId];

          if (!currentSummary) {
            return prev;
          }

          return {
            ...prev,
            [toolboxId]: {
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
              ([key, value]) => key !== 'is_checked' || value !== currentItem?.is_checked,
            ),
          );

      setToolboxItems((prev) => {
        const nextItems = prev.map((item) =>
          item.item_id === itemId ? { ...item, ...localUpdate } : item,
        );

        setToolboxCheckSummaryById((prevSummary) => {
          const currentSummary = prevSummary[toolboxId];

          if (!currentSummary) {
            return prevSummary;
          }

          return {
            ...prevSummary,
            [toolboxId]: getToolboxCheckSummary(nextItems),
          };
        });

        return nextItems;
      });
    },
    [toolboxItems],
  );

  const addToolboxItemToGroup = useCallback(
    async (
      toolboxId: number,
      sectionId: number,
      groupId: number | null,
      item: AddToolboxItemInput,
    ) => {
      const groupIdParam = groupId === null ? 'null' : String(groupId);

      await fetchWithAuth(`/toolboxes/${toolboxId}/sections/${sectionId}/groups/${groupIdParam}/items`, {
        method: 'POST',
        body: { ...item },
      });

      setToolboxCheckSummaryById((prev) => {
        const currentSummary = prev[toolboxId];

        if (!currentSummary) {
          return prev;
        }

        return {
          ...prev,
          [toolboxId]: {
            checked: currentSummary.checked + (isCountableItem(item) && item.is_checked ? 1 : 0),
            total: currentSummary.total + (isCountableItem(item) ? 1 : 0),
          },
        };
      });

      await fetchToolboxItems(toolboxId);
    },
    [fetchToolboxItems],
  );

  const reorderToolboxItems = useCallback(
    async (toolboxId: number, orderedItemIds: number[]) => {
      await fetchWithAuth(`/toolboxes/${toolboxId}/items/reorder`, {
        method: 'PATCH',
        body: {
          item_ids: orderedItemIds,
        },
      });

      setToolboxItems((prev) => {
        const orderedItemIdSet = new Set(orderedItemIds);
        const itemsById = new Map(prev.map((item) => [item.item_id, item]));
        const orderedItems = orderedItemIds
          .map((itemId, index) => {
            const item = itemsById.get(itemId);

            return item ? { ...item, item_order: index + 1 } : null;
          })
          .filter((item): item is ToolboxInventoryItem => item !== null);

        let insertedOrderedItems = false;
        const nextItems: ToolboxInventoryItem[] = [];

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

  const addToolboxGroup = useCallback(
    async (
      toolboxId: number,
      sectionId: number,
      group: {
        name: string;
        position_order?: number | null;
      },
    ) => {
      const response = await fetchWithAuth<{ group: ToolboxGroup }>(
        `/toolboxes/${toolboxId}/sections/${sectionId}/groups`,
        {
          method: 'POST',
          body: { ...group },
        },
      );

      await fetchToolboxItems(toolboxId);

      return response.group;
    },
    [fetchToolboxItems],
  );


    const fetchVerification = useCallback(async (toolboxId: number) => {

      setVerificationLoading(true);

    try {
      const res : ToolboxVerification =await fetchWithAuth(`/toolboxes/${toolboxId}/verification`);

      setCurrentVerification(res);

      setVerificationLoading(false);
      
    } catch (err) {
      console.error('Error al verificar las cajas de herramientas', err);
    }
  },[]);

  const value: ToolBoxesContextType = {
    toolBoxes,
    toolboxCheckSummaryById,
    toolboxItems,
    toolboxItemsLoading,
    toolboxItemsError,
    fetchToolBoxes,
    fetchToolboxItems,
    toolboxPictures,
toolboxPicturesLoading,
toolboxPicturesError,
fetchToolboxPictures,
    fetchVerification,
    currentVerification,
    updateToolboxInventoryStatus,
    uploadToolboxSignature,
    updateToolboxItem,
    reorderToolboxItems,
    addToolboxItemToGroup,
    addToolboxGroup,
    verificationLoading,
    loading,
    error,
  };



  return (
    <ToolBoxesContext.Provider value={value}>
      {children}
    </ToolBoxesContext.Provider>
  );
};
