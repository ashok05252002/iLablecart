import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { ProductMockup } from './ProductMockup';
import { PrintAreaGuides } from './PrintAreaGuides';
import { ZoomControls } from './ZoomControls';
import { resizeCanvas, useFabricCanvas } from './hooks/useFabricCanvas';
import { renderColorizedFabric, preloadMockupImages, hasColor as isColorSet } from './utils/fabricShading';
import { CustomizerConfig, SurfaceConfig } from './constants/surfaceConfig';

interface DesignCanvasProps {
  onSelectionChange: (obj: fabric.Object | null) => void;
  onStateChange: () => void;
  backgroundColor: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  customizer: CustomizerConfig;
  surface: SurfaceConfig;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  onSelectionChange,
  onStateChange,
  backgroundColor,
  onCanvasReady,
  customizer,
  surface
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricColorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(customizer.defaultZoom);
  const hasColor = isColorSet(backgroundColor);

  const canvas = useFabricCanvas('product-designer-canvas', onSelectionChange, onStateChange);

  // Default zoom, reduced when the workspace (600x750 + note) does not fit, e.g. on phones
  const fitZoom = () => {
    const box = containerRef.current;
    if (!box) return customizer.defaultZoom;
    const fit = Math.min(box.clientWidth / 600, box.clientHeight / 800) * 0.95;
    return Number(Math.min(customizer.defaultZoom, Math.max(0.15, fit)).toFixed(2));
  };

  // Keep fitting while the layout settles (designer height, mobile sidebar) until the user zooms
  const userZoomed = useRef(false);

  useLayoutEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      if (!userZoomed.current && box.clientHeight > 100) {
        setZoom(fitZoom());
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customizer]);

  useEffect(() => {
    preloadMockupImages(customizer.surfaces);
  }, [customizer]);

  // Match the fabric canvas to the active surface before its design is loaded (child effects run first)
  useEffect(() => {
    if (canvas) {
      resizeCanvas(canvas, surface.canvasWidth, surface.canvasHeight);
    }
  }, [canvas, surface]);

  // Render pixel-level colorized product whenever color or surface changes
  useEffect(() => {
    const colorCanvas = fabricColorCanvasRef.current;
    if (!colorCanvas) return;

    if (!hasColor) {
      const ctx = colorCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
      return;
    }

    renderColorizedFabric(colorCanvas, surface, backgroundColor);
  }, [hasColor, backgroundColor, surface]);

  useEffect(() => {
    if (canvas) {
      onCanvasReady(canvas);
    }
  }, [canvas, onCanvasReady]);

  // Keep canvas transparent so the product texture and color tint show through
  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
    }
  }, [canvas]);

  // Update canvas coordinates when surface or zoom changes
  useEffect(() => {
    if (canvas) {
      const timer = setTimeout(() => {
        canvas.calcOffset();
        canvas.renderAll();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [canvas, surface, zoom]);

  const handleZoomIn = () => {
    userZoomed.current = true;
    setZoom(prev => Math.min(Number((prev + 0.05).toFixed(2)), 1.5));
  };
  const handleZoomOut = () => {
    userZoomed.current = true;
    setZoom(prev => Math.max(Number((prev - 0.05).toFixed(2)), 0.15));
  };
  const handleFit = () => {
    userZoomed.current = false;
    setZoom(fitZoom());
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full min-h-0 bg-gray-50 relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
      />

      {/* Scaled Workspace */}
      <div
        className="relative transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          width: 600, // Mockup visual width
          flexShrink: 0, // keep the 600x750 frame on narrow screens so print areas stay aligned
          height: 750, // Mockup visual height
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          isolation: 'isolate'
        }}
      >
        <ProductMockup surface={surface} />

        {/* Printable Area */}
        <div
          className="absolute z-20 pointer-events-auto flex items-center justify-center transition-all duration-200"
          style={surface.printAreaStyle as React.CSSProperties}
        >
          {/* Colorized product layer */}
          <canvas
            ref={fabricColorCanvasRef}
            width={surface.canvasWidth}
            height={surface.canvasHeight}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              width: '100%',
              height: '100%',
              display: hasColor ? 'block' : 'none'
            }}
          />

          {/* The Fabric JS Canvas */}
          <div
            className="absolute inset-0 z-20"
            dangerouslySetInnerHTML={{ __html: '<canvas id="product-designer-canvas"></canvas>' }}
          />

          <PrintAreaGuides surface={surface} />
        </div>

        {/* Note label at the very bottom (below the product) */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
          <span className="text-gray-900 text-sm font-bold whitespace-nowrap">
            Note : Lines and dots won't be printed on the product
          </span>
        </div>
      </div>
    </div>
  );
};
