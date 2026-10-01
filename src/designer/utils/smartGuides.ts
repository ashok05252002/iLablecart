import { fabric } from 'fabric';
import { CANVAS_SIZE } from './fabricUtils';

const SNAP_THRESHOLD = 10;
const RELEASE_THRESHOLD = 20; // Hysteresis to prevent jitter
const GUIDE_COLOR = '#35A64E'; // Visible Purple
const GUIDE_WIDTH = 4; // 4px on canvas = 1px visually (due to 0.25x CSS scale)

interface SnapLine {
  x?: number;
  y?: number;
}

let activeGuides: SnapLine[] = [];

// Track current snapped states for hysteresis
let snappedXLine: number | null = null;
let snappedYLine: number | null = null;

export const initSmartGuides = (canvas: fabric.Canvas) => {
  canvas.on('object:moving', (e) => handleObjectInteraction(e, canvas, true));
  canvas.on('object:scaling', (e) => handleObjectInteraction(e, canvas, false));
  
  const clearAndRender = () => {
    snappedXLine = null;
    snappedYLine = null;
    if (activeGuides.length > 0) {
      activeGuides = [];
      canvas.requestRenderAll();
    }
  };

  canvas.on('mouse:up', clearAndRender);
  canvas.on('selection:cleared', clearAndRender);
  
  // Fabric provides `after:render` which is perfect for overlays.
  canvas.on('after:render', (opt) => {
    const ctx = (opt as any).ctx || (canvas as any).contextContainer;
    if (activeGuides.length > 0 && ctx) {
      drawGuides(canvas, ctx);
    }
  });
};

const drawGuides = (canvas: fabric.Canvas, ctx: CanvasRenderingContext2D) => {
  const zoom = canvas.getZoom();
  const panX = canvas.viewportTransform?.[4] || 0;
  const panY = canvas.viewportTransform?.[5] || 0;
  
  ctx.save();
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = GUIDE_WIDTH;
  
  activeGuides.forEach(guide => {
    ctx.beginPath();
    if (guide.x !== undefined) {
      const screenX = Math.round(guide.x * zoom + panX) + 0.5;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.getHeight() || CANVAS_SIZE);
    }
    if (guide.y !== undefined) {
      const screenY = Math.round(guide.y * zoom + panY) + 0.5;
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.getWidth() || CANVAS_SIZE, screenY);
    }
    ctx.stroke();
  });
  
  ctx.restore();
};

const handleObjectInteraction = (e: fabric.IEvent<Event>, canvas: fabric.Canvas, doSnap: boolean) => {
  const obj = e.target;
  if (!obj) return;
  
  activeGuides = [];
  
  obj.setCoords();
  const boundingRect = obj.getBoundingRect();
  const zoom = canvas.getZoom();
  const panX = canvas.viewportTransform?.[4] || 0;
  const panY = canvas.viewportTransform?.[5] || 0;
  
  // Calculate logical coordinates independent of zoom
  const logicalLeft = (boundingRect.left - panX) / zoom;
  const logicalTop = (boundingRect.top - panY) / zoom;
  const logicalWidth = boundingRect.width / zoom;
  const logicalHeight = boundingRect.height / zoom;
  
  const logicalRight = logicalLeft + logicalWidth;
  const logicalBottom = logicalTop + logicalHeight;
  const logicalCenterX = logicalLeft + logicalWidth / 2;
  const logicalCenterY = logicalTop + logicalHeight / 2;

  const canvasWidth = canvas.getWidth() || CANVAS_SIZE;
  const canvasHeight = canvas.getHeight() || CANVAS_SIZE;
  const snapCandidatesX = [0, canvasWidth / 2, canvasWidth];
  const snapCandidatesY = [0, canvasHeight / 2, canvasHeight];

  canvas.getObjects().forEach(target => {
    if (target === obj) return;
    target.setCoords();
    const targetRect = target.getBoundingRect();
    const tLeft = (targetRect.left - panX) / zoom;
    const tTop = (targetRect.top - panY) / zoom;
    const tWidth = targetRect.width / zoom;
    const tHeight = targetRect.height / zoom;
    const tRight = tLeft + tWidth;
    const tBottom = tTop + tHeight;
    const tCenterX = tLeft + tWidth / 2;
    const tCenterY = tTop + tHeight / 2;

    snapCandidatesX.push(tLeft, tCenterX, tRight);
    snapCandidatesY.push(tTop, tCenterY, tBottom);
  });

  let dx = 0;
  let dy = 0;
  let isSnappedX = false;
  let isSnappedY = false;
  let newSnappedXLine: number | null = null;
  let newSnappedYLine: number | null = null;

  // Check X Snapping
  for (const snapX of snapCandidatesX) {
    if (isSnappedX) break;
    
    // Determine the active threshold: if we are already snapped to this line, use the larger release threshold
    const threshold = (snappedXLine === snapX) ? RELEASE_THRESHOLD : SNAP_THRESHOLD;
    
    if (Math.abs(logicalLeft - snapX) < threshold) { dx = snapX - logicalLeft; isSnappedX = true; activeGuides.push({ x: snapX }); newSnappedXLine = snapX; }
    else if (Math.abs(logicalCenterX - snapX) < threshold) { dx = snapX - logicalCenterX; isSnappedX = true; activeGuides.push({ x: snapX }); newSnappedXLine = snapX; }
    else if (Math.abs(logicalRight - snapX) < threshold) { dx = snapX - logicalRight; isSnappedX = true; activeGuides.push({ x: snapX }); newSnappedXLine = snapX; }
  }

  // Check Y Snapping
  for (const snapY of snapCandidatesY) {
    if (isSnappedY) break;
    
    const threshold = (snappedYLine === snapY) ? RELEASE_THRESHOLD : SNAP_THRESHOLD;
    
    if (Math.abs(logicalTop - snapY) < threshold) { dy = snapY - logicalTop; isSnappedY = true; activeGuides.push({ y: snapY }); newSnappedYLine = snapY; }
    else if (Math.abs(logicalCenterY - snapY) < threshold) { dy = snapY - logicalCenterY; isSnappedY = true; activeGuides.push({ y: snapY }); newSnappedYLine = snapY; }
    else if (Math.abs(logicalBottom - snapY) < threshold) { dy = snapY - logicalBottom; isSnappedY = true; activeGuides.push({ y: snapY }); newSnappedYLine = snapY; }
  }

  // Update states
  snappedXLine = newSnappedXLine;
  snappedYLine = newSnappedYLine;

  if (doSnap && (isSnappedX || isSnappedY)) {
    obj.set({
      left: (obj.left || 0) + dx,
      top: (obj.top || 0) + dy
    });
    obj.setCoords();
  }
};
