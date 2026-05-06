import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchWithAuth } from '../../Utils/fetchWithAuth';
import {
  ToolBoxesContext,
  type ToolBox,
  type ToolboxInventoryItem,
  type ToolBoxesContextType,
} from './ToolBoxesContext';

interface ToolBoxesProviderProps {
  children: ReactNode;
}

export const ToolBoxesProvider: React.FC<ToolBoxesProviderProps> = ({ children }) => {
  const [toolBoxes, setToolBoxes] = useState<ToolBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolboxItems, setToolboxItems] = useState<ToolboxInventoryItem[]>([]);
  const [toolboxItemsLoading, setToolboxItemsLoading] = useState(false);
  const [toolboxItemsError, setToolboxItemsError] = useState<string | null>(null);

  const fetchToolBoxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<ToolBox[]>("/toolboxes");
      setToolBoxes(data);
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


  useEffect(() => {
    const loadToolBoxes = async () => {
      await fetchToolBoxes();
    };

    void loadToolBoxes();
  }, [fetchToolBoxes]);

  const updateToolboxItem = useCallback(
    async (
      toolboxId: number,
      itemId: number,
      update: {
        actual_quantity?: number | null;
        status?: string | null;
        status_note?: string | null;
        is_checked?: boolean | null;
      },
    ) => {
      await fetchWithAuth(`/toolboxes/${toolboxId}/items/${itemId}`, {
        method: 'PATCH',
        body: update,
      });

      setToolboxItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, ...update } : item,
        ),
      );
    },
    [],
  );

  const value: ToolBoxesContextType = {
    toolBoxes,
    toolboxItems,
    toolboxItemsLoading,
    toolboxItemsError,
    fetchToolBoxes,
    fetchToolboxItems,
    updateToolboxItem,
    loading,
    error,
  };

  return (
    <ToolBoxesContext.Provider value={value}>
      {children}
    </ToolBoxesContext.Provider>
  );
};