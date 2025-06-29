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

// In-memory store - suitable for small applications with single server instances
// For production apps with multiple server instances, consider Redis or database-backed rate limiting
// For this small free app, in-memory storage is acceptable given the usage scale
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
// Note: Using IP-based rate limiting is safer than JWT parsing and sufficient for this app's scale
// For enterprise applications, consider dedicated rate limiting services (e.g., Upstash, Redis)
export const shareCreationLimit = createRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 10, // 10 shares per day
  keyGenerator: (request) => {
    // Use IP-based rate limiting for security
    // User-specific rate limiting should be handled at the application level
    // with proper Supabase auth validation
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