import { Upload, FileText, Database, UploadCloud } from 'lucide-react';
import { useState, useRef } from 'react';

export const EmptyState = ({ title, description, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && containerRef.current.contains(relatedTarget)) {
      return;
    }
    
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && onDrop) {
      onDrop(files);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex items-center justify-center p-12 transition-all duration-200 ${isDragOver ? 'bg-zinc-100' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`text-center max-w-2xl transition-all duration-200 ${isDragOver ? 'scale-105' : ''}`}>
        <div className="flex justify-center gap-6 mb-8">
          <div className={`p-4 rounded-full transition-all duration-200 ${isDragOver ? 'bg-cyan-100' : 'bg-zinc-100'}`}>
            <Database size={48} className={`${isDragOver ? 'text-cyan-600' : 'text-zinc-400'}`} />
          </div>
          <div className={`p-4 rounded-full transition-all duration-200 ${isDragOver ? 'bg-cyan-100' : 'bg-zinc-100'}`}>
            <FileText size={48} className={`${isDragOver ? 'text-cyan-600' : 'text-zinc-400'}`} />
          </div>
          <div className={`p-4 rounded-full transition-all duration-200 ${isDragOver ? 'bg-cyan-100' : 'bg-zinc-100'}`}>
            <UploadCloud size={48} className={`${isDragOver ? 'text-cyan-600' : 'text-zinc-400'}`} />
          </div>
        </div>
        
        <h2 className={`text-2xl font-bold mb-3 transition-all duration-200 ${isDragOver ? 'text-cyan-700' : 'text-zinc-900'}`}>
          {title || 'No Data Available'}
        </h2>
        
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
          Tip: Use <a href="https://docs.pollination.solutions/user-manual/grasshopper-plugin/grasshopper-user-interface/3_parametric/fly" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 font-medium underline">Pollination Fly</a> and <a href="https://docs.pollination.solutions/user-manual/grasshopper-plugin/grasshopper-user-interface/3_parametric/fly_id" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 font-medium underline">Fly_ID</a> components to create associated files that meet the program requirements, then package them into a ZIP file yourself.
        </p>

        {isDragOver && (
          <div className="mb-6 p-4 bg-cyan-50 border-2 border-dashed border-cyan-300 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-cyan-700 font-medium">
              <Upload size={20} />
              <span>Drop your files here</span>
            </div>
          </div>
        )}

        <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-200">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Supported File Formats</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-200 rounded">
                <FileText size={20} className="text-zinc-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-zinc-900">CSV File</div>
                <div className="text-xs text-zinc-600">Comma-separated values with data and optional image URLs</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-200 rounded">
                <Upload size={20} className="text-zinc-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-zinc-900">ZIP Archive</div>
                <div className="text-xs text-zinc-600">Contains CSV data and associated images folder</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <span>Need help?</span>
          <a 
            href="https://www.youtube.com/watch?v=X7hrUg71scE&t=28s" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700 font-medium underline"
          >
            View Tutorial
          </a>
        </div>
      </div>
    </div>
  );
};
