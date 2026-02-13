import { useState, useEffect, useMemo, useRef } from 'react';
import SplashScreen from './SplashScreen';
import { Header } from './components/layout/Header';
import { ErrorMessage } from './components/layout/ErrorMessage';
import { DocsModal } from './components/ui/DocsModal';
import { EmptyState } from './components/ui/EmptyState';
import { ParallelCoordinates } from './components/visualization/ParallelCoordinates';
import { InteractiveTable } from './components/visualization/InteractiveTable';
import { GalleryGrid } from './components/gallery/GalleryGrid';
import { GalleryDetail } from './components/gallery/GalleryDetail';
import { useDataset } from './hooks/useDataset';
import { useFilters } from './hooks/useFilters';
import { useSort } from './hooks/useSort';
import { useSelection } from './hooks/useSelection';
import { useDragOrder } from './hooks/useDragOrder';
import { loadJSZip } from './utils/fileUtils';
import { cleanName } from './utils/constants';
import { Images, BarChart3, Table, GripVertical } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  const [colorBy, setColorBy] = useState('');
  const [paletteName, setPaletteName] = useState('nuancedLadybug');
  const [legendPosition, setLegendPosition] = useState('right');
  const [showTextCols, setShowTextCols] = useState(true);
  const [activeImgCol, setActiveImgCol] = useState(null);
  const [imageFitMode, setImageFitMode] = useState('contain');
  const [galleryPage, setGalleryPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const itemsPerPage = 50;

  const {
    order: panelOrder,
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useDragOrder(['parallel', 'table', 'gallery']);

  const {
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
  } = useDataset();

  const { data, columns, numericCols, stringCols, ranges } = activeDataset || { data: [], columns: { in: [], out: [], img: [] }, numericCols: [], stringCols: [], ranges: {} };

  const { filters, filteredData, addFilter, removeFilter, clearColumnFilter, resetAllFilters } = useFilters(data, stringCols);
  const { sortConfig, sortedData, handleSort, clearSorts } = useSort(filteredData);
  const { selectedIds, galleryActiveId, galleryActiveIdKey, setGalleryActiveId, toggleRowSelection, clearSelection } = useSelection(sortedData);
  const prevDatasetIdRef = useRef(null);

  useEffect(() => {
    loadJSZip().catch(err => console.error("Failed to load JSZip", err));
  }, []);

  useEffect(() => {
    if (activeDataset && activeDatasetId !== prevDatasetIdRef.current) {
      setColorBy(activeDataset.defaultColorBy);
      setActiveImgCol(activeDataset.defaultImgCol);
      setGalleryPage(1);
      setTablePage(1);
      resetAllFilters();
      clearSorts();
      clearSelection();
      prevDatasetIdRef.current = activeDatasetId;
    }
  }, [activeDataset, activeDatasetId, resetAllFilters, clearSorts, clearSelection]);

  const activeGalleryItem = useMemo(() => data.find(d => d.id === galleryActiveId), [data, galleryActiveId]);

  useEffect(() => {
    if (galleryActiveId && sortedData.length > 0) {
      const index = sortedData.findIndex(d => d.id === galleryActiveId);
      if (index !== -1) {
        const newPage = Math.ceil((index + 1) / itemsPerPage);
        console.log('表格跳转信息:', { galleryActiveId, index, newPage, totalItems: sortedData.length });
        setTablePage(newPage);
      } else {
        console.log('未找到对应的 ID:', galleryActiveId);
      }
    }
  }, [galleryActiveIdKey, galleryActiveId, sortedData, itemsPerPage]);

  useEffect(() => {
    if (galleryActiveId && sortedData.length > 0) {
      const index = sortedData.findIndex(d => d.id === galleryActiveId);
      if (index !== -1) {
        const newPage = Math.ceil((index + 1) / itemsPerPage);
        console.log('画廊跳转信息:', { galleryActiveId, index, newPage, totalItems: sortedData.length });
        setGalleryPage(newPage);
      }
    }
  }, [galleryActiveIdKey, galleryActiveId, sortedData, itemsPerPage]);

  return (
    <>
      <SplashScreen visible={showSplash} onAnimationComplete={() => setShowSplash(false)} />
      
      <div className="flex h-screen flex-col bg-zinc-50 text-zinc-800 font-sans selection:bg-cyan-100 selection:text-cyan-900">
        <Header 
          viewSource={viewSource}
          setViewSource={setViewSource}
          activeDatasetId={activeDatasetId}
          setActiveDatasetId={setActiveDatasetId}
          currentViewDatasets={currentViewDatasets}
          loading={loading}
          handleFileUpload={handleFileUpload}
          showDocs={showDocs}
          setShowDocs={setShowDocs}
        />

        <ErrorMessage errorMsg={errorMsg} />

        <DocsModal visible={showDocs} onClose={() => setShowDocs(false)} />

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-50">
          <div className="w-[80%] mx-auto flex flex-col py-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden pb-6">
              {viewSource === 'uploaded' && data.length === 0 ? (
                <EmptyState 
                  title="No Data Uploaded"
                  description="Upload a .zip or .csv file to start exploring your design data."
                  onDrop={handleFileDrop}
                />
              ) : (
                <>
                  {panelOrder.map((panelId) => {
                    if (panelId === 'parallel' && data.length > 0) {
                      return (
                        <div
                          key="parallel"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'parallel')}
                          onDragOver={(e) => handleDragOver(e, 'parallel')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'parallel')}
                          onDragEnd={handleDragEnd}
                          className={`transition-all duration-200 ${draggedItem === 'parallel' ? 'opacity-50 scale-[0.98]' : ''} ${dragOverItem === 'parallel' && draggedItem !== 'parallel' ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
                        >
                          <ParallelCoordinates 
                            data={data} 
                            filteredData={filteredData} 
                            columns={columns} 
                            numericCols={numericCols}
                            stringCols={stringCols}
                            ranges={ranges} 
                            filters={filters}
                            selectedIds={selectedIds}
                            colorBy={colorBy}
                            paletteName={paletteName}
                            legendPosition={legendPosition}
                            showTextCols={showTextCols}
                            setShowTextCols={setShowTextCols}
                            onAddFilter={addFilter}
                            onRemoveFilter={removeFilter}
                            onClearColumnFilter={clearColumnFilter}
                            setColorBy={setColorBy}
                            setPaletteName={setPaletteName}
                            setLegendPosition={setLegendPosition}
                            resetAllFilters={resetAllFilters}
                            onExport={async (format) => {
                              const svgElement = document.querySelector('svg.overflow-visible.shrink-0');
                              if (!svgElement) return;
                              const { ExportService } = await import('./services/ExportService');
                              await ExportService.export(format, svgElement);
                            }}
                          />
                        </div>
                      );
                    }

                    if (panelId === 'table' && data.length > 0) {
                      return (
                        <div
                          key="table"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'table')}
                          onDragOver={(e) => handleDragOver(e, 'table')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'table')}
                          onDragEnd={handleDragEnd}
                          className={`transition-all duration-200 ${draggedItem === 'table' ? 'opacity-50 scale-[0.98]' : ''} ${dragOverItem === 'table' && draggedItem !== 'table' ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
                        >
                          <InteractiveTable 
                            data={sortedData} 
                            columns={columns} 
                            selectedIds={selectedIds} 
                            onRowToggle={toggleRowSelection} 
                            onClearSelection={clearSelection} 
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onClearSorts={clearSorts}
                            currentPage={tablePage}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setTablePage}
                            paletteName={paletteName}
                          />
                        </div>
                      );
                    }

                    if (panelId === 'gallery' && columns.img.length > 0) {
                      return (
                        <div
                          key="gallery"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'gallery')}
                          onDragOver={(e) => handleDragOver(e, 'gallery')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'gallery')}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-lg border border-zinc-200 shadow-sm mx-6 mt-6 overflow-hidden flex flex-col h-[500px] sm:h-[600px] lg:h-[800px] shrink-0 mb-6 transition-all duration-200 ${draggedItem === 'gallery' ? 'opacity-50 scale-[0.98]' : ''} ${dragOverItem === 'gallery' && draggedItem !== 'gallery' ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
                        >
                          <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-zinc-700 cursor-grab active:cursor-grabbing">
                                <GripVertical size={14} className="text-zinc-400" />
                                <Images size={16} strokeWidth={2} className="mt-0.5" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider">Visual Gallery</h3>
                              </div>
                              {sortConfig.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center border-l border-zinc-200 pl-4">
                                  <span className="text-[10px] font-medium text-zinc-400 uppercase">Active Sorts</span>
                                  {sortConfig.map((sc, idx) => (
                                    <button 
                                      key={sc.key}
                                      onClick={() => handleSort(sc.key)} 
                                      className="flex items-center gap-1 px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded-full border border-zinc-200 text-[10px] hover:bg-zinc-100 transition-colors"
                                      title="Toggle or remove"
                                    >
                                      <span className="font-medium">{idx + 1}. {cleanName(sc.key)}</span>
                                    </button>
                                  ))}
                                  <button onClick={clearSorts} className="text-[10px] text-zinc-400 hover:text-red-500 hover:underline">Clear</button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {columns.img.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-medium text-zinc-400 uppercase">Source</span>
                                  <div className="relative">
                                    <select 
                                      value={activeImgCol || ''} 
                                      onChange={(e) => setActiveImgCol(e.target.value)}
                                      className="text-xs appearance-none bg-zinc-50 border border-zinc-200 rounded-sm pl-2 pr-8 py-1 focus:outline-none focus:border-zinc-400 cursor-pointer text-zinc-700"
                                    >
                                      {columns.img.map(col => (
                                        <option key={col} value={col}>{col.replace('img:', '').replace(/_/g, ' ')}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-400 italic">No image data</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-1 overflow-hidden">
                            <div className="w-1/3 border-r border-zinc-100 bg-zinc-50/50 overflow-hidden flex flex-col">
                              <GalleryGrid 
                                sortedData={sortedData}
                                galleryActiveId={galleryActiveId}
                                selectedIds={selectedIds}
                                setGalleryActiveId={setGalleryActiveId}
                                toggleRowSelection={toggleRowSelection}
                                activeImgCol={activeImgCol}
                                colorBy={colorBy}
                                ranges={ranges}
                                paletteName={paletteName}
                                currentPage={galleryPage}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setGalleryPage}
                              />
                            </div>

                            <div className="w-2/3 h-full bg-white flex flex-col overflow-hidden">
                              <GalleryDetail 
                                activeGalleryItem={activeGalleryItem}
                                activeImgCol={activeImgCol}
                                columns={columns}
                                colorBy={colorBy}
                                ranges={ranges}
                                paletteName={paletteName}
                                imageFitMode={imageFitMode}
                                setImageFitMode={setImageFitMode}
                                selectedIds={selectedIds}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
