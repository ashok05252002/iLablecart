import { CANVAS_SIZE } from './canvas';

/**
 * Per product type designer config. Every mockup is drawn on the same 1600x2000 frame
 * (shown at 960x1200 inside the 600x750 workspace), so print areas map 1:1 between
 * the on-screen canvas (printAreaStyle) and the saved composite image (sourceCrop).
 */

export type CustomizerType = 'tshirt' | 'pen' | 'diary';

export interface SurfaceConfig {
  id: string;
  name: string;
  mockupSrc: string;
  /** Logical size of the fabric canvas for this surface. */
  canvasWidth: number;
  canvasHeight: number;
  printAreaStyle: {
    width: number;
    height: number;
    top: number;
    left: number | string;
    transform: string;
    transformOrigin: string;
  };
  /** Print area on the 1600x2000 mockup image. */
  sourceCrop: { x: number; y: number; width: number; height: number };
  /** 'tshirt' / 'tshirt-sleeve' keep the original guides, 'box' draws a labelled dashed box. */
  guide: 'tshirt' | 'tshirt-sleeve' | 'box';
  sizeLabel?: { width: string; height?: string };
}

export interface CustomizerConfig {
  type: CustomizerType;
  label: string;
  surfaces: SurfaceConfig[];
  defaultZoom: number;
  colorLabel: string;
  /** Part of the 1600x2000 composite kept for cart / order previews. */
  previewCrop: { x: number; y: number; width: number; height: number };
}

export const MOCKUP_WIDTH = 1600;
export const MOCKUP_HEIGHT = 2000;

/** Converts a print rectangle on the mockup image into the on-screen print area style. */
const area = (x: number, y: number, width: number, height: number) => {
  const canvasWidth = CANVAS_SIZE;
  const canvasHeight = Math.round((CANVAS_SIZE * height) / width);
  const scale = (width * 0.6) / canvasWidth;

  return {
    canvasWidth,
    canvasHeight,
    printAreaStyle: {
      width: canvasWidth,
      height: canvasHeight,
      top: Math.round(y * 0.6 - 249),
      left: Math.round(x * 0.6 - 180),
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    },
    sourceCrop: { x, y, width, height },
  };
};

const TSHIRT_SURFACES: SurfaceConfig[] = [
  {
    id: 'front',
    name: 'Front',
    mockupSrc: '/designer/tshirt-front.png',
    canvasWidth: CANVAS_SIZE,
    canvasHeight: CANVAS_SIZE,
    printAreaStyle: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      top: 20,
      left: '50%',
      transform: 'translateX(-50%) scale(0.25)',
      transformOrigin: 'top center',
    },
    // Front chest printable fabric area on 1600x2000 image
    sourceCrop: { x: 550, y: 440, width: 500, height: 500 },
    guide: 'tshirt',
  },
  {
    id: 'back',
    name: 'Back',
    mockupSrc: '/designer/tshirt-back.png',
    canvasWidth: CANVAS_SIZE,
    canvasHeight: CANVAS_SIZE,
    printAreaStyle: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      top: 20,
      left: '50%',
      transform: 'translateX(-50%) scale(0.25)',
      transformOrigin: 'top center',
    },
    // Back upper torso printable fabric area on 1600x2000 image
    sourceCrop: { x: 550, y: 440, width: 500, height: 500 },
    guide: 'tshirt',
  },
  {
    id: 'rightSleeve',
    name: 'Right Sleeve',
    mockupSrc: '/designer/tshirt-right-sleeve.png',
    canvasWidth: CANVAS_SIZE,
    canvasHeight: CANVAS_SIZE,
    printAreaStyle: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      top: 310,
      left: 380,
      transform: 'translate(-50%, -50%) scale(0.25)',
      transformOrigin: 'center center',
    },
    // Right sleeve pure fabric area on 1600x2000 image (excludes torso, armpit & seam)
    sourceCrop: { x: 683, y: 667, width: 500, height: 500 },
    guide: 'tshirt-sleeve',
  },
  {
    id: 'leftSleeve',
    name: 'Left Sleeve',
    mockupSrc: '/designer/tshirt-left-sleeve.png',
    canvasWidth: CANVAS_SIZE,
    canvasHeight: CANVAS_SIZE,
    printAreaStyle: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      top: 310,
      left: 220,
      transform: 'translate(-50%, -50%) scale(0.25)',
      transformOrigin: 'center center',
    },
    // Left sleeve pure fabric area on 1600x2000 image (excludes torso, armpit & seam)
    sourceCrop: { x: 417, y: 667, width: 500, height: 500 },
    guide: 'tshirt-sleeve',
  },
];

export const CUSTOMIZERS: Record<CustomizerType, CustomizerConfig> = {
  tshirt: {
    type: 'tshirt',
    label: 'T-Shirt',
    surfaces: TSHIRT_SURFACES,
    defaultZoom: 0.75,
    colorLabel: 'Background Color',
    previewCrop: { x: 0, y: 0, width: MOCKUP_WIDTH, height: MOCKUP_HEIGHT },
  },
  diary: {
    type: 'diary',
    label: 'Diary',
    surfaces: [
      {
        id: 'frontCover',
        name: 'Front Cover',
        mockupSrc: '/designer/diary-front.png',
        ...area(417, 470, 780, 1120),
        guide: 'box',
        sizeLabel: { width: '5.8 in', height: '8.3 in' },
      },
      {
        id: 'backCover',
        name: 'Back Cover',
        mockupSrc: '/designer/diary-back.png',
        ...area(402, 470, 780, 1120),
        guide: 'box',
        sizeLabel: { width: '5.8 in', height: '8.3 in' },
      },
    ],
    defaultZoom: 0.75,
    colorLabel: 'Cover Color',
    previewCrop: { x: 0, y: 0, width: MOCKUP_WIDTH, height: MOCKUP_HEIGHT },
  },
  pen: {
    type: 'pen',
    label: 'Pen',
    surfaces: [
      {
        id: 'barrel',
        name: 'Barrel',
        mockupSrc: '/designer/pen-barrel.png',
        ...area(520, 962, 720, 76),
        guide: 'box',
        sizeLabel: { width: '50 x 8 mm' },
      },
    ],
    defaultZoom: 1,
    colorLabel: 'Barrel Color',
    previewCrop: { x: 100, y: 300, width: 1400, height: 1400 },
  },
};

export const getCustomizer = (type?: string | null): CustomizerConfig =>
  CUSTOMIZERS[(type as CustomizerType) || 'tshirt'] || CUSTOMIZERS.tshirt;
