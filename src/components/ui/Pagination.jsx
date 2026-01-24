import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-t border-zinc-200">
      <div className="text-[10px] text-zinc-500 font-medium">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-sm border transition-all duration-200 flex items-center justify-center
            ${currentPage === 1 
              ? 'border-zinc-200 text-zinc-300 cursor-not-allowed opacity-50' 
              : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          title="Previous page"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        
        <div className="flex items-center gap-1 px-2">
          <span className="text-xs font-semibold text-zinc-700">{currentPage}</span>
          <span className="text-xs text-zinc-400">/</span>
          <span className="text-xs font-medium text-zinc-500">{totalPages}</span>
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-sm border transition-all duration-200 flex items-center justify-center
            ${currentPage === totalPages 
              ? 'border-zinc-200 text-zinc-300 cursor-not-allowed opacity-50' 
              : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
            }`}
          title="Next page"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
