import React from 'react';
import { SurfaceConfig } from './constants/surfaceConfig';

interface DesignTabsProps {
  surfaces: SurfaceConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DesignTabs: React.FC<DesignTabsProps> = ({ surfaces, activeTab, onTabChange }) => {
  return (
    <div className="flex bg-white border-b border-gray-200 px-6 h-12 shrink-0 overflow-x-auto max-md:px-2">
      {surfaces.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-6 h-full font-medium text-sm transition-colors relative whitespace-nowrap max-md:px-3 ${
            activeTab === tab.id
              ? 'text-[#25843D] border-b-2 border-[#25843D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};
