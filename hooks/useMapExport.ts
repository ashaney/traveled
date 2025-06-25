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

      // Capture the element
      const canvas = await html2canvas(targetElement, defaultCanvasOptions);

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
