import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fabric } from 'fabric';
import QRCode from 'qrcode';
import { generateId, centerObject, canvasSize } from '../utils/fabricUtils';

interface AddQRSidebarProps {
  canvas: fabric.Canvas;
  onBack: () => void;
  existingQR?: fabric.Image; // passed if we are re-editing
}

export const AddQRSidebar: React.FC<AddQRSidebarProps> = ({ canvas, onBack, existingQR }) => {
  // @ts-ignore
  const [actionType, setActionType] = useState(existingQR?.qrAction || 'Open a Link');
  // @ts-ignore
  const [content, setContent] = useState(existingQR?.qrContent || '');

  const handleSubmit = async () => {
    if (!content) return;
    
    try {
      const url = await QRCode.toDataURL(content, { margin: 1, scale: 10 });
      
      if (existingQR) {
        // Update existing
        existingQR.setSrc(url, () => {
          existingQR.set({
            // @ts-ignore
            qrAction: actionType,
            // @ts-ignore
            qrContent: content
          });
          canvas.requestRenderAll();
          canvas.fire('object:modified', { target: existingQR });
          onBack(); // go back to editor
        });
      } else {
        // Create new
        fabric.Image.fromURL(url, (img) => {
          img.set({
            // @ts-ignore
            id: generateId(),
            // @ts-ignore
            elementType: 'qrcode',
            // @ts-ignore
            qrAction: actionType,
            // @ts-ignore
            qrContent: content
          });
          img.scaleToWidth(Math.min(150, canvasSize(canvas).height * 0.9));
          centerObject(img, canvas);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          canvas.fire('object:added', { target: img });
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-sm font-semibold text-gray-800">Add QR Code</h2>
      </div>

      <div className="p-5 flex flex-col gap-4 mt-2">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Choose an action the QR Code will trigger</label>
          <select 
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option>Text</option>
            <option>Dial a Number</option>
            <option>Open a Link</option>
            <option>Send an Email</option>
            <option>Visiting Card</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Content</label>
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter URL or text"
            className="w-full p-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-[#25843D] text-white p-3 mt-4 text-sm font-medium rounded hover:bg-[#1E6B32] transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
