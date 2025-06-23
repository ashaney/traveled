'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { RATING_COLORS, VisitRating } from '@/types';
import { allRegionPaths, PrefecturePath } from '@/data/japan-realistic-svg-paths';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface JapanRegionMapProps {
  className?: string;
  onRegionClick?: (regionId: string) => void;
  selectedRegion?: string; // For highlighting specific regions
}

export function JapanRegionMap({ className, onRegionClick, selectedRegion }: JapanRegionMapProps) {
  const { getVisitByRegion } = useSupabaseVisits();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getRegionColor = (regionId: string) => {
    const visit = getVisitByRegion(regionId);
    const rating = visit?.rating ?? 0;
    return RATING_COLORS[rating as VisitRating];
  };

  const mapClickHandler = (regionId: string) => {
    if (!isDragging) {
      onRegionClick?.(regionId);
    }
  };

  const handleZoomIn = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.5) }));
  }, []);

  const handleReset = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const containerWidth = svgRect.width;
      const containerHeight = svgRect.height;
      
      // Calculate scaled dimensions
      const scaledWidth = containerWidth * transform.scale;
      const scaledHeight = containerHeight * transform.scale;
      
      // Calculate max pan distances based on scale
      const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2);
      
      // Calculate new position
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Apply bounds
      const boundedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
      const boundedY = Math.max(-maxPanY, Math.min(maxPanY, newY));
      
      setTransform(prev => ({
        ...prev,
        x: boundedX,
        y: boundedY
      }));
    }
  }, [isDragging, dragStart, transform.scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
    <div className={cn("relative overflow-hidden", className)}>
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-md shadow-sm transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-md shadow-sm transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-md shadow-sm transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      <svg 
        ref={svgRef}
        width="1513" 
        height="982" 
        viewBox="0 0 1637 1325" 
        className="w-full h-auto cursor-grab active:cursor-grabbing" 
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center'
        }}
      >
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
      </svg>

      {/* Tooltip */}
      {hoveredRegion && !isDragging && (
        <div className="absolute bottom-4 right-4 bg-black/90 text-white px-3 py-2 rounded-lg text-base font-medium pointer-events-none shadow-lg z-10">
          {hoveredRegion}
        </div>
      )}
    </div>
  );
}