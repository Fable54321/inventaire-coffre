import { useContext } from 'react';
import { ToolBoxesContext } from './ToolBoxesContext';

export const useToolBoxes = () => {
  const context = useContext(ToolBoxesContext);
  if (!context) {
    throw new Error('useToolBoxes must be used within a ToolBoxesProvider');
  }
  return context;
};