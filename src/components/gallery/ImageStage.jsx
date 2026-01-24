import { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Move } from 'lucide-react';

export const ImageStage = ({ src, mode, onModeChange }) => {
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
