import { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart3, Download, XCircle } from 'lucide-react';
import { getColor, PALETTE_NAMES } from '../../utils/colorUtils';
import { cleanName } from '../../utils/constants';
import { LegendBar } from '../ui/LegendBar';
import { ExportService } from '../../services/ExportService';

export const ParallelCoordinates = ({ 
  data, filteredData, columns, numericCols, ranges, filters, selectedIds, 
  colorBy, paletteName, legendPosition,
  onAddFilter, onRemoveFilter, onClearColumnFilter,
  setColorBy, setPaletteName, setLegendPosition,
  resetAllFilters, onExport
}) => {
  const svgRef = useRef(null);
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartHeight = Math.min(320, Math.max(200, containerWidth * 0.25));
  const padding = { top: 40, right: 40, bottom: 30, left: 40 };
  const [brushing, setBrushing] = useState(null); 

  useEffect(() => {
    if (chartContainerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) setContainerWidth(entries[0].contentRect.width);
      });
      resizeObserver.observe(chartContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const legendThickness = 80; 
  const isLegendVertical = legendPosition === 'left' || legendPosition === 'right';
  const chartWidth = isLegendVertical ? containerWidth - legendThickness : containerWidth;
  const legendHeight = chartHeight + 40;
  const allCols = numericCols || [...columns.in, ...columns.out];

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

  const handleExportClick = async (format) => {
    const containerElement = chartContainerRef.current;
    if (!containerElement) return;
    await ExportService.export(format, containerElement);
    setShowExportMenu(false);
  };

  if (allCols.length === 0) return null;

  const legendElement = colorBy && ranges[colorBy] ? (
    <div style={{ width: isLegendVertical ? legendThickness : '100%', height: isLegendVertical ? legendHeight : 50 }} className="shrink-0 border-zinc-100">
      <LegendBar min={ranges[colorBy].min} max={ranges[colorBy].max} paletteName={paletteName} position={legendPosition} />
    </div>
  ) : null;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm mx-6 mt-6 overflow-hidden flex flex-col shrink-0">
      <div className="px-6 py-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
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
                <button onClick={() => handleExportClick('png')} className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 transition-colors">PNG</button>
                <button onClick={() => handleExportClick('jpg')} className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 transition-colors">JPG</button>
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
        ref={chartContainerRef}
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
            selectedIds.size > 0 ? 0.25 : 0.4,
            1.5
          )}
          
          {renderLines(
            selectedData, 
            "#000000ff",
            1, 
            3.5
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
