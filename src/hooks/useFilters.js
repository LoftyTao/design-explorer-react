import { useState, useMemo, useRef, useEffect } from 'react';
import { FilterService } from '../services/FilterService';

export function useFilters(data) {
  const [filters, setFilters] = useState({});
  const filterServiceRef = useRef(new FilterService());
  const prevDataRef = useRef(null);

  useEffect(() => {
    const currentDataId = data.length > 0 ? data[0].id : null;
    const prevDataId = prevDataRef.current;

    if (currentDataId !== prevDataId) {
      const newFilters = filterServiceRef.current.resetAllFilters();
      setFilters(newFilters);
      prevDataRef.current = currentDataId;
    }
  }, [data]);

  const filteredData = useMemo(() => {
    return filterServiceRef.current.applyFilters(data);
  }, [data, filters]);

  const addFilter = (col, range) => {
    const newFilters = filterServiceRef.current.addFilter(col, range);
    setFilters(newFilters);
  };

  const removeFilter = (col, index) => {
    const newFilters = filterServiceRef.current.removeFilter(col, index);
    setFilters(newFilters);
  };

  const clearColumnFilter = (col) => {
    const newFilters = filterServiceRef.current.clearColumnFilter(col);
    setFilters(newFilters);
  };

  const resetAllFilters = () => {
    const newFilters = filterServiceRef.current.resetAllFilters();
    setFilters(newFilters);
  };

  return {
    filters,
    filteredData,
    addFilter,
    removeFilter,
    clearColumnFilter,
    resetAllFilters,
    hasFilters: filterServiceRef.current.hasFilters()
  };
}
