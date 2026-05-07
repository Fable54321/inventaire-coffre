import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchWithAuth } from '../../Utils/fetchWithAuth';
import {
  ToolBoxesContext,
  type ToolBox,
  type ToolboxCheckSummary,
  type ToolboxInventoryItem,
  type ToolBoxesContextType,
} from './ToolBoxesContext';

interface ToolBoxesProviderProps {
  children: ReactNode;
}

export const ToolBoxesProvider: React.FC<ToolBoxesProviderProps> = ({ children }) => {
  const [toolBoxes, setToolBoxes] = useState<ToolBox[]>([]);
  const [toolboxCheckSummaryById, setToolboxCheckSummaryById] = useState<Record<number, ToolboxCheckSummary>>({});
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
      const summaries = await Promise.all(
        data.map(async (toolbox) => {
          const items = await fetchWithAuth<ToolboxInventoryItem[]>(`/toolboxes/${toolbox.id}/items`);

          return [
            toolbox.id,
            {
              checked: items.filter((item) => item.is_checked).length,
              total: items.length,
            },
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

      const currentItem = toolboxItems.find((item) => item.item_id === itemId);
      if (
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

      setToolboxItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, ...update } : item,
        ),
      );
    },
    [toolboxItems],
  );

  const value: ToolBoxesContextType = {
    toolBoxes,
    toolboxCheckSummaryById,
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
