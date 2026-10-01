import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { fabric } from 'fabric';
import { LayersControls } from './LayersControls';
import { AlignmentControls } from './AlignmentControls';

interface TextEditorProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Textbox | fabric.IText;
  onBack: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ canvas, selectedObject, onBack }) => {
  const FONT_SCALE = 2; // Conversion factor to match reference app visual proportions

  const [text, setText] = useState(selectedObject.text || '');
  const [fontFamily, setFontFamily] = useState(selectedObject.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(
    selectedObject.fontSize ? (selectedObject.fontSize / FONT_SCALE).toFixed(1).replace('.0', '') : '36'
  );
  const [fill, setFill] = useState(selectedObject.fill as string || '#000000');
  const [opacity, setOpacity] = useState(Math.round((selectedObject.opacity ?? 1) * 100));
  const [angle, setAngle] = useState(Math.round(selectedObject.angle || 0));
  const [lineHeight, setLineHeight] = useState(selectedObject.lineHeight?.toString() || '1.16');
  
  // Sync state if object is modified on canvas
  useEffect(() => {
    const updateState = () => {
      // Normalize scale back to fontSize on mouse drop
      const currentScaleY = selectedObject.scaleY || 1;
      if (currentScaleY !== 1) {
        const newFontSize = (selectedObject.fontSize || 36) * currentScaleY;
        selectedObject.set({
          fontSize: newFontSize,
          scaleX: 1,
          scaleY: 1
        });
        // We don't need requestRenderAll here because object:modified handles it in useFabricCanvas
      }

      setText(selectedObject.text || '');
      setFontFamily(selectedObject.fontFamily || 'Arial');
      setFontSize(selectedObject.fontSize ? (selectedObject.fontSize / FONT_SCALE).toFixed(1).replace('.0', '') : '36');
      setFill(selectedObject.fill as string || '#000000');
      setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
      setAngle(Math.round(selectedObject.angle || 0));
      setLineHeight(selectedObject.lineHeight?.toString() || '1.16');
    };

    selectedObject.on('modified', updateState);
    selectedObject.on('changed', updateState); // For text typing

    return () => {
      selectedObject.off('modified', updateState);
      selectedObject.off('changed', updateState);
    };
  }, [selectedObject]);

  const updateProp = (prop: string, value: any) => {
    selectedObject.set({ [prop]: value } as any);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto overflow-x-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-md">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-800">Text</h2>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Text Input */}
        <div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              updateProp('text', e.target.value);
            }}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none text-gray-700"
            placeholder="Type your text here..."
          />
        </div>

        {/* Font Family & Size */}
        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                updateProp('fontFamily', e.target.value);
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Open Sans', 'Roboto', 'Montserrat', 'Poppins'].map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num)) {
                  updateProp('fontSize', num * FONT_SCALE);
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fill}
              onChange={(e) => {
                setFill(e.target.value);
                updateProp('fill', e.target.value);
              }}
              className="w-10 h-10 p-1 bg-white border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 font-mono">{fill}</span>
          </div>
        </div>

        {/* Formatting & Alignment */}
        <div className="flex justify-between border border-gray-200 rounded-lg p-1 bg-gray-50">
          <div className="flex gap-1">
            <button 
              onClick={() => updateProp('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`p-2 rounded ${selectedObject.fontWeight === 'bold' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={() => updateProp('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`p-2 rounded ${selectedObject.fontStyle === 'italic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={() => updateProp('underline', !selectedObject.underline)}
              className={`p-2 rounded ${selectedObject.underline ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300 my-auto mx-1"></div>
            <button 
              onClick={() => {
                import('../utils/fabricUtils').then(({ fitToPrintArea }) => {
                  fitToPrintArea(selectedObject, canvas);
                });
              }}
              className="p-2 rounded text-gray-500 hover:text-gray-700"
              title="Auto Fit to Print Area"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 my-auto mx-1"></div>
          <div className="flex gap-1">
            <button 
              onClick={() => updateProp('textAlign', 'left')}
              className={`p-2 rounded ${selectedObject.textAlign === 'left' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlignLeft size={16} />
            </button>
            <button 
              onClick={() => updateProp('textAlign', 'center')}
              className={`p-2 rounded ${selectedObject.textAlign === 'center' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlignCenter size={16} />
            </button>
            <button 
              onClick={() => updateProp('textAlign', 'right')}
              className={`p-2 rounded ${selectedObject.textAlign === 'right' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlignRight size={16} />
            </button>
          </div>
        </div>

        {/* Sliders for Rotation, Opacity, Line Height */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Rotation</label>
              <span className="text-xs text-gray-500">{angle}°</span>
            </div>
            <input 
              type="range" min="0" max="360" value={angle} 
              onChange={(e) => {
                setAngle(parseInt(e.target.value, 10));
                updateProp('angle', parseInt(e.target.value, 10));
              }}
              className="w-full accent-brand-600"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Opacity</label>
              <span className="text-xs text-gray-500">{opacity}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={opacity} 
              onChange={(e) => {
                setOpacity(parseInt(e.target.value, 10));
                updateProp('opacity', parseInt(e.target.value, 10) / 100);
              }}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Line Height</label>
              <span className="text-xs text-gray-500">{lineHeight}</span>
            </div>
            <input 
              type="range" min="0.5" max="3" step="0.1" value={lineHeight} 
              onChange={(e) => {
                setLineHeight(e.target.value);
                updateProp('lineHeight', parseFloat(e.target.value));
              }}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        <LayersControls canvas={canvas} selectedObject={selectedObject} />
        <AlignmentControls canvas={canvas} selectedObject={selectedObject} />
      </div>
    </div>
  );
};
