import { getGradientString } from '../../utils/colorUtils';

export const LegendBar = ({ min, max, paletteName, position }) => {
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
