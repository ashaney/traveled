'use client';

import { useState, useCallback } from 'react';
import { 
  ExportResult, 
  ExportError, 
  ExportErrorType, 
  createExportError,
  FILE_SIZE_WARNING_THRESHOLD,
  FILE_SIZE_MAX_THRESHOLD 
} from '@/types/export';

export interface UseMapExportSvgOptions {
  /**
   * The SVG element to capture
   */
  svgElement?: SVGSVGElement | null;
  /**
   * File name for the downloaded image (without extension)
   */
  fileName?: string;
  /**
   * Scale factor for image quality
   */
  scale?: number;
}

export function useMapExportSvg(options: UseMapExportSvgOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<ExportError | null>(null);

  const exportMap = useCallback(async (customOptions?: Partial<UseMapExportSvgOptions>): Promise<ExportResult> => {
    const mergedOptions = { ...options, ...customOptions };
    const {
      svgElement,
      fileName = `japan-travel-map-${new Date().toISOString().split('T')[0]}`,
      scale = 2
    } = mergedOptions;

    try {
      setIsExporting(true);
      setError(null);

      // Find the SVG element
      let targetSvg = svgElement;
      if (!targetSvg) {
        targetSvg = document.querySelector('svg') as SVGSVGElement;
      }

      if (!targetSvg) {
        const error = createExportError('ELEMENT_NOT_FOUND', 'Could not find SVG element to export');
        setError(error);
        return { success: false, error };
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = targetSvg.cloneNode(true) as SVGSVGElement;
      
      // Get original dimensions
      const bbox = targetSvg.getBoundingClientRect();
      const width = bbox.width * scale;
      const height = bbox.height * scale;
      
      // Set proper dimensions on the clone
      svgClone.setAttribute('width', width.toString());
      svgClone.setAttribute('height', height.toString());
      
      // Convert problematic styles in the SVG with enhanced CSS function detection
      const hasUnsupportedCSS = (value: string) => 
        /\b(oklch|lab|lch|color-mix|hsl|hsla)\b/.test(value);
        
      const convertOklchStyles = (element: Element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(element);
          
          // Get the actual resolved colors and apply them as attributes
          const fillColor = computedStyle.fill;
          const strokeColor = computedStyle.stroke;
          
          // Enhanced CSS function detection
          if (fillColor && fillColor !== 'none' && !hasUnsupportedCSS(fillColor)) {
            element.setAttribute('fill', fillColor);
          }
          
          if (strokeColor && strokeColor !== 'none' && !hasUnsupportedCSS(strokeColor)) {
            element.setAttribute('stroke', strokeColor);
          }
          
          // Handle stroke-width
          const strokeWidth = computedStyle.strokeWidth;
          if (strokeWidth && strokeWidth !== '0px') {
            element.setAttribute('stroke-width', strokeWidth);
          }
        }
        
        // Process children
        Array.from(element.children).forEach(convertOklchStyles);
      };
      
      convertOklchStyles(svgClone);
      
      // Create a data URL from the SVG
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create an image element to load the SVG
      const img = new Image();
      img.width = width;
      img.height = height;
      
      // Create a promise to handle image loading
      const imagePromise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        img.onload = () => {
          try {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            // Set white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // Draw the SVG image onto the canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas);
          } catch (err) {
            reject(err);
          } finally {
            URL.revokeObjectURL(svgUrl);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };
      });
      
      // Load the SVG
      img.src = svgUrl;
      
      // Wait for the canvas to be ready
      const canvas = await imagePromise;
      
      // Create download link and check file size
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const fileSize = Math.round((dataUrl.length * 3) / 4); // Approximate file size
      
      // Check file size warnings
      if (fileSize > FILE_SIZE_MAX_THRESHOLD) {
        const error = createExportError(
          'FILE_TOO_LARGE',
          `Export file is too large (${Math.round(fileSize / 1024 / 1024)}MB). Maximum allowed is ${Math.round(FILE_SIZE_MAX_THRESHOLD / 1024 / 1024)}MB.`
        );
        setError(error);
        return { success: false, error };
      }
      
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
        dataUrl,
        fileSize
      };
    } catch (err) {
      const error = createExportError(
        'SVG_SERIALIZATION_FAILED',
        err instanceof Error ? err.message : 'Failed to export SVG map',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(error);
      console.error('SVG map export error:', err);
      return {
        success: false,
        error
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
