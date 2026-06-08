import { createContext } from "react";

export interface Vehicle {
  id: number;
  name: string;
  code: string;
  inventory_done: boolean;
  verified_at: string | null;
  signature_key: string | null;
}

export interface VehicleCheckSummary {
  checked: number;
  total: number;
}

export interface VehicleInventoryItem {
  vehicle_id: number;
  vehicle_code: string;
  vehicle_name: string;
  section_id: number;
  section_name: string;
  section_type: string | null;
  section_order: number;
  group_id: number | null;
  group_name: string | null;
  group_order: number | null;
  item_id: number;
  raw_description: string;
  expected_quantity: number | null;
  actual_quantity: number | null;
  status: string | null;
  status_note: string | null;
  is_checked: boolean | null;
  item_order: number;
}

export interface AddVehicleItemInput {
  raw_description: string;
  expected_quantity?: number | null;
  actual_quantity?: number | null;
  status?: string | null;
  status_note?: string | null;
  position_order?: number | null;
  is_checked?: boolean | null;
}

export interface VehicleGroup {
  id: number;
  section_id: number;
  name: string;
  position_order: number | null;
}

export interface VehicleVerification {
  vehicle_id: number;
  verified_at: string | null;
  signature_key: string | null;
  signature_url: string | null;
  checked_items: number;
  total_items: number;
  completion_percentage: number;
}

export interface VehiclesContextType {
  vehicles: Vehicle[];
  vehicleCheckSummaryById: Record<number, VehicleCheckSummary>;
  vehicleItems: VehicleInventoryItem[];
  vehicleItemsLoading: boolean;
  vehicleItemsError: string | null;
  fetchVehicles: () => Promise<void>;
  fetchVehicleItems: (vehicleId: number) => Promise<void>;
  fetchVehicleVerification: (vehicleId: number) => Promise<void>;
  currentVehicleVerification: VehicleVerification | null;
  updateVehicleInventoryStatus: (
    vehicleId: number,
    update: {
      inventory_done: boolean;
      verified_at: string | null;
      signature_key?: string | null;
    },
  ) => Promise<void>;
  vehicleVerificationLoading: boolean;
  uploadVehicleSignature: (
    vehicleId: number,
    signatureBase64: string,
  ) => Promise<{ signature_key: string }>;
  updateVehicleItem: (
    vehicleId: number,
    itemId: number,
    update: {
      expected_quantity?: number | null;
      actual_quantity?: number | null;
      status?: string | null;
      status_note?: string | null;
      is_checked?: boolean | null;
    },
    options?: {
      trackCheckedChange?: boolean;
    },
  ) => Promise<void>;
  reorderVehicleItems: (
    vehicleId: number,
    orderedItemIds: number[],
  ) => Promise<void>;
  addVehicleItemToGroup: (
    vehicleId: number,
    sectionId: number,
    groupId: number | null,
    item: AddVehicleItemInput,
  ) => Promise<void>;
  addVehicleGroup: (
    vehicleId: number,
    sectionId: number,
    group: {
      name: string;
      position_order?: number | null;
    },
  ) => Promise<VehicleGroup>;
  loading: boolean;
  error: string | null;
}

export const VehiclesContext = createContext<VehiclesContextType | undefined>(undefined);
