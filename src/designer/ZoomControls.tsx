import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, onFit }) => {
  return (
    <div className="absolute top-4 left-4 flex items-center bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
      <button 
        onClick={onFit}
        className="p-2 hover:bg-gray-100 border-r border-gray-200 text-gray-600"
        title="Fit to screen"
      >
        <Maximize size={18} />
      </button>
      <button 
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 border-r border-gray-200 text-gray-600"
        title="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>
      <div className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
        {Math.round(zoom * 100)}%
      </div>
      <button 
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 text-gray-600"
        title="Zoom In"
      >
        <ZoomIn size={18} />
      </button>
    </div>
  );
};
