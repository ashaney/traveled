export type ExportErrorType = 
  | 'ELEMENT_NOT_FOUND'
  | 'CANVAS_CONTEXT_FAILED' 
  | 'IMAGE_LOAD_FAILED'
  | 'SVG_SERIALIZATION_FAILED'
  | 'HTML2CANVAS_FAILED'
  | 'FILE_TOO_LARGE'
  | 'BROWSER_NOT_SUPPORTED'
  | 'UNKNOWN_ERROR';

export interface ExportError {
  type: ExportErrorType;
  message: string;
  originalError?: Error;
}

export interface ExportResult {
  success: boolean;
  error?: ExportError;
  canvas?: HTMLCanvasElement;
  dataUrl?: string;
  fileSize?: number;
}

export interface ExportProgressCallback {
  (progress: number, stage: string): void;
}

export const createExportError = (
  type: ExportErrorType, 
  message: string, 
  originalError?: Error
): ExportError => ({
  type,
  message,
  originalError
});

export const FILE_SIZE_WARNING_THRESHOLD = 10 * 1024 * 1024; // 10MB
export const FILE_SIZE_MAX_THRESHOLD = 50 * 1024 * 1024; // 50MB
