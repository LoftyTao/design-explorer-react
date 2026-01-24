import { useState, useEffect } from 'react';

export function useSelection(sortedData) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [galleryActiveId, setGalleryActiveId] = useState(null);

  useEffect(() => {
    if (sortedData.length > 0) {
      if (!galleryActiveId || !sortedData.find(d => d.id === galleryActiveId)) {
        setGalleryActiveId(sortedData[0].id);
      }
    } else {
      setGalleryActiveId(null);
    }
  }, [sortedData, galleryActiveId]);

  const toggleRowSelection = (id) => {
    if (selectedIds.has(id) && selectedIds.size === 1) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set([id]));
      setGalleryActiveId(id);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedIds,
    galleryActiveId,
    setGalleryActiveId,
    toggleRowSelection,
    clearSelection
  };
}
