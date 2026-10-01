import { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';

/** Fabric JSON per surface id, plus one product colour shared by all surfaces (as in Bagisto). */
export interface DesignState {
  surfaces: Record<string, object | null>;
  color: string;
}

const storageKey = (key: string) => `print-shop-ui:design:${key}`;

const readStored = (key: string): DesignState | null => {
  try {
    const saved = localStorage.getItem(storageKey(key));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useDesignHistory = (
  canvasRef: React.MutableRefObject<fabric.Canvas | null>,
  activeSurface: string,
  isCanvasReady: boolean,
  persistKey: string
) => {
  const [designs, setDesigns] = useState<DesignState>(
    () => readStored(persistKey) || { surfaces: {}, color: 'transparent' }
  );

  const currentJson = useCallback(
    () => (canvasRef.current ? canvasRef.current.toJSON(['id', 'elementType', 'qrAction', 'qrContent']) : null),
    [canvasRef]
  );

  const saveCurrentSurfaceToState = useCallback(() => {
    const json = currentJson();
    if (!json) return;
    setDesigns(prev => ({
      ...prev,
      surfaces: { ...prev.surfaces, [activeSurface]: json }
    }));
  }, [currentJson, activeSurface]);

  const loadSurfaceToCanvas = useCallback((surface: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !(canvas as any).contextContainer) return;
    const json = designs.surfaces[surface];
    if (json) {
      canvas.loadFromJSON(json, () => {
        canvas.backgroundColor = 'transparent';
        canvas.renderAll();
      });
    } else {
      // Safely clear without crashing if context is missing
      const objects = canvas.getObjects();
      objects.forEach(obj => canvas.remove(obj));
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
    }
  }, [canvasRef, designs]);

  // Handle switching tabs
  useEffect(() => {
    if (!isCanvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas || !(canvas as any).contextContainer) return;
    loadSurfaceToCanvas(activeSurface);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSurface, isCanvasReady]); // Intentionally omitting designs to prevent loop

  /** Flushes the active surface and returns the complete design (also kept for next visit). */
  const flushDesign = (): DesignState => {
    const json = currentJson();
    const finalState: DesignState = json
      ? { ...designs, surfaces: { ...designs.surfaces, [activeSurface]: json } }
      : designs;

    setDesigns(finalState);

    try {
      localStorage.setItem(storageKey(persistKey), JSON.stringify(finalState));
    } catch {
      // Large uploaded images can exceed storage; the design still works for this visit.
    }

    return finalState;
  };

  const changeBackgroundColor = (color: string) => {
    setDesigns(prev => ({ ...prev, color }));
  };

  return {
    designs,
    currentSurfaceColor: designs.color || 'transparent',
    saveCurrentSurfaceToState,
    flushDesign,
    changeBackgroundColor
  };
};
