'use client';

import { useState, useCallback } from 'react';

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
  const [error, setError] = useState<string | null>(null);

  const exportMap = useCallback(async (customOptions?: Partial<UseMapExportSvgOptions>) => {
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
        throw new Error('Could not find SVG element to export');
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
      
      // Convert problematic styles in the SVG
      const convertOklchStyles = (element: Element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(element);
          
          // Get the actual resolved colors and apply them as attributes
          const fillColor = computedStyle.fill;
          const strokeColor = computedStyle.stroke;
          
          if (fillColor && fillColor !== 'none' && !fillColor.includes('oklch')) {
            element.setAttribute('fill', fillColor);
          }
          
          if (strokeColor && strokeColor !== 'none' && !strokeColor.includes('oklch')) {
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
      console.error('SVG map export error:', err);
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
