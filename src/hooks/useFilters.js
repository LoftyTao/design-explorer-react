import { useState, useMemo, useRef } from 'react';
import { FilterService } from '../services/FilterService';

export function useFilters(data) {
  const [filters, setFilters] = useState({});
  const filterServiceRef = useRef(new FilterService());

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
