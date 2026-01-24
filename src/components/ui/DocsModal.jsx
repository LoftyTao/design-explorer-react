import { X } from 'lucide-react';

export const DocsModal = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="docs-modal bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
          <h2 className="text-lg font-bold text-zinc-900">Quick Guide</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Getting Started</h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">1.</span>
                  <span>Choose between <strong>Samples</strong> (built-in datasets) or <strong>Uploaded</strong> (your own files)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">2.</span>
                  <span>Select a dataset from the dropdown menu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">3.</span>
                  <span>Upload your own .zip or .csv files using the Upload button</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Parallel Coordinates</h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Click and drag</strong> on any column to create a filter range</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Click</strong> on an existing filter to remove it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Use the <strong>Color</strong> dropdown to color lines by any data column</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Adjust the <strong>Legend</strong> position (top, bottom, left, right)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Export</strong> the chart as PNG or JPG image</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Data Table</h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Click</strong> column headers to sort data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Click again</strong> to toggle sort direction (ascending/descending)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Multiple sorts are supported - click multiple columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Click</strong> on row checkboxes to select items</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Visual Gallery</h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Browse thumbnails in the <strong>left panel</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>View full-size images in the <strong>right panel</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Use the <strong>Source</strong> dropdown to switch between image columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Click thumbnails to select items (syncs with table)</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Filters work together - combine multiple filters for precise results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Selections sync across all views (chart, table, gallery)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Use the X button to clear all filters at once</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
