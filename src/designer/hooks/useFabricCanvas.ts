import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { CANVAS_SIZE, enforceBoundingBox } from '../utils/fabricUtils';
import { initSmartGuides } from '../utils/smartGuides';

/** Resize the canvas to a surface's logical size and keep the clipping mask in sync. */
export const resizeCanvas = (canvas: fabric.Canvas, width: number, height: number) => {
  if (canvas.getWidth() !== width || canvas.getHeight() !== height) {
    canvas.setDimensions({ width, height });
  }
  canvas.clipPath = new fabric.Rect({
    left: 0,
    top: 0,
    width,
    height,
    absolutePositioned: true
  });
  canvas.calcOffset();
  canvas.requestRenderAll();
};

export const useFabricCanvas = (
  canvasId: string, 
  onSelectionChange: (obj: fabric.Object | null) => void,
  onStateChange: () => void
) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  
  // Use refs for callbacks so they don't trigger re-initialization
  const selectionCallbackRef = useRef(onSelectionChange);
  const stateCallbackRef = useRef(onStateChange);
  
  useEffect(() => {
    selectionCallbackRef.current = onSelectionChange;
    stateCallbackRef.current = onStateChange;
  }, [onSelectionChange, onStateChange]);

  useEffect(() => {
    if (canvasRef.current) return;
    
    const initCanvas = new fabric.Canvas(canvasId, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: 'transparent'
    });

    // Smart Guides Integration
    initSmartGuides(initCanvas);
    
    // Customize selection appearance (Scale values up 4x because canvas is visually scaled down by 0.25 via CSS)
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#25843D',
      cornerStrokeColor: '#25843D',
      borderColor: '#25843D',
      cornerSize: 40, // 40 * 0.25 = 10px visually
      padding: 20, // 20 * 0.25 = 5px visually
      cornerStyle: 'circle',
      borderScaleFactor: 4, // 4 * 0.25 = 1px border visually
      borderDashArray: [4, 4], // Make the border dashed for better visibility
    });

    // Visual Clipping Mask to ensure no drawing goes out of the print area
    initCanvas.clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      absolutePositioned: true
    });

    const handleSelection = () => {
      const activeObj = initCanvas.getActiveObject();
      selectionCallbackRef.current(activeObj || null);
    };

    initCanvas.on('selection:created', handleSelection);
    initCanvas.on('selection:updated', handleSelection);
    initCanvas.on('selection:cleared', handleSelection);
    
    // Boundary enforcement
    initCanvas.on('object:moving', (e) => {
      if (e.target) {
        enforceBoundingBox(e.target);
      }
    });

    // For scaling and rotating, if it goes out of bounds, we can revert its transform or clamp it.
    // The easiest robust way is to save safe state on 'before:transform' and revert if out of bounds.
    let safeState: any = null;

    initCanvas.on('before:transform', (e) => {
      if (e.transform && e.transform.target) {
        const t = e.transform.target;
        safeState = {
          left: t.left,
          top: t.top,
          scaleX: t.scaleX,
          scaleY: t.scaleY,
          angle: t.angle
        };
      }
    });

    const enforceTransform = (e: fabric.IEvent<Event>) => {
      if (!e.target || !safeState) return;
      e.target.setCoords();
      const boundingRect = e.target.getBoundingRect();
      const zoom = initCanvas.getZoom();
      const panX = initCanvas.viewportTransform?.[4] || 0;
      const panY = initCanvas.viewportTransform?.[5] || 0;
      
      const logicalLeft = (boundingRect.left - panX) / zoom;
      const logicalTop = (boundingRect.top - panY) / zoom;
      const logicalWidth = boundingRect.width / zoom;
      const logicalHeight = boundingRect.height / zoom;

      const tolerance = 4;
      const canvasWidth = initCanvas.getWidth();
      const canvasHeight = initCanvas.getHeight();

      if (
        logicalLeft < -tolerance || 
        logicalTop < -tolerance || 
        logicalLeft + logicalWidth > canvasWidth + tolerance || 
        logicalTop + logicalHeight > canvasHeight + tolerance
      ) {
        e.target.set(safeState);
        e.target.setCoords();
        initCanvas.renderAll();
      } else {
        // update safe state as long as it's safe
        safeState = {
          left: e.target.left,
          top: e.target.top,
          scaleX: e.target.scaleX,
          scaleY: e.target.scaleY,
          angle: e.target.angle
        };
      }
    };

    initCanvas.on('object:scaling', enforceTransform);
    initCanvas.on('object:rotating', enforceTransform);

    initCanvas.on('object:modified', (e) => {
      if (e.target) enforceBoundingBox(e.target);
      stateCallbackRef.current();
    });
    
    initCanvas.on('object:added', (e) => {
      if (e.target) enforceBoundingBox(e.target);
      stateCallbackRef.current();
    });
    
    initCanvas.on('object:removed', () => {
      stateCallbackRef.current();
    });

    canvasRef.current = initCanvas;
    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
      canvasRef.current = null;
      setCanvas(null);
    };
  }, [canvasId]); // Only re-init if canvasId changes

  return canvas;
};

