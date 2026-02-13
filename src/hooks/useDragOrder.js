import { useState, useCallback } from 'react';

export function useDragOrder(initialOrder) {
  const [order, setOrder] = useState(initialOrder);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = useCallback((e, id) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItem !== id) {
      setDragOverItem(id);
    }
  }, [dragOverItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      const newOrder = [...order];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetId);
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      setOrder(newOrder);
    }
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, order]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  return {
    order,
    setOrder,
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
}
