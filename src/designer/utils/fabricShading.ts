import { SurfaceConfig } from '../constants/surfaceConfig';

const loadedImages: Record<string, HTMLImageElement> = {};
let currentRenderVersion = 0;

export const loadMockupImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const cached = loadedImages[src];
    if (cached && cached.complete && cached.naturalWidth > 0) {
      resolve(cached);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImages[src] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

export const preloadMockupImages = (surfaces: SurfaceConfig[]) => {
  if (typeof window === 'undefined') return;
  surfaces.forEach((surface) => loadMockupImage(surface.mockupSrc));
};

export const hasColor = (color?: string | null) => !!color && color !== 'transparent' && color !== 'none';

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
};

export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const buildColorLUT = (
  tr: number,
  tg: number,
  tb: number,
  fabricMean: number
): { lutR: Uint8Array; lutG: Uint8Array; lutB: Uint8Array; isWhite: boolean } => {
  const { h, s, l: targetL } = rgbToHsl(tr, tg, tb);

  const lutR = new Uint8Array(256);
  const lutG = new Uint8Array(256);
  const lutB = new Uint8Array(256);

  const isWhite = targetL > 0.96 && s < 0.05;
  const isBlack = targetL < 0.05;

  for (let lum = 0; lum < 256; lum++) {
    const normLum = lum / 255;

    if (isWhite) {
      lutR[lum] = lum;
      lutG[lum] = lum;
      lutB[lum] = lum;
      continue;
    }

    if (isBlack) {
      // Black cotton fabric:
      // Deep folds are jet black, normal fabric is charcoal, highlights are soft graphite sheen
      const lMin = 0.02;
      const lBase = 0.08;
      const lMax = 0.22;
      let outL: number;
      if (normLum < fabricMean) {
        const t = Math.pow(normLum / fabricMean, 1.9);
        outL = lMin + (lBase - lMin) * t;
      } else {
        const t = Math.min(1.0, (normLum - fabricMean) / Math.max(0.01, 1.0 - fabricMean));
        outL = lBase + (lMax - lBase) * t;
      }
      const rgb = hslToRgb(0, 0, outL);
      lutR[lum] = rgb.r;
      lutG[lum] = rgb.g;
      lutB[lum] = rgb.b;
      continue;
    }

    // Base lightness clamped between 0.24 and 0.54
    const baseL = Math.max(0.24, Math.min(0.54, targetL));
    // Folds descend into rich, deep shades of the chosen color
    const minL = Math.max(0.06, baseL * 0.30);
    // Highlights strictly clamped (<= 0.65) to prevent pure white patches
    const maxL = Math.min(0.65, baseL + 0.16);

    let outL: number;
    if (normLum < fabricMean) {
      // Fold / shadow
      const t = Math.pow(Math.max(0, normLum / fabricMean), 1.9);
      outL = minL + (baseL - minL) * t;
    } else {
      // Highlight / crest
      const t = Math.min(1.0, (normLum - fabricMean) / Math.max(0.01, 1.0 - fabricMean));
      outL = baseL + (maxL - baseL) * t;
    }

    // If s < 0.15 (neutral/gray like #4B4444 or #5F3535), preserve low saturation so it NEVER turns red!
    // If s >= 0.15 (chromatic color), preserve high saturation so it never washes out to white!
    const outS = s < 0.15 ? s : Math.min(1.0, Math.max(s, 0.75));
    const rgb = hslToRgb(h, outS, outL);

    lutR[lum] = rgb.r;
    lutG[lum] = rgb.g;
    lutB[lum] = rgb.b;
  }

  return { lutR, lutG, lutB, isWhite };
};

/**
 * Draws the print-area crop of the mockup into ctx (target rect dx,dy,dw,dh) and recolours it
 * with the chosen product colour, keeping the folds / texture of the original photo.
 */
export const drawColorizedCrop = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  surface: SurfaceConfig,
  colorHex: string,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) => {
  const targetRgb = hexToRgb(colorHex);
  if (!targetRgb) return;

  const work = document.createElement('canvas');
  work.width = Math.round(dw);
  work.height = Math.round(dh);
  const wctx = work.getContext('2d', { willReadFrequently: true });
  if (!wctx) return;

  const { x, y, width, height } = surface.sourceCrop;
  wctx.drawImage(img, x, y, width, height, 0, 0, work.width, work.height);

  const imgData = wctx.getImageData(0, 0, work.width, work.height);
  const data = imgData.data;
  const len = data.length;

  // Calculate mean fabric luminance across the valid fabric pixels
  let totalLum = 0;
  let count = 0;
  for (let i = 0; i < len; i += 64) {
    if (data[i + 3] > 80 && data[i] > 60) {
      totalLum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      count++;
    }
  }
  const fabricMean = count > 0 ? (totalLum / count) / 255 : 0.88;

  const { lutR, lutG, lutB, isWhite } = buildColorLUT(targetRgb.r, targetRgb.g, targetRgb.b, fabricMean);

  // If pure white was selected, keep original texture untouched
  if (isWhite) return;

  // Map every product pixel through the LUT
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    const lum = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    data[i] = lutR[lum];
    data[i + 1] = lutG[lum];
    data[i + 2] = lutB[lum];
  }

  wctx.putImageData(imgData, 0, 0);
  ctx.drawImage(work, dx, dy, dw, dh);
};

/** Renders the colourised print area into the on-screen colour layer canvas. */
export const renderColorizedFabric = (canvas: HTMLCanvasElement, surface: SurfaceConfig, colorHex: string) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const thisRenderVersion = ++currentRenderVersion;

  loadMockupImage(surface.mockupSrc).then((img) => {
    // Stale render check - if another render was initiated while loading, abort!
    if (!img || thisRenderVersion !== currentRenderVersion) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawColorizedCrop(ctx, img, surface, colorHex, 0, 0, canvas.width, canvas.height);
  });
};
