import { XCircle, ArrowUpDown, ArrowUp, ArrowDown, Table2 } from 'lucide-react';
import { cleanName } from '../../utils/constants';
import { Pagination } from '../ui/Pagination';

export const InteractiveTable = ({ data, columns, selectedIds, onRowToggle, onClearSelection, sortConfig, onSort, onClearSorts, currentPage, itemsPerPage, onPageChange }) => {
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

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm mx-6 mt-6 flex flex-col shrink-0 overflow-hidden">
      <div className="px-6 py-2 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-700">
            <Table2 size={16} strokeWidth={2} className="mt-0.5" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Data Table</h3>
          </div>
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
      
      <div className="overflow-auto h-48 sm:h-56 lg:h-64 custom-scrollbar bg-white">
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
            {paginatedData.map(row => {
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
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};
