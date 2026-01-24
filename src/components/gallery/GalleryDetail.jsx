import { Layers, CheckCircle2 } from 'lucide-react';
import { getColor } from '../../utils/colorUtils';
import { cleanName } from '../../utils/constants';
import { ImageStage } from './ImageStage';

export const GalleryDetail = ({ 
  activeGalleryItem, 
  activeImgCol, 
  columns, 
  colorBy, 
  ranges, 
  paletteName, 
  imageFitMode, 
  setImageFitMode,
  selectedIds
}) => {
  if (!activeGalleryItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-3">
        <div className="p-4 rounded-full bg-zinc-50 border border-zinc-100">
          <Layers size={32} strokeWidth={1} />
        </div>
        <p className="text-xs font-medium tracking-wide uppercase text-zinc-400">Select an item to view details</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden p-6 bg-zinc-50/50 border-b border-zinc-100 relative">
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
            <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2">Inputs</h4>
            {columns.in.map(col => (
              <div key={col} className="flex justify-between items-center text-xs py-0.5 group">
                <span className="text-zinc-600 group-hover:text-zinc-800 transition-colors">{cleanName(col)}</span>
                <span className="font-mono font-bold text-zinc-900">{activeGalleryItem[col]}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2">Outputs</h4>
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
  );
};
