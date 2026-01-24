export class FilterService {
  constructor() {
    this.filters = {};
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
        return this.filters[col].some(range => val >= range.min && val <= range.max);
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
