import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { DesignerHeader } from './DesignerHeader';
import { DesignTabs } from './DesignTabs';
import { DesignCanvas } from './DesignCanvas';
import { SidebarRouter } from './sidebar/SidebarRouter';
import { useDesignHistory } from './hooks/useDesignHistory';
import { CustomizerConfig } from './constants/surfaceConfig';
import { generateComposite } from './utils/composite';

export interface SavedDesign {
  /** Composite preview per surface id (webp data URLs). */
  images: Record<string, string>;
  /** Image shown in cart / orders, like customized_preview in Bagisto. */
  preview: string;
  color: string;
  designJson: Record<string, object | null>;
}

interface ProductDesignerProps {
  title: string;
  backUrl: string;
  persistKey: string;
  customizer: CustomizerConfig;
  onSaved: (design: SavedDesign) => void;
  onError: (message: string) => void;
}

/** Port of the custom-print-shirt designer, driven by a per product type config (T-shirt, pen, diary). */
export const ProductDesigner: React.FC<ProductDesignerProps> = ({ title, backUrl, persistKey, customizer, onSaved, onError }) => {
  const [activeTab, setActiveTab] = useState<string>(customizer.surfaces[0].id);
  const canvasRef = React.useRef<fabric.Canvas | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const surface = customizer.surfaces.find((item) => item.id === activeTab) || customizer.surfaces[0];

  const {
    currentSurfaceColor,
    saveCurrentSurfaceToState,
    flushDesign,
    changeBackgroundColor
  } = useDesignHistory(canvasRef, activeTab, isCanvasReady, persistKey);

  // Fill the viewport below the store header (the Bagisto page hides the footer the same way)
  useLayoutEffect(() => {
    const resize = () => {
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      setHeight(Math.max(560, window.innerHeight - top - window.scrollY));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleTabChange = (newTab: string) => {
    // Save current before switching
    saveCurrentSurfaceToState();

    // Clear selection so sidebar resets
    if (canvasRef.current) {
      canvasRef.current.discardActiveObject();
      setSelectedObject(null);
    }

    setActiveTab(newTab);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      canvasRef.current?.discardActiveObject();
      const design = flushDesign();
      const images: Record<string, string> = {};

      for (const item of customizer.surfaces) {
        images[item.id] = await generateComposite(customizer, item, design.surfaces[item.id], design.color);
      }

      onSaved({
        images,
        preview: images[customizer.surfaces[0].id],
        color: design.color,
        designJson: design.surfaces,
      });
    } catch (error: any) {
      setIsSaving(false);
      onError(error?.message || 'Error saving design');
    }
  };

  const handleCanvasReady = useCallback((c: fabric.Canvas) => {
    canvasRef.current = c;
    setIsCanvasReady(true);
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col w-full bg-gray-50 overflow-hidden font-sans" style={{ height }}>
      <DesignerHeader title={title} backUrl={backUrl} isSaving={isSaving} onSave={handleSave} />
      <DesignTabs surfaces={customizer.surfaces} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 relative min-h-0">
        {/* On phones the sidebar stacks under the canvas */}
        <div className="absolute inset-0 flex overflow-hidden max-md:flex-col">
          <DesignCanvas
            customizer={customizer}
            surface={surface}
            backgroundColor={currentSurfaceColor}
            onSelectionChange={setSelectedObject}
            onStateChange={saveCurrentSurfaceToState}
            onCanvasReady={handleCanvasReady}
          />

          {isCanvasReady && canvasRef.current && (
            <div className="flex h-full w-80 shrink-0 flex-col border-l border-gray-200 bg-white max-md:h-[45%] max-md:w-full max-md:border-l-0 max-md:border-t">
              <div className="flex min-h-0 flex-1 [&>div]:w-full [&>div]:border-l-0">
                <SidebarRouter
                  canvas={canvasRef.current}
                  selectedObject={selectedObject}
                  colorLabel={customizer.colorLabel}
                  backgroundColor={currentSurfaceColor}
                  onBackgroundColorChange={changeBackgroundColor}
                />
              </div>

              {/* Always-visible save, so customers never have to look for the header button */}
              <div className="shrink-0 border-t border-gray-200 bg-white p-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25843D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E6B32] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Design & Add to Cart'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
