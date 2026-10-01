import React, { useState } from 'react';
import { Image as ImageIcon, Type, AlignLeft, Aperture, Square, QrCode, LayoutTemplate } from 'lucide-react';
import { fabric } from 'fabric';
import { loadImageToCanvas, generateId, centerObject, canvasSize } from '../utils/fabricUtils';
import QRCode from 'qrcode';

interface DefaultSidebarProps {
  canvas: fabric.Canvas;
  colorLabel: string;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  onSelectElement: (id: string) => void;
  onNavigate: (panel: 'default' | 'add-shape' | 'add-qr') => void;
}

export const DefaultSidebar: React.FC<DefaultSidebarProps> = ({ 
  canvas, 
  colorLabel,
  backgroundColor, 
  onBackgroundColorChange,
  onSelectElement,
  onNavigate
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const hasColor = !!backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== 'none';

  const handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        loadImageToCanvas(file, canvas);
      }
    };
    input.click();
  };

  // Short surfaces (pen barrel) need smaller default text so it fits the print area
  const fitFont = (size: number, share: number) => Math.min(size, Math.round(canvasSize(canvas).height * share));

  const handleAddText = (isParagraph: boolean = false) => {
    const text = new fabric.Textbox(isParagraph ? 'Enter your paragraph' : 'Your text', {
      left: 0,
      top: 0,
      // Wide, short surfaces (pen barrel) get a wide box so a name stays on one line
      width: isParagraph ? 500 : canvasSize(canvas).height < 400 ? canvasSize(canvas).width * 0.8 : 300,
      fontFamily: 'Open Sans',
      fontSize: isParagraph ? fitFont(80, 0.35) : fitFont(144, 0.7),
      fill: '#000000',
      textAlign: 'center',
      // @ts-ignore
      id: generateId(),
      // @ts-ignore
      elementType: 'text'
    });
    centerObject(text, canvas);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    canvas.fire('object:added', { target: text });
  };

  const handleAddTemplate = (textStr: string) => {
    const text = new fabric.Textbox(textStr, {
      fontFamily: 'Montserrat',
      fontSize: fitFont(200, 0.7),
      fontWeight: 'bold',
      fill: '#25843D',
      textAlign: 'center',
      width: 600,
      // @ts-ignore
      id: generateId(),
      // @ts-ignore
      elementType: 'text'
    });
    centerObject(text, canvas);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  // Get elements currently on canvas
  const elements = canvas.getObjects().map(obj => {
    // @ts-ignore
    const elType = obj.elementType;
    const type = obj.type;
    
    let friendlyName = type;
    if (elType === 'qrcode') friendlyName = 'QR Code';
    else if (elType === 'image') friendlyName = 'Image';
    else if (elType === 'logo') friendlyName = 'Logo';
    else if (type === 'rect') friendlyName = 'Rect';
    else if (type === 'circle' || type === 'ellipse') friendlyName = 'Ellipse';
    else if (type === 'triangle') friendlyName = 'Triangle';
    else if (type === 'line') friendlyName = 'Line';
    else if (type === 'i-text' || type === 'textbox' || elType === 'text') {
      friendlyName = 'Text';
    }

    return {
      // @ts-ignore
      id: obj.id,
      // @ts-ignore
      type: elType || type,
      // @ts-ignore
      text: (type === 'i-text' || type === 'textbox') ? obj.text : friendlyName
    };
  });

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto">
      <div className="p-5 flex flex-col gap-6">
        
        {/* Background Color */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">{colorLabel}</label>
          <div className="flex items-center gap-3">
            <div 
              onClick={() => colorInputRef.current?.click()}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer shadow-sm relative overflow-hidden flex items-center justify-center shrink-0"
              style={{ backgroundColor: hasColor ? backgroundColor : '#FFFFFF' }}
            >
              <input 
                ref={colorInputRef}
                type="color" 
                value={hasColor ? backgroundColor : '#ffffff'}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              {!hasColor && (
                <div className="w-full h-0.5 bg-red-400 rotate-45" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {hasColor ? backgroundColor.toUpperCase() : '- Not set -'}
              </span>
              {hasColor ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <button 
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline cursor-pointer"
                  >
                    Change
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    type="button"
                    onClick={() => onBackgroundColorChange('transparent')}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="text-xs text-brand-700 hover:text-brand-900 underline mt-0.5 text-left font-medium"
                >
                  Choose color
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Add Section */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">Add</label>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleUploadImage}
              className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition-colors"
            >
              <div className="bg-white p-1.5 rounded shadow-sm"><ImageIcon size={18} className="text-brand-600" /></div>
              Upload Image
            </button>
            
            <div className="grid grid-cols-2 gap-2 relative">
              <button 
                onClick={() => handleAddText(false)}
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700"
              >
                <Type size={16} /> Text
              </button>
              <button 
                onClick={() => handleAddText(true)}
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700"
              >
                <AlignLeft size={16} /> Paragraph
              </button>
              <button 
                onClick={handleUploadImage} // Logo is effectively an image upload
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700"
              >
                <Aperture size={16} /> Logo
              </button>
              
              <button 
                onClick={() => onNavigate('add-shape')}
                className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700"
              >
                <Square size={16} /> Shapes
              </button>

              <button 
                onClick={() => onNavigate('add-qr')}
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700 col-span-2"
              >
                <QrCode size={16} /> QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Elements in the design */}
        {elements.length > 0 && (
          <>
            <hr className="border-gray-200" />
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Elements in the design</label>
              <div className="flex flex-col gap-2">
                {elements.map((el, i) => (
                  <button 
                    key={el.id || i}
                    onClick={() => onSelectElement(el.id)}
                    className="flex items-center gap-3 p-2 bg-white hover:bg-gray-50 rounded border border-gray-200 text-left text-sm text-gray-700"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                      {el.type === 'text' || el.type === 'textbox' ? <Type size={14} /> : 
                       el.type === 'qrcode' ? <QrCode size={14} /> :
                       el.type === 'shape' || el.type === 'circle' || el.type === 'rect' ? <Square size={14} /> :
                       <ImageIcon size={14} />}
                    </div>
                    <span className="truncate">{el.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
