import { Filter } from 'lucide-react';
import { getColor } from '../../utils/colorUtils';
import { cleanName } from '../../utils/constants';
import { Pagination } from '../ui/Pagination';

export const GalleryGrid = ({ 
  sortedData, 
  galleryActiveId, 
  selectedIds, 
  setGalleryActiveId, 
  toggleRowSelection, 
  activeImgCol, 
  colorBy, 
  ranges, 
  paletteName,
  currentPage,
  itemsPerPage,
  onPageChange
}) => {
  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <Filter size={24} className="mb-2 opacity-30" />
        <span className="text-xs">No items found</span>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-wrap gap-3 content-start justify-center p-4">
          {paginatedData.map(row => {
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
      </div>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={sortedData.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};
