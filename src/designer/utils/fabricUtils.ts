import { fabric } from 'fabric';

import { CANVAS_SIZE } from '../constants/canvas';

export { CANVAS_SIZE };
export const PRINT_AREA_INCHES = 12;

/** Logical size of the canvas an object lives on (surfaces are not all square). */
export const canvasSize = (canvas?: fabric.Canvas | fabric.StaticCanvas | null) => ({
  width: canvas?.getWidth() || CANVAS_SIZE,
  height: canvas?.getHeight() || CANVAS_SIZE,
});

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

export const centerObject = (obj: fabric.Object, canvas: fabric.Canvas) => {
  const { width, height } = canvasSize(canvas);
  obj.set({
    left: (width - (obj.getScaledWidth() || 0)) / 2,
    top: (height - (obj.getScaledHeight() || 0)) / 2,
  });
  obj.setCoords();
  canvas.renderAll();
};

export const centerHorizontally = (obj: fabric.Object, canvas: fabric.Canvas) => {
  obj.set({
    left: (canvasSize(canvas).width - (obj.getScaledWidth() || 0)) / 2,
  });
  obj.setCoords();
  canvas.renderAll();
};

export const centerVertically = (obj: fabric.Object, canvas: fabric.Canvas) => {
  obj.set({
    top: (canvasSize(canvas).height - (obj.getScaledHeight() || 0)) / 2,
  });
  obj.setCoords();
  canvas.renderAll();
};

export const loadImageToCanvas = (
  file: File,
  canvas: fabric.Canvas,
  onComplete?: (img: fabric.Image) => void
) => {
  const reader = new FileReader();
  reader.onload = (f) => {
    const data = f.target?.result as string;
    fabric.Image.fromURL(data, (img) => {
      // Scale down if too large
      const { width, height } = canvasSize(canvas);
      const maxWidth = width * 0.8;
      const maxHeight = height * 0.8;
      const imgWidth = img.width || maxWidth;
      const imgHeight = img.height || maxHeight;
      
      if (imgWidth > maxWidth || imgHeight > maxHeight) {
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        img.scale(scale);
      }
      
      img.set({
        // @ts-ignore
        id: generateId(),
        elementType: 'image',
      });
      
      centerObject(img, canvas);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      if (onComplete) onComplete(img);
    });
  };
  reader.readAsDataURL(file);
};

export const enforceBoundingBox = (obj: fabric.Object) => {
  if (!obj) return;

  obj.setCoords(); // Ensure coordinates are updated before calculating bounding box
  
  const boundingRect = obj.getBoundingRect();
  const zoom = obj.canvas?.getZoom() || 1;
  const panX = obj.canvas?.viewportTransform?.[4] || 0;
  const panY = obj.canvas?.viewportTransform?.[5] || 0;
  
  // getBoundingRect returns coords relative to the canvas DOM element (factoring in zoom/pan).
  // We need the logical coordinates to clamp to the canvas size.
  const { width: canvasWidth, height: canvasHeight } = canvasSize(obj.canvas);
  const logicalLeft = (boundingRect.left - panX) / zoom;
  const logicalTop = (boundingRect.top - panY) / zoom;
  const logicalWidth = boundingRect.width / zoom;
  const logicalHeight = boundingRect.height / zoom;

  let outOfBounds = false;
  let newLeft = obj.left || 0;
  let newTop = obj.top || 0;

  if (logicalLeft < 0) {
    outOfBounds = true;
    newLeft = newLeft - logicalLeft;
  }
  if (logicalTop < 0) {
    outOfBounds = true;
    newTop = newTop - logicalTop;
  }
  if (logicalLeft + logicalWidth > canvasWidth) {
    outOfBounds = true;
    newLeft = newLeft - (logicalLeft + logicalWidth - canvasWidth);
  }
  if (logicalTop + logicalHeight > canvasHeight) {
    outOfBounds = true;
    newTop = newTop - (logicalTop + logicalHeight - canvasHeight);
  }

  // If the object's width/height is literally larger than the canvas, 
  // clamping position alone won't work perfectly, but we must do our best.
  // In `object:scaling`, we can prevent scale from exceeding bounds.
  
  if (outOfBounds) {
    obj.set({
      left: newLeft,
      top: newTop,
    });
    obj.setCoords();
  }
};

export const fitToPrintArea = (obj: fabric.Object, canvas: fabric.Canvas) => {
  if (!obj) return;
  
  // Ensure we are working with correct unscaled dimensions
  const unscaledWidth = obj.width || 0;
  const unscaledHeight = obj.height || 0;
  
  if (unscaledWidth === 0 || unscaledHeight === 0) return;

  // Fit nicely within print area with safe padding (94% of the canvas)
  // so the 8 coordinate resize handles remain clearly visible, accessible and resizable
  const { width: canvasWidth, height: canvasHeight } = canvasSize(canvas);
  
  obj.set({ scaleX: 1, scaleY: 1 });
  obj.setCoords();
  const bounding = obj.getBoundingRect(true);
  const boundW = bounding.width || unscaledWidth;
  const boundH = bounding.height || unscaledHeight;

  const maxScale = Math.min((canvasWidth * 0.94) / boundW, (canvasHeight * 0.94) / boundH);
  
  obj.set({
    scaleX: maxScale,
    scaleY: maxScale
  });
  
  obj.setCoords();
  centerObject(obj, canvas);
  canvas.requestRenderAll();
  canvas.fire('object:modified');
};
