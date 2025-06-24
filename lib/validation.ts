import { VisitRating } from '@/types';

export interface VisitValidationError {
  field: string;
  message: string;
}

export function validateVisitData(data: {
  rating: VisitRating;
  visit_year: number;
  notes?: string | null;
}): VisitValidationError[] {
  const errors: VisitValidationError[] = [];
  const currentYear = new Date().getFullYear();

  // Validate rating
  if (data.rating < 0 || data.rating > 5 || !Number.isInteger(data.rating)) {
    errors.push({
      field: 'rating',
      message: 'Rating must be an integer between 0 and 5'
    });
  }

  // Validate year
  if (!Number.isInteger(data.visit_year) || data.visit_year < 1900 || data.visit_year > currentYear + 10) {
    errors.push({
      field: 'visit_year',
      message: `Year must be between 1900 and ${currentYear + 10}`
    });
  }

  // Validate notes length (prevent potential DoS via large strings)
  if (data.notes && data.notes.length > 10000) {
    errors.push({
      field: 'notes',
      message: 'Notes must be less than 10,000 characters'
    });
  }

  return errors;
}

export function validatePrefectureRating(rating: number): VisitValidationError[] {
  const errors: VisitValidationError[] = [];

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    errors.push({
      field: 'rating',
      message: 'Prefecture rating must be an integer between 0 and 5'
    });
  }

  return errors;
}

// Sanitize notes to prevent XSS when rendered as HTML
export function sanitizeNotes(notes: string | null | undefined): string {
  if (!notes) return '';
  
  // Basic HTML entity encoding
  return notes
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting helper for client-side operations
export function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = [];
  
  return function isAllowed(): boolean {
    const now = Date.now();
    
    // Remove calls outside the current window
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift();
    }
    
    // Check if we're under the limit
    if (calls.length < maxCalls) {
      calls.push(now);
      return true;
    }
    
    return false;
  };
}