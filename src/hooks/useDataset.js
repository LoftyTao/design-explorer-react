import { useState, useEffect } from 'react';
import { DatasetService } from '../services/DatasetService';
import { loadJSZip } from '../utils/fileUtils';

export function useDataset() {
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [viewSource, setViewSource] = useState('builtin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const datasetService = new DatasetService();

  useEffect(() => {
    loadJSZip().catch(err => console.error("Failed to load JSZip", err));
  }, []);

  useEffect(() => {
    const initExample = async () => {
      try {
        const loadedDatasets = await datasetService.loadBuiltin();
        setDatasets(loadedDatasets);
        if (loadedDatasets.length > 0) {
          const daylightDataset = loadedDatasets.find(d => d.id === 'daylight-factor');
          setActiveDatasetId(daylightDataset ? daylightDataset.id : loadedDatasets[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initExample();
  }, []);

  useEffect(() => {
    const currentDs = datasets.find(d => d.id === activeDatasetId);
    if (currentDs && currentDs.type !== viewSource) {
      const firstMatch = datasets.find(d => d.type === viewSource);
      if (firstMatch) {
        setActiveDatasetId(firstMatch.id);
      } else {
        setActiveDatasetId(null);
      }
    } else if (!activeDatasetId) {
      const firstMatch = datasets.find(d => d.type === viewSource);
      if (firstMatch) setActiveDatasetId(firstMatch.id);
    }
  }, [viewSource, datasets]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const handleFileDrop = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    await processFileUpload(file);
  };

  const processFileUpload = async (file) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const newDataset = await datasetService.handleFileUpload(file);
      setDatasets(prev => [...prev, newDataset]);
      setViewSource('uploaded');
      setActiveDatasetId(newDataset.id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const currentViewDatasets = datasets.filter(d => d.type === viewSource);

  return {
    datasets,
    activeDataset,
    activeDatasetId,
    setActiveDatasetId,
    viewSource,
    setViewSource,
    loading,
    errorMsg,
    setErrorMsg,
    handleFileUpload,
    handleFileDrop,
    currentViewDatasets
  };
}
