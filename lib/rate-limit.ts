/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or similar)
const store: RateLimitStore = {};

export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async (request: Request): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    const now = Date.now();
    
    // Generate key for this request
    const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request);
    
    // Clean up expired entries
    if (store[key] && store[key].resetTime <= now) {
      delete store[key];
    }

    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const entry = store[key];
    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    return {
      success,
      remaining,
      resetTime: entry.resetTime
    };
  };
}

function getDefaultKey(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Pre-configured rate limiters
export const shareCreationLimit = createRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 10, // 10 shares per day
  keyGenerator: (request) => {
    // Use user ID if available in auth header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Extract user ID from JWT (simplified)
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        return `user:${payload.sub}`;
      } catch {
        // Fall back to IP
      }
    }
    return getDefaultKey(request);
  }
});

export const shareViewLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 views per minute
});

export const apiGeneralLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});