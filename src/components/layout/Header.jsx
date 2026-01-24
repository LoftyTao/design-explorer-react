import { BarChart3, Github, ExternalLink, FolderOpen, Database, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Header = ({ viewSource, setViewSource, activeDatasetId, setActiveDatasetId, currentViewDatasets, loading, handleFileUpload, showDocs, setShowDocs }) => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.export-menu-container') && !e.target.closest('.docs-button') && !e.target.closest('.docs-modal')) {
      setShowDocs(false);
    }
  };

  useEffect(() => {
    if (showDocs) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDocs]);
  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-zinc-200 shadow-sm z-20 shrink-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded text-white shadow-sm">
            <BarChart3 size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Design Explorer</h1>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">A powerful tool for visualizing and exploring design data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12">
          <button 
            onClick={() => setShowDocs(!showDocs)}
            className="docs-button flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-sm transition-colors border border-zinc-200"
            title="Documentation"
          >
            <BookOpen size={14} />
            Docs
          </button>
          <a 
            href="https://github.com/LoftyTao/design-explorer-react" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-sm transition-colors border border-zinc-200"
            title="GitHub Repository"
          >
            <Github size={14} />
            GitHub
          </a>
          <a 
            href="https://www.youtube.com/watch?v=X7hrUg71scE&t=28s" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-sm transition-colors border border-zinc-200"
            title="Tutorial"
          >
            <ExternalLink size={14} />
            Tutorial
          </a>
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
  );
};
