import React from 'react';
import { ArrowLeft, Circle, Square } from 'lucide-react';
import { fabric } from 'fabric';
import { generateId, centerObject, canvasSize } from '../utils/fabricUtils';

interface AddShapeSidebarProps {
  canvas: fabric.Canvas;
  onBack: () => void;
}

export const AddShapeSidebar: React.FC<AddShapeSidebarProps> = ({ canvas, onBack }) => {
  
  const handleAddShape = (type: 'rect' | 'circle') => {
    let shape;
    const commonOpts = {
      fill: '#111111',
      opacity: 1,
      angle: 0,
      // @ts-ignore
      id: generateId(),
      // @ts-ignore
      elementType: 'shape'
    };
    
    const size = Math.min(100, canvasSize(canvas).height * 0.8);

    if (type === 'rect') {
      shape = new fabric.Rect({ ...commonOpts, width: size, height: size });
    } else {
      shape = new fabric.Circle({ ...commonOpts, radius: size / 2 });
    }
    
    centerObject(shape, canvas);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
    canvas.fire('object:added', { target: shape });
  };

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-sm font-semibold text-gray-800">Add a shape</h2>
      </div>

      <div className="p-5 flex justify-center gap-8 mt-4">
        <button 
          onClick={() => handleAddShape('circle')}
          className="flex flex-col items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-brand-50 hover:border-brand-200 transition-colors">
            <Circle size={24} fill="currentColor" className="text-gray-800" />
          </div>
          <span className="text-xs font-medium">Circle</span>
        </button>

        <button 
          onClick={() => handleAddShape('rect')}
          className="flex flex-col items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors"
        >
          <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-brand-50 hover:border-brand-200 transition-colors">
            <Square size={24} fill="currentColor" className="text-gray-800" />
          </div>
          <span className="text-xs font-medium">Rectangle</span>
        </button>
      </div>
    </div>
  );
};
