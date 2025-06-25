'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { RATING_COLORS, RATING_LABELS, VisitRating } from '@/types';
import { allRegionPaths, PrefecturePath } from '@/data/japan-realistic-svg-paths';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Download } from 'lucide-react';
import { useMapExport } from '@/hooks/useMapExport';

interface JapanRegionMapProps {
  className?: string;
  onRegionClick?: (regionId: string) => void;
  selectedRegion?: string; // For highlighting specific regions
}

interface MapFilters {
  rating?: VisitRating;
  year?: number;
  visitType?: VisitRating;
}

export function JapanRegionMap({ className, onRegionClick, selectedRegion }: JapanRegionMapProps) {
  const { getHighestRatedVisitByRegion, getVisitsByRegion } = useSupabaseVisits();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filters] = useState<MapFilters>({});
  const svgRef = useRef<SVGSVGElement>(null);
  const { exportMap, isExporting, error, clearError } = useMapExport();

  const getRegionColor = (regionId: string) => {
    // If filters are active, check if region should be visible
    if (Object.keys(filters).length > 0) {
      const regionVisits = getVisitsByRegion(regionId);
      
      // Apply filters
      let matchingVisit = null;
      
      if (filters.year) {
        matchingVisit = regionVisits.find(visit => visit.visit_year === filters.year);
      } else if (filters.rating !== undefined) {
        matchingVisit = regionVisits.find(visit => visit.rating === filters.rating);
      } else if (filters.visitType !== undefined) {
        matchingVisit = regionVisits.find(visit => visit.rating === filters.visitType);
      }
      
      if (matchingVisit) {
        return RATING_COLORS[matchingVisit.rating as VisitRating];
      } else {
        // If filters are active but no matching visit, show as faded/gray
        return '#f3f4f6'; // gray-100
      }
    }
    
    // Default behavior - show highest-rated visit
    const visit = getHighestRatedVisitByRegion(regionId);
    const rating = visit?.rating ?? 0;
    return RATING_COLORS[rating as VisitRating];
  };
  
  const hasActiveFilters = Object.keys(filters).length > 0;

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
    <div className={cn("relative overflow-hidden", className)} data-map-container>
      {/* Controls */}
      <div className="absolute bottom-4 left-0 z-10 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => exportMap({ element: svgRef.current?.parentElement as HTMLElement })}
            disabled={isExporting}
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isExporting ? "Exporting..." : "Download PNG"}
          >
            <Download className={cn("w-4 h-4 text-gray-700 dark:text-gray-300", isExporting && "animate-pulse")} />
          </button>
        </div>
        
      </div>
      
      
      <svg 
        ref={svgRef}
        width="1589" 
        height="850" 
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

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="absolute bottom-4 left-4 bg-blue-100 dark:bg-blue-900/80 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filters active:</span>
            {filters.year && <span className="bg-blue-200 px-2 py-1 rounded text-xs">{filters.year}</span>}
            {filters.visitType !== undefined && (
              <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                {RATING_LABELS[filters.visitType]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg z-10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredRegion && !isDragging && (
        <div className="absolute bottom-4 right-4 bg-black/90 text-white px-3 py-2 rounded-lg text-base font-medium pointer-events-none shadow-lg z-10">
          {hoveredRegion}
        </div>
      )}
    </div>
  );
}