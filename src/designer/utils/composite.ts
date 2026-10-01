import { fabric } from 'fabric';
import { CustomizerConfig, MOCKUP_HEIGHT, MOCKUP_WIDTH, SurfaceConfig } from '../constants/surfaceConfig';
import { drawColorizedCrop, hasColor, loadMockupImage } from './fabricShading';

/** Longest side of the saved preview images (kept small so the mock cart fits in browser storage). */
const PREVIEW_MAX = 720;

/**
 * Port of generateCompositeMockup() from the Bagisto designer page: mockup + colour tint +
 * the surface's design drawn into its print area, returned as a webp data URL.
 */
export const generateComposite = async (
  customizer: CustomizerConfig,
  surface: SurfaceConfig,
  designJson: any,
  color: string
): Promise<string> => {
  const offscreen = document.createElement('canvas');
  offscreen.width = MOCKUP_WIDTH;
  offscreen.height = MOCKUP_HEIGHT;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return '';

  const crop = surface.sourceCrop;
  const mockup = await loadMockupImage(surface.mockupSrc);

  if (mockup) {
    ctx.drawImage(mockup, 0, 0, MOCKUP_WIDTH, MOCKUP_HEIGHT);

    if (hasColor(color)) {
      drawColorizedCrop(ctx, mockup, surface, color, crop.x, crop.y, crop.width, crop.height);
    }
  }

  if (designJson?.objects?.length) {
    const vectorCanvas = document.createElement('canvas');
    const tempFabric = new fabric.StaticCanvas(vectorCanvas, {
      width: surface.canvasWidth,
      height: surface.canvasHeight,
      backgroundColor: 'transparent',
    });

    await new Promise<void>((resolve) => {
      tempFabric.loadFromJSON(designJson, () => {
        tempFabric.backgroundColor = 'transparent';
        tempFabric.renderAll();
        ctx.drawImage(tempFabric.getElement(), crop.x, crop.y, crop.width, crop.height);
        resolve();
      });
    });

    tempFabric.dispose();
  }

  const view = customizer.previewCrop;
  const ratio = Math.min(1, PREVIEW_MAX / Math.max(view.width, view.height));
  const out = document.createElement('canvas');
  out.width = Math.round(view.width * ratio);
  out.height = Math.round(view.height * ratio);
  out.getContext('2d')?.drawImage(offscreen, view.x, view.y, view.width, view.height, 0, 0, out.width, out.height);

  return out.toDataURL('image/webp', 0.85);
};
