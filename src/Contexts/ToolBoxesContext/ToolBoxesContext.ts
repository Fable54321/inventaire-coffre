import { createContext } from 'react';

export interface ToolBox {
  id: number;
  name: string;
  code: string;
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

export interface ToolBoxesContextType {
  toolBoxes: ToolBox[];
  toolboxCheckSummaryById: Record<number, ToolboxCheckSummary>;
  toolboxItems: ToolboxInventoryItem[];
  toolboxItemsLoading: boolean;
  toolboxItemsError: string | null;
  fetchToolBoxes: () => Promise<void>;
  fetchToolboxItems: (toolboxId: number) => Promise<void>;
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
  loading: boolean;
  error: string | null;
}

export const ToolBoxesContext = createContext<ToolBoxesContextType | undefined>(undefined);
