'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { RATING_COLORS, VisitRating } from '@/types';
import { allRegionPaths, PrefecturePath } from '@/data/japan-svg-paths';

interface JapanRegionMapProps {
  className?: string;
  onRegionClick?: (regionId: string) => void;
  selectedRegion?: string; // For highlighting specific regions
}

export function JapanRegionMap({ className, onRegionClick, selectedRegion }: JapanRegionMapProps) {
  const { getVisitByRegion } = useSupabaseVisits();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const getRegionColor = (regionId: string) => {
    const visit = getVisitByRegion(regionId);
    const rating = visit?.rating ?? 0;
    return RATING_COLORS[rating as VisitRating];
  };

  const mapClickHandler = (regionId: string) => {
    onRegionClick?.(regionId);
  };

  const renderRegionPaths = (paths: PrefecturePath[]) => {
    return paths.map((prefecture) => (
      <path
        key={prefecture.id}
        id={prefecture.name}
        d={prefecture.path}
        fill={getRegionColor(prefecture.id)}
        className={cn(
          "cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200",
          hoveredRegion === prefecture.name && "stroke-black dark:stroke-white opacity-80",
          selectedRegion === prefecture.id && "stroke-blue-500 dark:stroke-blue-400 stroke-4"
        )}
        onMouseEnter={() => setHoveredRegion(prefecture.name)}
        onMouseLeave={() => setHoveredRegion(null)}
        onClick={() => mapClickHandler(prefecture.id)}
      />
    ));
  };

  return (
    <div className={cn("relative", className)}>
      <svg width="1513" height="982" viewBox="0 0 1513 982" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_3_6)">
          {/* Kyushu Region */}
          <g data-region="kyushu">
            {renderRegionPaths(allRegionPaths.kyushu)}
          </g>

          {/* Shikoku Region */}
          <g data-region="shikoku">
            {renderRegionPaths(allRegionPaths.shikoku)}
          </g>

          {/* Chugoku Region */}
          <g data-region="chugoku">
            {renderRegionPaths(allRegionPaths.chugoku)}
          </g>

          {/* Kansai Region */}
          <g data-region="kansai">
            {renderRegionPaths(allRegionPaths.kansai)}
          </g>

          {/* Chubu Region */}
          <g data-region="chubu">
            {renderRegionPaths(allRegionPaths.chubu)}
          </g>

          {/* Kanto Region */}
          <g data-region="kanto">
            {renderRegionPaths(allRegionPaths.kanto)}
          </g>

          {/* Tohoku Region */}
          <g data-region="tohoku">
            {renderRegionPaths(allRegionPaths.tohoku)}
          </g>

          {/* Hokkaido Region */}
          <g data-region="hokkaido">
            {renderRegionPaths(allRegionPaths.hokkaido)}
          </g>
        </g>

        <defs>
          <clipPath id="clip0_3_6">
            <rect width="1512" height="982" fill="white" transform="translate(0.891235)"/>
          </clipPath>
        </defs>
      </svg>

      {/* Tooltip */}
      {hoveredRegion && (
        <div className="absolute bottom-4 right-4 bg-black/90 text-white px-3 py-2 rounded-lg text-base font-medium pointer-events-none shadow-lg">
          {hoveredRegion}
        </div>
      )}
    </div>
  );
}