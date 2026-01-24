import { useState, useMemo } from 'react';

export function useSort(data) {
  const [sortConfig, setSortConfig] = useState([]);

  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return data;
    
    const sorted = [...data];
    sorted.sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal !== bVal) {
          const comparison = aVal < bVal ? -1 : 1;
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(item => item.key === key);
      if (existingIndex === -1) {
        return [...prev, { key, direction: 'asc' }];
      } else {
        const currentDir = prev[existingIndex].direction;
        if (currentDir === 'asc') {
          const newConfig = [...prev];
          newConfig[existingIndex] = { ...newConfig[existingIndex], direction: 'desc' };
          return newConfig;
        } else {
          return prev.filter(item => item.key !== key);
        }
      }
    });
  };

  const clearSorts = () => setSortConfig([]);

  return {
    sortConfig,
    sortedData,
    handleSort,
    clearSorts
  };
}
