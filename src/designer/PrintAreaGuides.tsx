import React from 'react';
import { SurfaceConfig } from './constants/surfaceConfig';

interface PrintAreaGuidesProps {
  surface: SurfaceConfig;
}

/** Dashed print-area box with size labels, sized to the surface's canvas (pens, diaries). */
const BoxGuide: React.FC<{ surface: SurfaceConfig }> = ({ surface }) => {
  // Keep lines and labels the same on-screen size whatever the surface scale is
  const scale = Number(/scale(([d.]+))/.exec(surface.printAreaStyle.transform)?.[1] || 0.25);
  const k = 0.25 / scale;
  const label = { fontSize: 48 * k, lineHeight: 1 };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 font-sans">
      <div
        className="absolute inset-0 border-red-500 border-dashed opacity-80"
        style={{ borderWidth: 4 * k }}
      />
      {surface.sizeLabel?.height && (
        <span
          className="absolute top-1/2 text-gray-800 font-semibold whitespace-nowrap tracking-wide"
          style={{ ...label, left: -16 * k, transform: 'translate(-100%, -50%)' }}
        >
          {surface.sizeLabel.height}
        </span>
      )}
      {surface.sizeLabel && (
        <span
          className="absolute left-1/2 -translate-x-1/2 text-gray-800 font-semibold whitespace-nowrap tracking-wide"
          style={{ ...label, bottom: -32 * k - label.fontSize }}
        >
          {surface.sizeLabel.width}
        </span>
      )}
    </div>
  );
};

export const PrintAreaGuides: React.FC<PrintAreaGuidesProps> = ({ surface }) => {
  if (surface.guide === 'box') {
    return <BoxGuide surface={surface} />;
  }

  if (surface.guide === 'tshirt-sleeve') {
    return (
      <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center font-sans">
        {/* Sleeve Red Dotted / Dashed Bounding Box */}
        <div className="w-[1200px] h-[1200px] border-[4px] border-red-500 border-dashed opacity-80 relative flex items-center justify-center pointer-events-none">
          {/* Left Label "12 in" */}
          <div className="absolute -left-[100px] top-1/2 -translate-y-1/2 -rotate-90 flex items-center justify-center">
            <span className="text-gray-800 text-[48px] font-semibold whitespace-nowrap tracking-wide">12 in</span>
          </div>
          {/* Bottom Label "12 in" */}
          <div className="absolute -bottom-[80px] left-1/2 -translate-x-1/2 flex items-center justify-center">
            <span className="text-gray-800 text-[48px] font-semibold whitespace-nowrap tracking-wide">12 in</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center font-sans">
      {/* 12x12 Main Print Area Box */}
      <div className="w-[1200px] h-[1200px] border-[4px] border-red-500 border-dashed opacity-80 relative flex items-center justify-center pointer-events-none">
        
        {/* Left Label "12 in" */}
        <div className="absolute -left-[100px] top-1/2 -translate-y-1/2 -rotate-90 flex items-center justify-center">
          <span className="text-gray-800 text-[48px] font-semibold whitespace-nowrap tracking-wide">12 in</span>
        </div>

        {/* Bottom Label "12 in" */}
        <div className="absolute -bottom-[80px] left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="text-gray-800 text-[48px] font-semibold whitespace-nowrap tracking-wide">12 in</span>
        </div>

        {/* 12x6 Horizontal Guide */}
        <div className="absolute top-[600px] left-0 w-full h-0 border-t-[4px] border-gray-400 border-dashed opacity-70"></div>
        {/* Line extending to the right for 12x6 label */}
        <div className="absolute top-[600px] -right-[60px] w-[60px] h-0 border-t-[4px] border-gray-300"></div>
        <span className="absolute top-[600px] -right-[80px] translate-x-full -translate-y-1/2 text-gray-800 text-[40px] font-medium whitespace-nowrap">
          12x6 in
        </span>

        {/* 4x4 Guide Box (Top Right) */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] border-l-[4px] border-b-[4px] border-gray-400 border-dashed opacity-70"></div>
        {/* Line extending to the right for 4x4 label */}
        <div className="absolute top-[200px] -right-[60px] w-[60px] h-0 border-t-[4px] border-gray-300"></div>
        <span className="absolute top-[200px] -right-[80px] translate-x-full -translate-y-1/2 text-gray-800 text-[40px] font-medium whitespace-nowrap">
          4x4 in
        </span>
      </div>
    </div>
  );
};
