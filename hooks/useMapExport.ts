'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export interface UseMapExportOptions {
  /**
   * The element to capture (defaults to finding the SVG element)
   */
  element?: HTMLElement | null;
  /**
   * Options to pass to html2canvas
   */
  canvasOptions?: Partial<Parameters<typeof html2canvas>[1]>;
  /**
   * File name for the downloaded image (without extension)
   */
  fileName?: string;
}

export function useMapExport(options: UseMapExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportMap = useCallback(async (customOptions?: Partial<UseMapExportOptions>) => {
    const mergedOptions = { ...options, ...customOptions };
    const {
      element,
      canvasOptions = {},
      fileName = `japan-travel-map-${new Date().toISOString().split('T')[0]}`
    } = mergedOptions;

    try {
      setIsExporting(true);
      setError(null);

      // Find the target element
      let targetElement = element;
      if (!targetElement) {
        // Look for the map container or SVG element
        const mapContainer = document.querySelector('[data-map-container]') as HTMLElement;
        const svgElement = document.querySelector('svg') as Element;
        targetElement = mapContainer || (svgElement as HTMLElement);
      }

      if (!targetElement) {
        throw new Error('Could not find map element to export');
      }

      // Create a comprehensive fallback style to handle oklch colors
      const createColorFallbacks = () => {
        const style = document.createElement('style');
        style.id = 'html2canvas-oklch-fallback';
        // Override problematic modern colors with safe hex equivalents
        style.textContent = `
          /* Global fallbacks for problematic CSS functions */
          * {
            /* Reset any CSS functions that html2canvas can't parse */
            background-image: none !important;
          }
          
          /* Map container specific overrides */
          [data-map-container],
          [data-map-container] * {
            /* Ensure solid backgrounds */
            background-color: inherit !important;
            background-image: none !important;
          }
          
          /* Specific Tailwind class overrides for common UI elements */
          .bg-white, .bg-white\/90 { background-color: #ffffff !important; }
          .bg-gray-50, .bg-gray-50\/30 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-200 { background-color: #e5e7eb !important; }
          .bg-gray-800, .bg-gray-800\/90 { background-color: #1f2937 !important; }
          .bg-gray-900 { background-color: #111827 !important; }
          .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-blue-900\/80 { background-color: rgba(30, 58, 138, 0.8) !important; }
          .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-red-900\/80 { background-color: rgba(127, 29, 29, 0.8) !important; }
          .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-purple-900\/50 { background-color: rgba(88, 28, 135, 0.5) !important; }
          
          /* Text colors */
          .text-gray-700 { color: #374151 !important; }
          .text-gray-300 { color: #d1d5db !important; }
          .text-gray-200 { color: #e5e7eb !important; }
          .text-white { color: #ffffff !important; }
          .text-black { color: #000000 !important; }
          .text-blue-800 { color: #1e40af !important; }
          .text-blue-200 { color: #bfdbfe !important; }
          .text-red-800 { color: #991b1b !important; }
          .text-red-200 { color: #fecaca !important; }
          .text-purple-600 { color: #9333ea !important; }
          .text-purple-400 { color: #c084fc !important; }
          
          /* Border colors */
          .border-gray-200, .border-gray-200\/60 { border-color: #e5e7eb !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-gray-600 { border-color: #4b5563 !important; }
          .border-gray-700, .border-gray-700\/60 { border-color: #374151 !important; }
          .border-blue-300 { border-color: #93c5fd !important; }
          .border-blue-700 { border-color: #1d4ed8 !important; }
          .border-red-300 { border-color: #fca5a5 !important; }
          .border-red-700 { border-color: #b91c1c !important; }
          
          /* Force simple gradients to solid colors */
          .bg-gradient-to-r { background-image: none !important; background-color: #ffffff !important; }
        `;
        document.head.appendChild(style);
        return style;
      };

      const removeFallbacks = (style: HTMLStyleElement) => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };

      // Apply color fallbacks temporarily
      const fallbackStyle = createColorFallbacks();

      // Default html2canvas options optimized for SVG maps
      const defaultCanvasOptions = {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        ...canvasOptions
      };

      let canvas;
      try {
        // Capture the element with fallback styles applied
        canvas = await html2canvas(targetElement, defaultCanvasOptions);
      } finally {
        // Always remove the fallback styles
        removeFallbacks(fallbackStyle);
      }

      // Create download link
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        canvas,
        dataUrl
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export map';
      setError(errorMessage);
      console.error('Map export error:', err);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsExporting(false);
    }
  }, [options]);

  return {
    exportMap,
    isExporting,
    error,
    clearError: () => setError(null)
  };
}
