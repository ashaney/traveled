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

      // Create comprehensive fallback to override CSS custom properties with oklch values
      const createColorFallbacks = () => {
        const style = document.createElement('style');
        style.id = 'html2canvas-oklch-fallback';
        // Override CSS custom properties at root level to replace oklch() with hex equivalents
        style.textContent = `
          :root {
            /* Override all CSS custom properties that use oklch() */
            --background: #ffffff !important;
            --foreground: #0a0a0a !important;
            --card: #ffffff !important;
            --card-foreground: #0a0a0a !important;
            --popover: #ffffff !important;
            --popover-foreground: #0a0a0a !important;
            --primary: #1a1a1a !important;
            --primary-foreground: #fafafa !important;
            --secondary: #f4f4f5 !important;
            --secondary-foreground: #1a1a1a !important;
            --muted: #f4f4f5 !important;
            --muted-foreground: #71717a !important;
            --accent: #f4f4f5 !important;
            --accent-foreground: #1a1a1a !important;
            --destructive: #ef4444 !important;
            --destructive-foreground: #fafafa !important;
            --border: #e4e4e7 !important;
            --input: #e4e4e7 !important;
            --ring: #a1a1aa !important;
            --chart-1: #f97316 !important;
            --chart-2: #06b6d4 !important;
            --chart-3: #3b82f6 !important;
            --chart-4: #84cc16 !important;
            --chart-5: #f59e0b !important;
            --sidebar: #fafafa !important;
            --sidebar-foreground: #0a0a0a !important;
            --sidebar-primary: #1a1a1a !important;
            --sidebar-primary-foreground: #fafafa !important;
            --sidebar-accent: #f4f4f5 !important;
            --sidebar-accent-foreground: #1a1a1a !important;
            --sidebar-border: #e4e4e7 !important;
            --sidebar-ring: #a1a1aa !important;
          }
          
          [data-theme="dark"] {
            /* Dark mode overrides */
            --background: #0a0a0a !important;
            --foreground: #fafafa !important;
            --card: #1a1a1a !important;
            --card-foreground: #fafafa !important;
            --popover: #1a1a1a !important;
            --popover-foreground: #fafafa !important;
            --primary: #e4e4e7 !important;
            --primary-foreground: #1a1a1a !important;
            --secondary: #262626 !important;
            --secondary-foreground: #fafafa !important;
            --muted: #262626 !important;
            --muted-foreground: #a1a1aa !important;
            --accent: #262626 !important;
            --accent-foreground: #fafafa !important;
            --destructive: #dc2626 !important;
            --border: rgba(255, 255, 255, 0.1) !important;
            --input: rgba(255, 255, 255, 0.15) !important;
            --ring: #71717a !important;
            --chart-1: #8b5cf6 !important;
            --chart-2: #10b981 !important;
            --chart-3: #f59e0b !important;
            --chart-4: #ec4899 !important;
            --chart-5: #ef4444 !important;
            --sidebar: #1a1a1a !important;
            --sidebar-foreground: #fafafa !important;
            --sidebar-primary: #8b5cf6 !important;
            --sidebar-primary-foreground: #fafafa !important;
            --sidebar-accent: #262626 !important;
            --sidebar-accent-foreground: #fafafa !important;
            --sidebar-border: rgba(255, 255, 255, 0.1) !important;
            --sidebar-ring: #71717a !important;
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
      
      // Wait for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

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
      let clonedElements: { clone: HTMLElement; container: HTMLElement } | null = null;
      
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
          throw originalError; // Throw the original error
        }
      } finally {
        // Clean up
        removeFallbacks(fallbackStyle);
        if (clonedElements) {
          document.body.removeChild(clonedElements.container);
        }
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
