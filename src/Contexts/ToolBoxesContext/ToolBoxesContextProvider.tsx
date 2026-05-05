import { useState, useEffect, type ReactNode } from 'react';
import { fetchWithAuth } from '../../Utils/fetchWithAuth';
import { ToolBoxesContext, type ToolBox, type ToolBoxesContextType } from './ToolBoxesContext';

interface ToolBoxesProviderProps {
  children: ReactNode;
}

export const ToolBoxesProvider: React.FC<ToolBoxesProviderProps> = ({ children }) => {
  const [toolBoxes, setToolBoxes] = useState<ToolBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToolBoxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<ToolBox[]>("/toolboxes");
      setToolBoxes(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des coffres à outils :", err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolBoxes();
  }, []);

  const value: ToolBoxesContextType = {
    toolBoxes,
    fetchToolBoxes,
    loading,
    error,
  };

  return (
    <ToolBoxesContext.Provider value={value}>
      {children}
    </ToolBoxesContext.Provider>
  );
};