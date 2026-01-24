import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Upload, Filter, Image as ImageIcon, BarChart3, XCircle, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, Palette, Layout, Settings2, Layers, Maximize2, ArrowUp, ArrowDown, FolderOpen, FileArchive, Database, X, Minimize2, ZoomIn, Move, Download } from 'lucide-react';

const Card = ({ children, className = "", style = {} }) => (
  <div className={`bg-white border border-zinc-200 shadow-sm ${className}`} style={style}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-medium tracking-wide ${className}`}>
    {children}
  </span>
);

const loadJSZip = () => {
  return new Promise((resolve, reject) => {
    if (window.JSZip) return resolve(window.JSZip);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const COLOR_PALETTES = {
  originalLadybug: [
    [75, 107, 169], [115, 147, 202], [170, 200, 247], [193, 213, 208],
    [245, 239, 103], [252, 230, 74], [239, 156, 21], [234, 123, 0],
    [234, 74, 0], [234, 38, 0]
  ],
  nuancedLadybug: [
    [49, 54, 149], [69, 117, 180], [116, 173, 209], [171, 217, 233],
    [224, 243, 248], [255, 255, 191], [254, 224, 144], [253, 174, 97],
    [244, 109, 67], [215, 48, 39], [165, 0, 38]
  ],
  multiColoredLadybug: [
    [4, 25, 145], [7, 48, 224], [7, 88, 255], [1, 232, 255],
    [97, 246, 156], [166, 249, 86], [254, 244, 1], [255, 121, 0],
    [239, 39, 0], [138, 17, 0]
  ],
  cividis: [
    [0, 32, 81], [60, 77, 110], [127, 124, 117], [187, 175, 113], [253, 234, 69]
  ]
};

const PALETTE_NAMES = {
  originalLadybug: 'Original Ladybug',
  nuancedLadybug: 'Nuanced Ladybug',
  multiColoredLadybug: 'Multi-colored',
  cividis: 'Cividis'
};

const getColor = (value, min, max, paletteName = 'originalLadybug') => {
  if (value === undefined || value === null || min === undefined || max === undefined) return '#d4d4d8';
  
  const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.originalLadybug;
  
  if (min >= max) {
    const midColor = palette[Math.floor(palette.length / 2)];
    return `rgb(${midColor.join(',')})`;
  }
  
  let t = (value - min) / (max - min);
  t = Math.max(0, Math.min(1, t)); 
  
  const i = t * (palette.length - 1);
  const iLow = Math.floor(i);
  const iHigh = Math.ceil(i);
  const w = i - iLow; 
  
  const c1 = palette[iLow];
  const c2 = palette[iHigh];
  
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * w);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * w);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * w);
  
  return `rgb(${r},${g},${b})`;
};

const getGradientString = (paletteName, direction = 'to right') => {
    const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.originalLadybug;
    const stops = palette.map(c => `rgb(${c.join(',')})`).join(', ');
    return `linear-gradient(${direction}, ${stops})`;
};

const LegendBar = ({ min, max, paletteName, position }) => {
    const isVertical = position === 'left' || position === 'right';
    const gradientDir = isVertical ? 'to top' : 'to right';
    
    return (
        <div className={`flex ${isVertical ? 'flex-col h-full py-4 px-2' : 'flex-row w-full px-4 py-2'} items-center justify-center gap-2`}>
            {isVertical ? (
                <>
                    <span className="text-xs sm:text-[12.5px] text-zinc-700 font-mono whitespace-nowrap">
                        {max !== undefined ? max.toFixed(1) : ''}
                    </span>
                    <div 
                        className={`rounded-sm ${isVertical ? 'w-3 h-full' : 'h-3 w-full'}`}
                        style={{ background: getGradientString(paletteName, gradientDir) }}
                    ></div>
                    <span className="text-xs sm:text-[12.5px] text-zinc-700 font-mono whitespace-nowrap">
                        {min !== undefined ? min.toFixed(1) : ''}
                    </span>
                </>
            ) : (
                <>
                    <span className="text-xs sm:text-[12.5px] text-zinc-700 font-mono whitespace-nowrap">
                        {min !== undefined ? min.toFixed(1) : ''}
                    </span>
                    <div 
                        className={`rounded-sm ${isVertical ? 'w-3 h-full' : 'h-3 w-full'}`}
                        style={{ background: getGradientString(paletteName, gradientDir) }}
                    ></div>
                    <span className="text-xs sm:text-[12.5px] text-zinc-700 font-mono whitespace-nowrap">
                        {max !== undefined ? max.toFixed(1) : ''}
                    </span>
                </>
            )}
        </div>
    );
};

const ImageStage = ({ src, mode, onModeChange }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [src, mode]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e) => {
            if (mode !== 'cover') return;
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY * -0.001;
            setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 5));
        };
        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [mode]);

    const handleMouseDown = (e) => {
        if (mode !== 'cover') return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || mode !== 'cover') return;
        e.preventDefault();
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-zinc-50 overflow-hidden flex items-center justify-center group border border-zinc-100"
            style={{
                backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                cursor: mode === 'cover' ? (isDragging ? 'grabbing' : 'grab') : 'default',
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {src ? (
                <img 
                    src={src} 
                    alt="Preview" 
                    draggable={false}
                    className={`transition-transform shadow-xl shadow-zinc-200/50 rounded-sm origin-center select-none ${isDragging ? 'duration-0' : 'duration-200'} ${mode === 'contain' ? 'max-w-full max-h-full object-contain' : ''}`}
                    style={mode === 'cover' ? {
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        minWidth: '100%', minHeight: '100%', maxWidth: 'none', maxHeight: 'none', width: 'auto', height: 'auto', objectFit: 'cover' 
                    } : {}}
                />
            ) : (
                <div className="text-zinc-300 flex flex-col items-center select-none gap-2">
                    <Maximize2 size={32} strokeWidth={1.5} />
                    <span className="text-xs font-medium tracking-wide">NO IMAGE</span>
                </div>
            )}

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-md shadow-sm flex gap-0.5 p-0.5 z-10">
                <button 
                    onClick={() => onModeChange('contain')}
                    className={`p-1.5 rounded-sm transition-colors ${mode === 'contain' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    title="Fit"
                >
                    <Minimize2 size={14} />
                </button>
                <button 
                    onClick={() => onModeChange('cover')}
                    className={`p-1.5 rounded-sm transition-colors ${mode === 'cover' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    title="Interactive"
                >
                    <Move size={14} />
                </button>
            </div>
        </div>
    );
};

const ParallelCoordinates = ({ 
    data, filteredData, columns, ranges, filters, selectedIds, 
    colorBy, paletteName, legendPosition,
    onAddFilter, onRemoveFilter, onClearColumnFilter,
    setColorBy, setPaletteName, setLegendPosition,
    cleanName, resetAllFilters, onExport
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartHeight = Math.min(320, Math.max(200, containerWidth * 0.25));
  const padding = { top: 40, right: 40, bottom: 30, left: 40 };
  const [brushing, setBrushing] = useState(null); 

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) setContainerWidth(entries[0].contentRect.width);
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const legendThickness = 80; 
  const isLegendVertical = legendPosition === 'left' || legendPosition === 'right';
  const chartWidth = isLegendVertical ? containerWidth - legendThickness : containerWidth;
  const legendHeight = chartHeight + 40;
  const allCols = [...columns.in, ...columns.out];

  const selectedData = useMemo(() => {
      if (selectedIds.size === 0) return [];
      return data.filter(d => selectedIds.has(d.id));
  }, [data, selectedIds]);

  const getX = (colIndex) => padding.left + (colIndex / (allCols.length - 1)) * (chartWidth - padding.left - padding.right);
  const getY = (value, min, max) => {
    if (min === max) return chartHeight / 2;
    const normalized = (value - min) / (max - min);
    return chartHeight - padding.bottom - (normalized * (chartHeight - padding.top - padding.bottom));
  };
  const getValueFromY = (y, min, max) => {
      const h = chartHeight - padding.top - padding.bottom;
      const normalized = (chartHeight - padding.bottom - y) / h;
      return min + Math.max(0, Math.min(1, normalized)) * (max - min);
  };

  const handleMouseDown = (e, col) => {
    e.preventDefault();
    e.stopPropagation();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;
    const colFilters = filters[col] || [];
    const range = ranges[col];
    
    if (Math.abs(x - getX(allCols.indexOf(col))) < 20) {
        const clickedFilterIndex = colFilters.findIndex(f => {
            const y1 = getY(f.min, range.min, range.max);
            const y2 = getY(f.max, range.min, range.max);
            return y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
        });
        if (clickedFilterIndex !== -1) return onRemoveFilter(col, clickedFilterIndex);
    }
    setBrushing({ col, startY: y, currY: y });
  };

  const handleMouseMove = (e) => {
    if (!brushing || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setBrushing(prev => ({ ...prev, currY: e.clientY - rect.top }));
  };

  const handleMouseUp = () => {
    if (!brushing) return;
    const { col, startY, currY } = brushing;
    const range = ranges[col];
    if (Math.abs(startY - currY) < 3) {
      onClearColumnFilter(col);
    } else {
      const v1 = getValueFromY(startY, range.min, range.max);
      const v2 = getValueFromY(currY, range.min, range.max);
      onAddFilter(col, { min: Math.min(v1, v2), max: Math.max(v1, v2) });
    }
    setBrushing(null);
  };

  useEffect(() => {
    if (brushing) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [brushing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderLines = (dataset, strokeFn, opacity, strokeWidth) => (
    <g className="pointer-events-none">
      {dataset.map(row => {
        const stroke = typeof strokeFn === 'function' ? strokeFn(row) : strokeFn;
        const points = allCols.map((col, i) => `${getX(i)},${getY(row[col], ranges[col].min, ranges[col].max)}`).join(' ');
        return <polyline key={row.id} points={points} fill="none" stroke={stroke} opacity={opacity} strokeWidth={strokeWidth} />;
      })}
    </g>
  );

  if (allCols.length === 0) return null;

  const legendElement = colorBy && ranges[colorBy] ? (
      <div style={{ width: isLegendVertical ? legendThickness : '100%', height: isLegendVertical ? legendHeight : 50 }} className="shrink-0 border-zinc-100">
          <LegendBar min={ranges[colorBy].min} max={ranges[colorBy].max} paletteName={paletteName} position={legendPosition} />
      </div>
  ) : null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm mx-6 mt-6 overflow-hidden flex flex-col shrink-0">
      <div className="px-6 py-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-700 -mt-0.5">
                <BarChart3 size={16} strokeWidth={2} className="mt-0.5" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Parallel Coordinates</h3>
            </div>
            <div className="h-4 w-px bg-zinc-200"></div>
            <div className="relative export-menu-container">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-sm transition-colors"
                >
                    <Download size={14} />
                    Export
                </button>
                {showExportMenu && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-zinc-200 rounded-sm shadow-lg z-30 min-w-[80px]">
                        <button onClick={() => { onExport('png'); setShowExportMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 transition-colors">PNG</button>
                        <button onClick={() => { onExport('jpg'); setShowExportMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 transition-colors">JPG</button>
                        <button onClick={() => { onExport('svg'); setShowExportMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 transition-colors">SVG</button>
                    </div>
                )}
            </div>
            
            <div className="h-4 w-px bg-zinc-200"></div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Color</span>
                    <select 
                        value={colorBy} 
                        onChange={(e) => setColorBy(e.target.value)}
                        className="text-[10px] border border-zinc-200 rounded-sm px-2 py-0.5 bg-white focus:outline-none focus:border-zinc-400 text-zinc-700"
                    >
                        <optgroup label="Inputs">
                            {columns.in.map(col => <option key={col} value={col}>{cleanName(col)}</option>)}
                        </optgroup>
                        <optgroup label="Outputs">
                            {columns.out.map(col => <option key={col} value={col}>{cleanName(col)}</option>)}
                        </optgroup>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Palette</span>
                    <select 
                        value={paletteName} 
                        onChange={(e) => setPaletteName(e.target.value)}
                        className="text-[10px] border border-zinc-200 rounded-sm px-2 py-0.5 bg-white focus:outline-none focus:border-zinc-400 text-zinc-700"
                    >
                        {Object.keys(PALETTE_NAMES).map(key => <option key={key} value={key}>{PALETTE_NAMES[key]}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Legend</span>
                    <select 
                        value={legendPosition} 
                        onChange={(e) => setLegendPosition(e.target.value)}
                        className="text-[10px] border border-zinc-200 rounded-sm px-2 py-0.5 bg-white focus:outline-none focus:border-zinc-400 text-zinc-700"
                    >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="text-right">
                 <span className="block text-xl font-bold text-zinc-900 leading-none">{filteredData.length}</span>
                 <span className="text-[10px] text-zinc-400 uppercase font-medium">Items</span>
             </div>
             {Object.keys(filters).length > 0 && (
                <button onClick={resetAllFilters} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear Filters">
                    <XCircle size={18} strokeWidth={1.5} />
                </button>
             )}
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex w-full overflow-hidden items-center justify-center p-4 bg-white"
        style={{ 
            flexDirection: legendPosition === 'top' ? 'column' : legendPosition === 'bottom' ? 'column-reverse' : legendPosition === 'left' ? 'row' : 'row-reverse' 
        }}
      >
        {legendElement}

        <svg ref={svgRef} width={chartWidth} height={chartHeight} className="overflow-visible shrink-0">
            {renderLines(data, "#f4f4f5", 1, 1)}
            
            {renderLines(
                filteredData, 
                (row) => colorBy && ranges[colorBy] ? getColor(row[colorBy], ranges[colorBy].min, ranges[colorBy].max, paletteName) : "#52525b",
                selectedIds.size > 0 ? 0.05 : 0.6,
                1.5
            )}
            
            {renderLines(
                selectedData, 
                "#06b6d4",
                1, 
                3
            )}

            {allCols.map((col, i) => {
            const x = getX(i);
            const range = ranges[col];
            const colFilters = filters[col] || [];
            
            return (
                <g key={col}>
                <line x1={x} y1={padding.top} x2={x} y2={chartHeight - padding.bottom} stroke="#e4e4e7" strokeWidth="1" />
                <rect
                    x={x - 12} y={padding.top} width={24} height={chartHeight - padding.top - padding.bottom}
                    fill="transparent" className="cursor-crosshair hover:fill-zinc-50/50"
                    onMouseDown={(e) => handleMouseDown(e, col)}
                />
                <text x={x} y={padding.top - 30} textAnchor="middle" className={`text-[10px] font-bold uppercase tracking-wider ${colFilters.length > 0 ? 'fill-cyan-600' : 'fill-zinc-700'}`}>
                    {cleanName(col).length > 12 ? cleanName(col).substr(0, 10) + '..' : cleanName(col)}
                    <title>{cleanName(col)}</title>
                </text>
                <text x={x} y={chartHeight - padding.bottom + 15} textAnchor="middle" className="text-[12.5px] fill-zinc-700 font-mono pointer-events-none">{range.min.toFixed(1)}</text>
                <text x={x} y={padding.top - 5} textAnchor="middle" className="text-[12.5px] fill-zinc-700 font-mono pointer-events-none">{range.max.toFixed(1)}</text>
                {colFilters.map((filter, idx) => {
                    const y1 = getY(filter.min, range.min, range.max);
                    const y2 = getY(filter.max, range.min, range.max);
                    return <rect key={idx} x={x - 4} y={Math.min(y1, y2)} width={8} height={Math.abs(y1 - y2)} fill="#06b6d4" opacity={0.3} rx={1} className="pointer-events-none" />;
                })}
                {brushing && brushing.col === col && (
                    <rect x={x - 4} y={Math.min(brushing.startY, brushing.currY)} width={8} height={Math.abs(brushing.startY - brushing.currY)} fill="#06b6d4" opacity={0.5} rx={1} className="pointer-events-none" />
                )}
                </g>
            );
            })}
        </svg>
      </div>
    </div>
  );
};

const InteractiveTable = ({ data, columns, selectedIds, onRowToggle, onClearSelection, sortConfig, onSort, onClearSorts, cleanName }) => {
  const getSortIcon = (colKey) => {
    const configIndex = sortConfig.findIndex(s => s.key === colKey);
    if (configIndex === -1) return <ArrowUpDown size={10} className="opacity-20 ml-1" />;
    const config = sortConfig[configIndex];
    return (
      <div className="flex items-center text-cyan-600">
        {config.direction === 'asc' ? <ArrowUp size={10} className="ml-1" /> : <ArrowDown size={10} className="ml-1" />}
        {sortConfig.length > 1 && <span className="ml-0.5 text-[8px] font-bold bg-cyan-50 text-cyan-700 px-1 rounded">{configIndex + 1}</span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm mx-6 mt-6 flex flex-col shrink-0 overflow-hidden">
      <div className="px-6 py-2 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Data Table</h3>
            <div className="flex gap-3">
                {selectedIds.size > 0 && (
                    <button onClick={onClearSelection} className="flex items-center gap-1 text-[10px] text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                        <XCircle size={10} /> Clear Selection
                    </button>
                )}
                {sortConfig.length > 0 && (
                    <button onClick={onClearSorts} className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 font-medium transition-colors">
                         Reset Sort
                    </button>
                )}
            </div>
        </div>
      </div>
      
      <div className="overflow-auto h-56 sm:h-64 lg:h-72 custom-scrollbar bg-white border-b border-zinc-200">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="text-zinc-500 bg-white sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80 w-16 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">ID</th>
              {columns.in.map(c => (
                <th key={c} className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80 cursor-pointer hover:bg-zinc-100 transition-colors select-none group" onClick={() => onSort(c)}>
                  <div className="flex items-center text-zinc-600 font-medium group-hover:text-zinc-900">{cleanName(c)} {getSortIcon(c)}</div>
                </th>
              ))}
              {columns.out.map(c => (
                <th key={c} className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80 cursor-pointer hover:bg-zinc-100 transition-colors select-none group" onClick={() => onSort(c)}>
                  <div className="flex items-center text-zinc-600 font-medium group-hover:text-zinc-900">{cleanName(c)} {getSortIcon(c)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.map(row => {
              const isSelected = selectedIds.has(row.id);
              return (
                <tr key={row.id} onClick={() => onRowToggle(row.id)} 
                    className={`cursor-pointer transition-all duration-150 border-l-4
                    ${isSelected ? 'bg-cyan-100 border-l-cyan-500 shadow-sm' : 'bg-white border-l-transparent hover:bg-zinc-50 hover:border-l-zinc-300'}`}
                >
                  <td className="px-4 py-1.5 font-mono text-[10px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                        #{row.id}
                      </div>
                  </td>
                  {columns.in.map(c => <td key={c} className={`px-4 py-1.5 font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-600'}`}>{row[c]}</td>)}
                  {columns.out.map(c => <td key={c} className={`px-4 py-1.5 ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>{typeof row[c] === 'number' ? row[c].toFixed(2) : row[c]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const createDataset = async (id, name, type, csvText, zipObject = null, onAddObjectUrl = null) => {
      console.log(`createDataset called: id=${id}, name=${name}, type=${type}`);
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error("CSV file is empty or invalid");

      const headers = lines[0].split(',').map(h => h.trim());
      const cols = { in: [], out: [], img: [] };
      headers.forEach(h => {
        if (h.startsWith('in:')) cols.in.push(h);
        else if (h.startsWith('out:')) cols.out.push(h);
        else if (h.startsWith('img:')) cols.img.push(h);
      });
      console.log(`Columns: in=${cols.in.length}, out=${cols.out.length}, img=${cols.img.length}`);

      const parsedData = await Promise.all(lines.slice(1).map(async (line, idx) => {
        const values = line.split(',').map(v => v.trim());
        const row = { id: idx };
        await Promise.all(headers.map(async (header, i) => {
          let val = values[i];
          if (header.startsWith('img:') && val) {
             if (type === 'builtin') {
                 val = `/${id}/${val}`;
             } else if (zipObject) {
                 let file = zipObject.file(val);
                 if (!file) {
                     const fileName = val.split('/').pop();
                     const files = Object.keys(zipObject.files);
                     const match = files.find(f => f.endsWith(fileName) && !f.startsWith('__MACOSX'));
                     if (match) file = zipObject.file(match);
                 }
                 if (file) {
                     const blob = await file.async('blob');
                     val = URL.createObjectURL(blob);
                     if (onAddObjectUrl) {
                         onAddObjectUrl(val);
                     }
                 }
             }
          }
          row[header] = isNaN(Number(val)) ? val : Number(val);
        }));
        return row;
      }));

      const calculatedRanges = {};
      [...cols.in, ...cols.out].forEach(col => {
        const values = parsedData.map(d => d[col]);
        calculatedRanges[col] = { min: Math.min(...values), max: Math.max(...values) };
      });

      let bestCol = '';
      let maxUnique = -1;
      [...cols.in, ...cols.out].forEach(col => {
        const unique = new Set(parsedData.map(r => r[col])).size;
        if (unique > maxUnique) { maxUnique = unique; bestCol = col; }
      });
      if (!bestCol && cols.out.length > 0) bestCol = cols.out[0];
      if (!bestCol && cols.in.length > 0) bestCol = cols.in[0];

      return {
          id, name, type,
          data: parsedData,
          columns: cols,
          ranges: calculatedRanges,
          defaultColorBy: bestCol,
          defaultImgCol: cols.img.length > 0 ? cols.img[0] : null
      };
  };

const loadBuiltinDatasets = async (onAddObjectUrl = null) => {
  const datasetFolders = ['Multiple -Image-Layouts', 'daylight-factor', 'box-without-img'];
  const loadedDatasets = [];
  for (const folder of datasetFolders) {
    try {
      const csvUrl = `/${folder}/data.csv`;
      console.log(`Loading dataset from: ${csvUrl}`);
      const csvResponse = await fetch(csvUrl);
      console.log(`Response status: ${csvResponse.status}, ok: ${csvResponse.ok}`);
      if (!csvResponse.ok) continue;
      
      const csvText = await csvResponse.text();
      console.log(`CSV loaded for ${folder}, lines: ${csvText.split('\n').length}`);
      const dataset = await createDataset(
        folder,
        folder.replace(/-/g, ' '),
        'builtin',
        csvText,
        null,
        onAddObjectUrl
      );
      
      if (dataset) {
        loadedDatasets.push(dataset);
        console.log(`Dataset ${folder} loaded successfully, ${dataset.data.length} rows`);
      }
    } catch (e) {
      console.error(`Failed to load dataset ${folder}:`, e);
    }
  }
  console.log(`Total loaded datasets: ${loadedDatasets.length}`);
  return loadedDatasets;
};

export default function App() {
  const [datasets, setDatasets] = useState([]); 
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [viewSource, setViewSource] = useState('builtin');
  
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState({ in: [], out: [], img: [] });
  
  const [filters, setFilters] = useState({});
  const [ranges, setRanges] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortConfig, setSortConfig] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [colorBy, setColorBy] = useState('');
  const [paletteName, setPaletteName] = useState('nuancedLadybug');
  const [legendPosition, setLegendPosition] = useState('right');
  const [activeImgCol, setActiveImgCol] = useState(null);
  const [galleryActiveId, setGalleryActiveId] = useState(null);
  
  const [imageFitMode, setImageFitMode] = useState('contain'); 

  const objectUrlsRef = useRef([]);

  useEffect(() => {
    loadJSZip().catch(err => console.error("Failed to load JSZip", err));
  }, []);
  const clearObjectUrls = () => {
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  };

  const cleanName = (name) => {
      if (name === null || name === undefined) return '';
      const str = String(name);
      const parts = str.split(':');
      if (parts.length > 1) {
          return parts[1].replace(/_/g, ' ');
      }
      return str.replace(/_/g, ' ');
  };

  useEffect(() => {
      const initExample = async () => {
          try {
              const loadedDatasets = await loadBuiltinDatasets((url) => {
                  if (objectUrlsRef.current) {
                      objectUrlsRef.current.push(url);
                  }
              });
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
              setData([]);
              setFilters({});
              setSelectedIds(new Set());
          }
      } else if (!activeDatasetId) {
           const firstMatch = datasets.find(d => d.type === viewSource);
           if (firstMatch) setActiveDatasetId(firstMatch.id);
      }
  }, [viewSource, datasets]);

  useEffect(() => {
      const ds = datasets.find(d => d.id === activeDatasetId);
      if (ds) {
          setData(ds.data);
          setColumns(ds.columns);
          setRanges(ds.ranges);
          setColorBy(ds.defaultColorBy);
          setActiveImgCol(ds.defaultImgCol);
          setFilters({});
          setSelectedIds(new Set());
          setSortConfig([]); 
          setGalleryActiveId(null);
      }
  }, [activeDatasetId, datasets]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);

    try {
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
                if (objectUrlsRef.current) {
                    objectUrlsRef.current.push(url);
                }
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
            setDatasets(prev => [...prev, newDataset]);
            setViewSource('uploaded');
            setActiveDatasetId(newId);
        }
    } catch (err) {
        setErrorMsg(err.message);
    } finally {
        setLoading(false);
        e.target.value = ''; 
    }
  };

  const addFilter = (col, range) => {
    setFilters(prev => ({ ...prev, [col]: [...(prev[col] || []), range] }));
  };

  const removeFilter = (col, index) => {
      setFilters(prev => {
          const newFilters = prev[col].filter((_, i) => i !== index);
          if (newFilters.length === 0) { const { [col]: _, ...rest } = prev; return rest; }
          return { ...prev, [col]: newFilters };
      });
  };

  const clearColumnFilter = (col) => {
      setFilters(prev => { const { [col]: _, ...rest } = prev; return rest; });
  };
  
  const resetAllFilters = () => setFilters({});

  const handleExport = async (format) => {
      const svgElement = document.querySelector('svg.overflow-visible.shrink-0');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      if (format === 'svg') {
          const link = document.createElement('a');
          link.href = url;
          link.download = 'parallel-coordinates.svg';
          link.click();
          URL.revokeObjectURL(url);
      } else {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const svgSize = svgElement.getBoundingClientRect();
              canvas.width = svgSize.width * 2;
              canvas.height = svgSize.height * 2;
              const ctx = canvas.getContext('2d');
              ctx.scale(2, 2);
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              
              const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
              const dataUrl = canvas.toDataURL(mimeType, 0.9);
              
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `parallel-coordinates.${format}`;
              link.click();
          };
          img.src = url;
      }
  };

  const toggleRowSelection = (id) => {
    if (selectedIds.has(id) && selectedIds.size === 1) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set([id]));
        setGalleryActiveId(id);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

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

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.keys(filters).every(col => {
        const val = row[col];
        return filters[col].some(range => val >= range.min && val <= range.max);
      });
    });
  }, [data, filters]);

  const sortedFilteredData = useMemo(() => {
    if (sortConfig.length === 0) return filteredData;
    
    const sorted = [...filteredData];
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
  }, [filteredData, sortConfig]);

  useEffect(() => {
      if (sortedFilteredData.length > 0) {
          if (!galleryActiveId || !sortedFilteredData.find(d => d.id === galleryActiveId)) {
              setGalleryActiveId(sortedFilteredData[0].id);
          }
      } else {
          setGalleryActiveId(null);
      }
  }, [sortedFilteredData, galleryActiveId]);

  const activeGalleryItem = useMemo(() => data.find(d => d.id === galleryActiveId), [data, galleryActiveId]);
  const currentViewDatasets = datasets.filter(d => d.type === viewSource);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 text-zinc-800 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded text-white shadow-sm">
            <BarChart3 size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Design Explorer</h1>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">A powerful tool for visualizing and exploring design data</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-zinc-200 pr-6">
              <div className="flex bg-zinc-100 p-0.5 rounded border border-zinc-200 mr-2">
                <button
                    onClick={() => setViewSource('builtin')}
                    className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${viewSource === 'builtin' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Samples
                </button>
                <button
                    onClick={() => setViewSource('uploaded')}
                    className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${viewSource === 'uploaded' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Uploaded
                </button>
              </div>

              <div className="flex items-center gap-2">
                  <Database size={16} className="text-zinc-400" />
                  <select 
                    value={activeDatasetId || ''} 
                    onChange={(e) => setActiveDatasetId(e.target.value)}
                    className="text-xs border border-zinc-200 rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:border-zinc-400 min-w-[140px] text-zinc-700"
                    disabled={currentViewDatasets.length === 0}
                  >
                      {currentViewDatasets.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                      {currentViewDatasets.length === 0 && <option value="" disabled>No datasets</option>}
                  </select>
                  
                  {viewSource === 'uploaded' && (
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-sm cursor-pointer transition-colors shadow-sm ml-1" title="Upload .zip or .csv">
                        <FolderOpen size={14} />
                        {loading ? "Loading..." : "Upload"}
                        <input type="file" accept=".zip,.csv" onChange={handleFileUpload} className="hidden" disabled={loading} />
                    </label>
                  )}
              </div>
          </div>
        </div>
      </header>

      {errorMsg && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-red-700 text-sm flex items-center gap-2">
              <XCircle size={14} /> {errorMsg}
          </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-50/50">
        <div className="w-full xl:max-w-[90vw] 2xl:max-w-[75vw] mx-auto flex flex-col h-full bg-white shadow-2xl">
          {data.length > 0 && (
             <ParallelCoordinates 
                data={data} 
                filteredData={filteredData} 
                columns={columns} 
                ranges={ranges} 
                filters={filters}
                selectedIds={selectedIds}
                colorBy={colorBy}
                paletteName={paletteName}
                legendPosition={legendPosition}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                onClearColumnFilter={clearColumnFilter}
                setColorBy={setColorBy}
                setPaletteName={setPaletteName}
                setLegendPosition={setLegendPosition}
                cleanName={cleanName}
                resetAllFilters={resetAllFilters}
                onExport={handleExport}
             />
           )}

           {data.length > 0 && (
              <InteractiveTable 
                  data={sortedFilteredData} 
                  columns={columns} 
                  selectedIds={selectedIds} 
                  onRowToggle={toggleRowSelection} 
                  onClearSelection={clearSelection} 
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onClearSorts={clearSorts}
                  cleanName={cleanName}
              />
           )}

           {columns.img.length > 0 && (
           <div className="p-6 bg-zinc-50 border-t border-zinc-200">
             <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[500px] sm:h-[600px] lg:h-[800px]">
                <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon size={16} className="text-zinc-400" />
                            Visual Gallery
                        </h3>
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
                                        {sc.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        <X size={10} className="ml-1 opacity-40 hover:opacity-100" />
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
                                            <option key={col} value={col}>{cleanName(col)}</option>
                                        ))}
                                    </select>
                                    <Layers size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                             </div>
                        ) : (
                            <span className="text-xs text-zinc-400 italic flex items-center gap-1">
                                <XCircle size={12} /> No image data
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 border-r border-zinc-100 bg-zinc-50/50 overflow-y-auto custom-scrollbar p-6">
                        {sortedFilteredData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                <Filter size={24} className="mb-2 opacity-30" />
                                <span className="text-xs">No items found</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3 content-start justify-center">
                                {sortedFilteredData.map(row => {
                                    const isActive = row.id === galleryActiveId;
                                    const isSelected = selectedIds.has(row.id);
                                    
                                    let borderColor = 'transparent';
                                    if (colorBy && ranges[colorBy]) {
                                        borderColor = getColor(row[colorBy], ranges[colorBy].min, ranges[colorBy].max, paletteName);
                                    }

                                    return (
                                        <button
                                            key={row.id}
                                            onClick={() => {
                                                setGalleryActiveId(row.id);
                                                toggleRowSelection(row.id);
                                            }}
                                            className={`relative w-14 h-14 rounded-full overflow-hidden transition-all duration-300 border-2 
                                                ${isSelected ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-cyan-500 opacity-100 z-10' : 'opacity-100 scale-100 grayscale-[0.3] hover:grayscale-0'}
                                                ${!isSelected && isActive ? 'ring-2 ring-offset-1 ring-zinc-300 z-10' : ''}
                                                ${!isSelected && selectedIds.size > 0 ? 'opacity-40 hover:opacity-80 hover:scale-105' : ''}
                                                hover:z-10
                                            `}
                                            style={{ borderColor: borderColor }}
                                            title={`ID: ${row.id}`}
                                        >
                                            {activeImgCol ? (
                                                <img 
                                                    src={row[activeImgCol]} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white flex items-center justify-center text-zinc-300 font-mono text-[10px]">
                                                    #{row.id}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="w-2/3 h-full bg-white flex flex-col overflow-hidden">
                        {activeGalleryItem ? (
                            <>
                                <div className="flex-1 overflow-hidden p-6 bg-zinc-50 border-b border-zinc-100 relative">
                                     <ImageStage 
                                         src={activeGalleryItem[activeImgCol]} 
                                         mode={imageFitMode}
                                         onModeChange={setImageFitMode}
                                     />
                                </div>

                                <div className="shrink-0 h-[40%] overflow-y-auto custom-scrollbar p-6 bg-white border-t border-zinc-100">
                                    <div className="flex items-center gap-3 pb-3 mb-6 border-b border-zinc-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-zinc-900 font-mono tracking-tighter">#{activeGalleryItem.id}</span>
                                            {selectedIds.has(activeGalleryItem.id) && (
                                                <CheckCircle2 size={16} className="text-cyan-600" />
                                            )}
                                        </div>
                                        <div className="w-px h-6 bg-zinc-300"></div>
                                        {activeImgCol && activeGalleryItem[activeImgCol] && (
                                            <span className="text-base font-mono font-bold text-zinc-800 truncate max-w-xs" title={activeGalleryItem[activeImgCol]}>
                                                {activeGalleryItem[activeImgCol].split('/').pop()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2">Inputs</h4>
                                            {columns.in.map(col => (
                                                <div key={col} className="flex justify-between items-center text-xs py-0.5 group">
                                                    <span className="text-zinc-600 group-hover:text-zinc-800 transition-colors">{cleanName(col)}</span>
                                                    <span className="font-mono font-bold text-zinc-900">{activeGalleryItem[col]}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2">Outputs</h4>
                                            {columns.out.map(col => (
                                                <div key={col} className="flex justify-between items-center text-xs py-0.5 group">
                                                    <span className="text-zinc-600 group-hover:text-zinc-800 transition-colors">{cleanName(col)}</span>
                                                    <span 
                                                        className="font-mono font-bold"
                                                        style={col === colorBy ? { color: getColor(activeGalleryItem[col], ranges[col].min, ranges[col].max, paletteName) } : { color: '#27272a' }}
                                                    >
                                                        {typeof activeGalleryItem[col] === 'number' ? activeGalleryItem[col].toLocaleString(undefined, { maximumFractionDigits: 2 }) : activeGalleryItem[col]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-3">
                                <div className="p-4 rounded-full bg-zinc-50 border border-zinc-100">
                                    <Layers size={32} strokeWidth={1} />
                                </div>
                                <p className="text-xs font-medium tracking-wide uppercase text-zinc-400">Select an item to view details</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
           </div>
           )}
        </div>
      </div>
    </div>
  );
}
