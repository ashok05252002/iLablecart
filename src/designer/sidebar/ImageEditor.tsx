import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, Maximize2, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';
import { fabric } from 'fabric';
import { LayersControls } from './LayersControls';
import { AlignmentControls } from './AlignmentControls';
import { loadImageToCanvas } from '../utils/fabricUtils';

interface ImageEditorProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Image;
  onBack: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ canvas, selectedObject, onBack }) => {
  const [opacity, setOpacity] = useState(
    Math.round((selectedObject.opacity ?? 1) * 100)
  );

  useEffect(() => {
    setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
  }, [selectedObject]);

  const handleRotate = () => {
    const currentAngle = selectedObject.angle || 0;
    selectedObject.set('angle', (currentAngle + 90) % 360);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const handleResize = () => {
    // Just a simple scale multiplier for demo, usually done via handles
    const scaleX = selectedObject.scaleX || 1;
    const scaleY = selectedObject.scaleY || 1;
    selectedObject.set({
      scaleX: scaleX * 1.1,
      scaleY: scaleY * 1.1
    });
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const handleReplaceImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Save current image's visual dimensions and placement
        const targetWidth = selectedObject.getScaledWidth();
        const targetHeight = selectedObject.getScaledHeight();
        const center = selectedObject.getCenterPoint();
        const angle = selectedObject.angle || 0;
        const currentOpacity = selectedObject.opacity ?? 1;
        const id = (selectedObject as any).id;
        const index = canvas.getObjects().indexOf(selectedObject);

        const reader = new FileReader();
        reader.onload = (f) => {
          const data = f.target?.result as string;
          fabric.Image.fromURL(data, (newImg) => {
            const imgW = newImg.width || targetWidth;
            const imgH = newImg.height || targetHeight;
            // Proportional scale to fit inside previous image's footprint
            const scale = Math.min(targetWidth / imgW, targetHeight / imgH);

            newImg.set({
              scaleX: scale,
              scaleY: scale,
              angle: angle,
              opacity: currentOpacity,
              // @ts-ignore
              id: id,
              elementType: 'image',
            });

            newImg.setPositionByOrigin(center, 'center', 'center');
            newImg.setCoords();

            canvas.remove(selectedObject);
            if (index >= 0) {
              canvas.insertAt(newImg, index, false);
            } else {
              canvas.add(newImg);
            }
            canvas.setActiveObject(newImg);
            canvas.renderAll();
            canvas.fire('object:modified');
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const safeVal = isNaN(val) ? 100 : Math.max(0, Math.min(100, val));
    setOpacity(safeVal);
    selectedObject.set('opacity', safeVal / 100);
    canvas.renderAll();
    canvas.fire('object:modified');
  };

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-md">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-800">Image</h2>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Thumbnail Preview Area (Simplified) */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
          <ImageIcon size={48} className="text-gray-300 mb-2" />
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200 uppercase">
            IMAGE
          </span>
        </div>

        {/* Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleRotate} className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
            <RotateCw size={18} />
            Rotate
          </button>
          <button onClick={() => {
            import('../utils/fabricUtils').then(({ fitToPrintArea }) => {
              fitToPrintArea(selectedObject, canvas);
            });
          }} className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
            <Maximize2 size={18} />
            Auto Fit
          </button>
        </div>

        <button onClick={handleReplaceImage} className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium text-sm rounded-lg border border-brand-200 transition-colors">
          Replace image
        </button>

        {/* Opacity */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 mt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Opacity
            </label>
            <span className="text-sm text-gray-500">{opacity}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={opacity} 
            onChange={handleOpacityChange}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        <LayersControls canvas={canvas} selectedObject={selectedObject} />
        <AlignmentControls canvas={canvas} selectedObject={selectedObject} />
      </div>
    </div>
  );
};
