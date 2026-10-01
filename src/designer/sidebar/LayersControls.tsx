import React from 'react';
import { Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { fabric } from 'fabric';

interface LayersControlsProps {
  canvas: fabric.Canvas;
  selectedObject: fabric.Object;
}

export const LayersControls: React.FC<LayersControlsProps> = ({ canvas, selectedObject }) => {
  const [isLocked, setIsLocked] = React.useState(!!selectedObject.lockMovementX);

  React.useEffect(() => {
    setIsLocked(!!selectedObject.lockMovementX);
  }, [selectedObject]);

  const handleDuplicate = () => {
    selectedObject.clone((cloned: fabric.Object) => {
      // Offset slightly
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        // @ts-ignore
        id: crypto.randomUUID(),
        // @ts-ignore
        elementType: selectedObject.elementType
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      canvas.fire('object:added', { target: cloned });
    });
  };

  const handleDelete = () => {
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const handleToggleLock = () => {
    const lockState = !isLocked;
    selectedObject.set({
      lockMovementX: lockState,
      lockMovementY: lockState,
      lockScalingX: lockState,
      lockScalingY: lockState,
      lockRotation: lockState,
      hasControls: !lockState,
      selectable: true // allow selecting to unlock it later
    });
    setIsLocked(lockState);
    canvas.requestRenderAll();
    
    // Fire on the object itself so parents (like TextEditor) hear it
    selectedObject.fire('modified');
    canvas.fire('object:modified', { target: selectedObject });
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Layers</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button 
          onClick={handleDuplicate}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200"
        >
          <Copy size={16} /> Duplicate
        </button>
        <button 
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-md text-sm text-red-600 border border-red-200"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

      <button 
        onClick={handleToggleLock}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm border ${
          isLocked 
            ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100' 
            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
        }`}
      >
        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
        {isLocked ? 'Unlock' : 'Lock'}
      </button>
    </div>
  );
};
