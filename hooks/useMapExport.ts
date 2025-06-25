'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { 
  ExportResult, 
  ExportError, 
  ExportErrorType, 
  createExportError,
  FILE_SIZE_WARNING_THRESHOLD,
  FILE_SIZE_MAX_THRESHOLD 
} from '@/types/export';

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
  const [error, setError] = useState<ExportError | null>(null);

  const exportMap = useCallback(async (customOptions?: Partial<UseMapExportOptions>): Promise<ExportResult> => {
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
        const error = createExportError('ELEMENT_NOT_FOUND', 'Could not find map element to export');
        setError(error);
        return { success: false, error };
      }

      // Create dynamic color fallback by reading computed CSS variables
      const createColorFallbacks = () => {
        const style = document.createElement('style');
        style.id = 'html2canvas-oklch-fallback';
        
        // Get computed CSS custom properties dynamically
        const getComputedCSSVariables = () => {
          const root = document.documentElement;
          const computed = getComputedStyle(root);
          const variables: Record<string, string> = {};
          
          // Common CSS variables that might use oklch()
          const cssVarNames = [
            '--background', '--foreground', '--card', '--card-foreground',
            '--popover', '--popover-foreground', '--primary', '--primary-foreground', 
            '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
            '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
            '--border', '--input', '--ring', '--chart-1', '--chart-2', '--chart-3',
            '--chart-4', '--chart-5', '--sidebar', '--sidebar-foreground',
            '--sidebar-primary', '--sidebar-primary-foreground', '--sidebar-accent',
            '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring'
          ];
          
          cssVarNames.forEach(varName => {
            const value = computed.getPropertyValue(varName).trim();
            if (value && hasUnsupportedCSS(value)) {
              // Try to get the resolved value by creating a test element
              const testEl = document.createElement('div');
              testEl.style.color = `var(${varName})`;
              document.body.appendChild(testEl);
              const resolvedValue = getComputedStyle(testEl).color;
              document.body.removeChild(testEl);
              
              // Convert rgb() to hex if possible
              variables[varName] = rgbToHex(resolvedValue) || '#000000';
            }
          });
          
          return variables;
        };
        
        const hasUnsupportedCSS = (value: string) => 
          /\b(oklch|lab|lch|color-mix|hsl|hsla)\b/.test(value);
        
        const rgbToHex = (rgb: string): string | null => {
          const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (!match) return null;
          
          const [, r, g, b] = match;
          return `#${[r, g, b].map(x => {
            const hex = parseInt(x, 10).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('')}`;
        };
        
        // Get dynamic overrides
        const dynamicVars = getComputedCSSVariables();
        
        // Build CSS content with dynamic values
        const dynamicRules = Object.entries(dynamicVars)
          .map(([varName, value]) => `    ${varName}: ${value} !important;`)
          .join('\n');
        
        style.textContent = `
          :root {
            /* Dynamically resolved CSS variables */
${dynamicRules}
          }
          
          /* Additional overrides for Tailwind classes */
          .bg-white, .bg-white\/90 { background-color: #ffffff !important; }
          .bg-gray-50, .bg-gray-50\/30 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-200 { background-color: #e5e7eb !important; }
          .bg-gray-800, .bg-gray-800\/90 { background-color: #1f2937 !important; }
          .bg-gray-900 { background-color: #111827 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-300 { color: #d1d5db !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-gray-600 { border-color: #4b5563 !important; }
          .border-gray-700 { border-color: #374151 !important; }
          
          /* Force removal of problematic CSS functions */
          * {
            background-image: none !important;
          }
        `;
        
        document.head.appendChild(style);
        return style;
      };

      const removeFallbacks = (style: HTMLStyleElement) => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };

      // Alternative approach: Clone the element and strip problematic styles
      const prepareElementForCapture = () => {
        const clone = targetElement.cloneNode(true) as HTMLElement;
        
        // Set explicit styles on the clone to avoid oklch issues
        const setExplicitStyles = (element: Element) => {
          if (element instanceof HTMLElement) {
            // Force basic styling that html2canvas can understand
            element.style.backgroundColor = element.style.backgroundColor || 'transparent';
            element.style.color = element.style.color || '#000000';
            element.style.borderColor = element.style.borderColor || 'transparent';
            
            // Remove any CSS custom properties that might reference oklch
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.backgroundColor?.includes('oklch')) {
              element.style.backgroundColor = '#ffffff';
            }
            if (computedStyle.color?.includes('oklch')) {
              element.style.color = '#000000';
            }
            if (computedStyle.borderColor?.includes('oklch')) {
              element.style.borderColor = '#e5e7eb';
            }
          }
          
          // Recursively apply to children
          Array.from(element.children).forEach(setExplicitStyles);
        };
        
        setExplicitStyles(clone);
        
        // Create a temporary container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = `${targetElement.offsetWidth}px`;
        container.style.height = `${targetElement.offsetHeight}px`;
        container.appendChild(clone);
        document.body.appendChild(container);
        
        return { clone, container };
      };

      // Apply color fallbacks temporarily
      const fallbackStyle = createColorFallbacks();
      
      // Use requestAnimationFrame instead of fixed timeout for style application
      await new Promise(resolve => requestAnimationFrame(resolve));

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

      let canvas: HTMLCanvasElement;
      let clonedElements: { clone: HTMLElement; container: HTMLElement } | null = null;
      
      // Enhanced cleanup safety with Promise.resolve().then() to ensure cleanup
      const ensureCleanup = () => {
        Promise.resolve().then(() => {
          removeFallbacks(fallbackStyle);
          if (clonedElements?.container.parentNode) {
            document.body.removeChild(clonedElements.container);
          }
        });
      };
      
      try {
        // Try the original element first with fallback styles
        canvas = await html2canvas(targetElement, defaultCanvasOptions);
      } catch (originalError) {
        console.warn('Primary capture failed, trying clone approach:', originalError);
        try {
          // If that fails, try the clone approach
          clonedElements = prepareElementForCapture();
          canvas = await html2canvas(clonedElements.clone, defaultCanvasOptions);
        } catch (cloneError) {
          console.error('Clone capture also failed:', cloneError);
          ensureCleanup();
          const error = createExportError(
            'HTML2CANVAS_FAILED',
            'Failed to capture map with both primary and fallback methods',
            originalError instanceof Error ? originalError : new Error(String(originalError))
          );
          setError(error);
          return { success: false, error };
        }
      }
      
      // Cleanup fallback styles and cloned elements
      ensureCleanup();

      // Create download link and get file size
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
        'UNKNOWN_ERROR',
        err instanceof Error ? err.message : 'Failed to export map',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(error);
      console.error('Map export error:', err);
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
