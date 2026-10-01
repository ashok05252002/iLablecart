import React from 'react';
import { AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';
import { fabric } from 'fabric';
import { centerHorizontally, centerVertically } from '../utils/fabricUtils';

interface AlignmentControlsProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Object;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({ canvas, selectedObject }) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Align with document</h3>
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => {
            centerHorizontally(selectedObject, canvas);
            canvas.fire('object:modified');
          }}
          className="flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200"
        >
          <AlignHorizontalJustifyCenter size={16} />
          Horizontal center
        </button>
        <button 
          onClick={() => {
            centerVertically(selectedObject, canvas);
            canvas.fire('object:modified');
          }}
          className="flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200"
        >
          <AlignVerticalJustifyCenter size={16} />
          Vertical center
        </button>
      </div>
    </div>
  );
};
