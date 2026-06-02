import { createContext } from 'react';

export interface ToolBox {
  id: number;
  name: string;
  code: string;
  inventory_done: boolean;
  verified_at: string | null;
  signature_key: string | null;
}

export interface ToolboxCheckSummary {
  checked: number;
  total: number;
}

export interface ToolboxInventoryItem {
  toolbox_id: number;
  toolbox_code: string;
  toolbox_name: string;
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
  tool_variant_id: number | null;
  variant_name: string | null;
  spanish_description: string | null;
  french_description: string | null;
  drive_size: string | null;
  measurement: string | null;
  length_type: string | null;
  impact: string | null;
  brand: string | null;
  tool_id: number | null;
  tool_spanish_name: string | null;
  tool_french_name: string | null;
}

export interface AddToolboxItemInput {
  tool_variant_id?: number | null;
  raw_description: string;
  expected_quantity?: number | null;
  actual_quantity?: number | null;
  status?: string | null;
  status_note?: string | null;
  position_order?: number | null;
  is_checked?: boolean | null;
}

export interface ToolboxGroup {
  id: number;
  section_id: number;
  name: string;
  position_order: number | null;
}


export interface ToolboxVerification {
  toolbox_id: number;
  verified_at: string | null;
  signature_url: string | null;
  checked_items: boolean;
  total_items: boolean;
  completion_percentage: number;
}



export interface ToolBoxesContextType {
  toolBoxes: ToolBox[];
  toolboxCheckSummaryById: Record<number, ToolboxCheckSummary>;
  toolboxItems: ToolboxInventoryItem[];
  toolboxItemsLoading: boolean;
  toolboxItemsError: string | null;
  fetchToolBoxes: () => Promise<void>;
  fetchToolboxItems: (toolboxId: number) => Promise<void>;
  fetchVerification: (toolboxId: number) => Promise<void>;
  currentVerification: ToolboxVerification | null;
    updateToolboxInventoryStatus: (
    toolboxId: number,
    update: {
      inventory_done: boolean;
      verified_at: string | null;
      signature_key?: string | null;
    },
  ) => Promise<void>;
verificationLoading: boolean;
  uploadToolboxSignature: (
    toolboxId: number,
    signatureBase64: string,
  ) => Promise<{ signature_key: string }>;
  updateToolboxItem: (
    toolboxId: number,
    itemId: number,
    update: {
      actual_quantity?: number | null;
      status?: string | null;
      status_note?: string | null;
      is_checked?: boolean | null;
    },
    options?: {
      trackCheckedChange?: boolean;
    },
  ) => Promise<void>;
  reorderToolboxItems: (
    toolboxId: number,
    orderedItemIds: number[],
  ) => Promise<void>;
  addToolboxItemToGroup: (
    toolboxId: number,
    sectionId: number,
    groupId: number | null,
    item: AddToolboxItemInput,
  ) => Promise<void>;
  addToolboxGroup: (
    toolboxId: number,
    sectionId: number,
    group: {
      name: string;
      position_order?: number | null;
    },
  ) => Promise<ToolboxGroup>;

  loading: boolean;
  error: string | null;
}

export const ToolBoxesContext = createContext<ToolBoxesContextType | undefined>(undefined);
