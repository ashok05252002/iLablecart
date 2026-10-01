import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DesignerHeaderProps {
  title: string;
  backUrl: string;
  isSaving: boolean;
  onSave: () => void;
}

export const DesignerHeader: React.FC<DesignerHeaderProps> = ({ title, backUrl, isSaving, onSave }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-6 shrink-0 max-md:px-3">
      <div className="flex items-center gap-4 min-w-0 max-md:gap-2">
        <Link
          to={backUrl}
          className="flex items-center justify-center w-8 h-8 shrink-0 bg-brand-100 text-brand-700 rounded-full"
          aria-label="Back to product"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 truncate max-md:text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#25843D] hover:bg-[#1E6B32] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-md:px-3 max-md:text-sm"
        >
          {isSaving && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isSaving ? 'Saving...' : <>Save design & Proceed &rarr;</>}
        </button>
      </div>
    </header>
  );
};
