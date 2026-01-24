import { XCircle } from 'lucide-react';

export const ErrorMessage = ({ errorMsg }) => {
  if (!errorMsg) return null;
  
  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-red-700 text-sm flex items-center gap-2">
      <XCircle size={14} /> {errorMsg}
    </div>
  );
};
