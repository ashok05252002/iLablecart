import React from 'react';
import { fabric } from 'fabric';
import { DefaultSidebar } from './DefaultSidebar';
import { ImageEditor } from './ImageEditor';
import { TextEditor } from './TextEditor';
import { AddShapeSidebar } from './AddShapeSidebar';
import { AddQRSidebar } from './AddQRSidebar';
import { ShapeEditor } from './ShapeEditor';
import { QRCodeEditor } from './QRCodeEditor';

interface SidebarRouterProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Object | null;
  colorLabel: string;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

export const SidebarRouter: React.FC<SidebarRouterProps> = ({ 
  canvas, 
  selectedObject, 
  colorLabel,
  backgroundColor,
  onBackgroundColorChange 
}) => {
  const [activePanel, setActivePanel] = React.useState<'default' | 'add-shape' | 'add-qr'>('default');

  const handleBack = () => {
    if (selectedObject) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
    setActivePanel('default');
  };

  const handleSelectElement = (id: string) => {
    const obj = canvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }
  };

  if (!selectedObject) {
    if (activePanel === 'add-shape') {
      return <AddShapeSidebar canvas={canvas} onBack={handleBack} />;
    }
    if (activePanel === 'add-qr') {
      return <AddQRSidebar canvas={canvas} onBack={handleBack} />;
    }

    return (
      <DefaultSidebar 
        canvas={canvas} 
        colorLabel={colorLabel}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={onBackgroundColorChange}
        onSelectElement={handleSelectElement}
        onNavigate={setActivePanel}
      />
    );
  }

  // @ts-ignore
  const type = selectedObject.elementType || selectedObject.type;

  if (type === 'qrcode') {
    return (
      <QRCodeEditor 
        canvas={canvas} 
        selectedObject={selectedObject as fabric.Image} 
        onBack={handleBack} 
        onEditQR={() => setActivePanel('add-qr')}
      />
    );
  }

  if (type === 'image') {
    return (
      <ImageEditor 
        canvas={canvas} 
        selectedObject={selectedObject as fabric.Image} 
        onBack={handleBack} 
      />
    );
  }

  if (type === 'text' || type === 'textbox' || type === 'i-text') {
    return (
      <TextEditor 
        canvas={canvas} 
        selectedObject={selectedObject as fabric.Textbox} 
        onBack={handleBack} 
      />
    );
  }

  if (type === 'shape' || type === 'rect' || type === 'circle' || type === 'ellipse' || type === 'triangle' || type === 'line') {
    return (
      <ShapeEditor 
        canvas={canvas} 
        selectedObject={selectedObject} 
        onBack={handleBack} 
      />
    );
  }

  // Fallback
  return (
    <div className="flex flex-col h-full bg-white w-80 shrink-0 border-l border-gray-200 overflow-y-auto p-5">
      <button onClick={handleBack} className="text-sm text-gray-500 mb-4 hover:text-gray-800">
        &larr; Back to Add
      </button>
      <h3 className="font-semibold mb-4">Object Selected</h3>
    </div>
  );
};
