import React from 'react';
import { DynamicFarmSkyAndField } from './DynamicFarmSkyAndField';

interface BackgroundProps {
  children: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden text-white selection:bg-white selection:text-slate-950 font-sans bg-[#0c1e13]">
      {/* Dynamic Animated Sky & Field with Waving Grass, Moving Clouds, Sun Flare & Floating Wind Pollen */}
      <DynamicFarmSkyAndField />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
