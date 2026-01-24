import { useState, useEffect, useRef } from 'react';

export function useSelection(sortedData) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [galleryActiveId, setGalleryActiveId] = useState(null);
  const [galleryActiveIdKey, setGalleryActiveIdKey] = useState(0);
  const prevDataRef = useRef(null);

  useEffect(() => {
    const currentDataId = sortedData.length > 0 ? sortedData[0].id : null;
    const prevDataId = prevDataRef.current;

    if (currentDataId !== prevDataId) {
      if (sortedData.length > 0) {
        setGalleryActiveId(sortedData[0].id);
        setSelectedIds(new Set());
      } else {
        setGalleryActiveId(null);
        setSelectedIds(new Set());
      }
      prevDataRef.current = currentDataId;
    }
  }, [sortedData]);

  const toggleRowSelection = (id) => {
    setGalleryActiveId(id);
    setGalleryActiveIdKey(prev => prev + 1);
    
    if (selectedIds.has(id) && selectedIds.size === 1) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedIds,
    galleryActiveId,
    galleryActiveIdKey,
    setGalleryActiveId,
    toggleRowSelection,
    clearSelection
  };
}
