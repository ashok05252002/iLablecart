import React from 'react';
import { SurfaceConfig } from './constants/surfaceConfig';

interface ProductMockupProps {
  surface: SurfaceConfig;
}

export const ProductMockup: React.FC<ProductMockupProps> = ({ surface }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <img
        id="product-mockup-img"
        key={surface.mockupSrc}
        src={surface.mockupSrc}
        crossOrigin="anonymous"
        alt={`Mockup (${surface.name})`}
        className="drop-shadow-2xl transition-opacity duration-200"
        style={{
          width: '160%',
          height: '160%',
          maxWidth: 'none',
          objectFit: 'contain',
          transform: 'translateY(-2%)'
        }}
      />
    </div>
  );
};
