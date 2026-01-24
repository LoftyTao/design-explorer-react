import { createDataset, loadBuiltinDatasets, loadJSZip } from '../utils/fileUtils';

export class DatasetService {
  constructor() {
    this.datasets = [];
    this.objectUrls = [];
  }

  async loadBuiltin(onAddObjectUrl = null) {
    try {
      const loadedDatasets = await loadBuiltinDatasets((url) => {
        this.objectUrls.push(url);
        if (onAddObjectUrl) onAddObjectUrl(url);
      });
      this.datasets = loadedDatasets;
      return loadedDatasets;
    } catch (e) {
      console.error('Failed to load builtin datasets:', e);
      return [];
    }
  }

  async handleFileUpload(file, onAddObjectUrl = null) {
    const newId = `upload-${Date.now()}`;
    let newDataset = null;

    if (file.name.endsWith('.zip')) {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const csvFileName = Object.keys(zipContent.files).find(f => f.match(/data\.csv$/i));
      if (!csvFileName) throw new Error("Could not find 'data.csv' in the zip file.");
      const csvText = await zipContent.file(csvFileName).async("string");
      newDataset = await createDataset(newId, file.name, 'uploaded', csvText, zipContent, (url) => {
        this.objectUrls.push(url);
        if (onAddObjectUrl) onAddObjectUrl(url);
      });
    } else if (file.name.endsWith('.csv')) {
      const text = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsText(file);
      });
      newDataset = await createDataset(newId, file.name, 'uploaded', text);
    } else {
      throw new Error("Unsupported format");
    }

    if (newDataset) {
      this.datasets.push(newDataset);
      return newDataset;
    }
    throw new Error("Failed to create dataset");
  }

  getDatasetsByType(type) {
    return this.datasets.filter(d => d.type === type);
  }

  getDatasetById(id) {
    return this.datasets.find(d => d.id === id);
  }

  clearObjectUrls() {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
  }
}
