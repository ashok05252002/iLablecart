import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { fabric } from 'fabric';
import { LayersControls } from './LayersControls';
import { AlignmentControls } from './AlignmentControls';

interface QRCodeEditorProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Image;
  onBack: () => void;
  onEditQR: () => void;
}

export const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ canvas, selectedObject, onBack, onEditQR }) => {
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [size, setSize] = useState(0);

  // @ts-ignore
  const qrAction = selectedObject.qrAction || 'Open a Link';
  // @ts-ignore
  const qrContent = selectedObject.qrContent || '';

  useEffect(() => {
    if (selectedObject) {
      setRotation(Math.round(selectedObject.angle || 0));
      setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
      setSize(Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1)));
    }
  }, [selectedObject]);

  const handleRotationChange = (val: string) => {
    const num = parseFloat(val);
    setRotation(isNaN(num) ? 0 : num);
    if (!isNaN(num)) {
      selectedObject.set({ angle: num });
      canvas.requestRenderAll();
    }
  };

  const handleOpacityChange = (val: string) => {
    const num = parseInt(val, 10);
    setOpacity(isNaN(num) ? 100 : num);
    if (!isNaN(num)) {
      selectedObject.set({ opacity: num / 100 });
      canvas.requestRenderAll();
    }
  };

  const handleSizeChange = (val: string) => {
    const num = parseFloat(val);
    setSize(isNaN(num) ? 0 : num);
    if (!isNaN(num)) {
      selectedObject.scaleToWidth(num);
      canvas.requestRenderAll();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-sm font-semibold text-gray-800">QR Code</h2>
      </div>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Preview */}
        <div className="flex flex-col justify-center items-center py-4 bg-gray-50 rounded border border-gray-200 gap-2">
          <QrCode size={40} className="text-gray-400" />
          <div className="text-xs text-gray-500 font-medium">{qrAction}</div>
          <div className="text-xs text-gray-400 truncate max-w-[200px] px-2 text-center" title={qrContent}>
            {qrContent}
          </div>
        </div>

        <button 
          onClick={onEditQR}
          className="w-full py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Edit QR Code
        </button>

        <button 
          onClick={() => {
            import('../utils/fabricUtils').then(({ fitToPrintArea }) => {
              fitToPrintArea(selectedObject, canvas);
            });
          }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium text-sm rounded-lg border border-brand-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          Auto Fit to Print Area
        </button>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Size</label>
          <input 
            type="number"
            value={size}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Rotation ({rotation} deg)</label>
          <input 
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Opacity ({opacity}%)</label>
          <input 
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>

        <hr className="border-gray-200" />
        <LayersControls canvas={canvas} selectedObject={selectedObject} />
        
        <hr className="border-gray-200" />
        <AlignmentControls canvas={canvas} selectedObject={selectedObject} />
      </div>
    </div>
  );
};
