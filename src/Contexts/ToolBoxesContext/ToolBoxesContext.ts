import { createContext } from 'react';

export interface ToolBox {
  // Define the structure of a toolbox if known, otherwise use any
  id: string;
  name: string;
  code: string;
  // Add other properties as needed
}

export interface ToolBoxesContextType {
  toolBoxes: ToolBox[];
  fetchToolBoxes: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const ToolBoxesContext = createContext<ToolBoxesContextType | undefined>(undefined);