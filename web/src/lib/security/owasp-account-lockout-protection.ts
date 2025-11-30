/**
 * OWASP A07:2021 - Identification and Authentication Failures
 * Account lockout mechanism to prevent brute force attacks
 * 
 * This is a client-side implementation. For production, implement
 * server-side lockout using database or Redis.
 */

interface LockoutEntry {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

// In-memory store (for client-side)
// In production, use Redis or database
const lockoutStore = new Map<string, LockoutEntry>();

export interface LockoutConfig {
  maxAttempts: number;
  lockoutDurationMs: number; // Duration in milliseconds
  resetWindowMs: number; // Reset attempts after this time
}

// Default configuration
export const DEFAULT_LOCKOUT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  resetWindowMs: 30 * 60 * 1000, // 30 minutes
};

/**
 * Record a failed login attempt
 * @param identifier - User identifier (email or user ID)
 * @param config - Lockout configuration
 * @returns Object with lockout status
 */
export function recordFailedAttempt(
  identifier: string,
  config: LockoutConfig = DEFAULT_LOCKOUT_CONFIG
): { locked: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  let entry = lockoutStore.get(identifier);

  // Create new entry if doesn't exist
  if (!entry) {
    entry = {
      attempts: 0,
      lockedUntil: null,
      lastAttempt: now,
    };
  }

  // Reset attempts if reset window expired
  if (now - entry.lastAttempt > config.resetWindowMs) {
    entry.attempts = 0;
    entry.lockedUntil = null;
  }

  // Check if account is currently locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
    };
  }

  // If lockout expired, reset
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    entry.attempts = 0;
    entry.lockedUntil = null;
  }

  // Increment attempts
  entry.attempts++;
  entry.lastAttempt = now;

  // Lock account if max attempts reached
  if (entry.attempts >= config.maxAttempts) {
    entry.lockedUntil = now + config.lockoutDurationMs;
  }

  lockoutStore.set(identifier, entry);

  return {
    locked: entry.lockedUntil !== null && now < entry.lockedUntil,
    remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
    lockedUntil: entry.lockedUntil,
  };
}

/**
 * Record a successful login (reset attempts)
 * @param identifier - User identifier
 */
export function recordSuccessfulLogin(identifier: string): void {
  lockoutStore.delete(identifier);
}

/**
 * Check if account is locked
 * @param identifier - User identifier
 * @returns Lockout status
 */
export function isAccountLocked(identifier: string): {
  locked: boolean;
  lockedUntil: number | null;
  remainingTime?: number;
} {
  const entry = lockoutStore.get(identifier);
  const now = Date.now();

  if (!entry || !entry.lockedUntil) {
    return { locked: false, lockedUntil: null };
  }

  if (now < entry.lockedUntil) {
    return {
      locked: true,
      lockedUntil: entry.lockedUntil,
      remainingTime: entry.lockedUntil - now,
    };
  }

  // Lockout expired, reset
  lockoutStore.delete(identifier);
  return { locked: false, lockedUntil: null };
}

/**
 * Get remaining attempts before lockout
 * @param identifier - User identifier
 * @param config - Lockout configuration
 */
export function getRemainingAttempts(
  identifier: string,
  config: LockoutConfig = DEFAULT_LOCKOUT_CONFIG
): number {
  const entry = lockoutStore.get(identifier);
  if (!entry) return config.maxAttempts;
  
  const now = Date.now();
  // Reset if window expired
  if (now - entry.lastAttempt > config.resetWindowMs) {
    return config.maxAttempts;
  }

  return Math.max(0, config.maxAttempts - entry.attempts);
}

/**
 * Manually unlock an account (admin function)
 * @param identifier - User identifier
 */
export function unlockAccount(identifier: string): void {
  lockoutStore.delete(identifier);
}

