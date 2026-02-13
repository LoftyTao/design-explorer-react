export class FilterService {
  constructor() {
    this.filters = {};
    this.stringColMaps = {};
  }

  setStringColMap(col, values) {
    this.stringColMaps[col] = values;
  }

  addFilter(col, range) {
    if (!this.filters[col]) {
      this.filters[col] = [];
    }
    this.filters[col].push(range);
    return { ...this.filters };
  }

  removeFilter(col, index) {
    if (!this.filters[col]) return this.filters;
    
    const newFilters = this.filters[col].filter((_, i) => i !== index);
    if (newFilters.length === 0) {
      const { [col]: _, ...rest } = this.filters;
      this.filters = rest;
    } else {
      this.filters = { ...this.filters, [col]: newFilters };
    }
    return { ...this.filters };
  }

  clearColumnFilter(col) {
    const { [col]: _, ...rest } = this.filters;
    this.filters = rest;
    return { ...this.filters };
  }

  resetAllFilters() {
    this.filters = {};
    return { ...this.filters };
  }

  applyFilters(data) {
    return data.filter(row => {
      return Object.keys(this.filters).every(col => {
        const val = row[col];
        const values = this.stringColMaps[col];
        
        if (values && typeof val === 'string') {
          const valIndex = values.indexOf(val);
          if (valIndex === -1) return false;
          return this.filters[col].some(range => valIndex >= range.min && valIndex <= range.max);
        }
        
        if (typeof val === 'number') {
          return this.filters[col].some(range => val >= range.min && val <= range.max);
        }
        
        return true;
      });
    });
  }

  getFilters() {
    return { ...this.filters };
  }

  hasFilters() {
    return Object.keys(this.filters).length > 0;
  }
}
