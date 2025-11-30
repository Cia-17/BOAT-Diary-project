/**
 * OWASP A04:2021 - Insecure Design
 * Rate limiting implementation to prevent brute force attacks
 * 
 * This is a client-side rate limiter. For production, implement
 * server-side rate limiting using Redis or similar.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for client-side)
// In production, use Redis or database
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

// Default configurations
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Registration endpoint
  REGISTRATION: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // General API endpoints
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Check if request should be rate limited
 * @param key - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    // Clean up expired entries periodically
    cleanupExpiredEntries(now);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  // Only clean up occasionally (every 100th call) to avoid performance issues
  if (Math.random() > 0.01) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limit for a key (useful for testing or manual unlock)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(
  key: string,
  config: RateLimitConfig
): { count: number; remaining: number; resetTime: number } {
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || now > entry.resetTime) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

