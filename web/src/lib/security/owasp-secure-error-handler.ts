/**
 * OWASP A05:2021 - Security Misconfiguration
 * Secure error handling - Prevents information disclosure in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export interface SecurityError {
  message: string;
  code?: string;
  context?: string;
  timestamp: string;
}

/**
 * Handle errors securely without exposing sensitive information
 */
export function handleError(
  error: unknown,
  context: string,
  userFacingMessage?: string
): SecurityError {
  const timestamp = new Date().toISOString();
  
  // Log full error in development, sanitized in production
  if (isDevelopment) {
    console.error(`[${context}]`, error);
  } else {
    // Production: Log to monitoring service (Sentry, etc.)
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      context,
      timestamp,
      // Never log sensitive data like passwords, tokens, etc.
    };
    console.error(`[${context}]`, errorDetails);
    // TODO: Send to monitoring service
    // logger.error(errorDetails);
  }
  
  // Return user-friendly message
  if (userFacingMessage) {
    return {
      message: userFacingMessage,
      context,
      timestamp,
    };
  }
  
  // Generic production message
  if (!isDevelopment) {
    return {
      message: 'An error occurred. Please try again later.',
      context,
      timestamp,
    };
  }
  
  // Development: Show actual error
  return {
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    context,
    timestamp,
  };
}

/**
 * Sanitize error messages for user display
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (isDevelopment) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Production: Generic messages only
  if (error instanceof Error) {
    // Map known error types to user-friendly messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Authentication error. Please log in again.';
    }
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return 'You do not have permission to perform this action.';
    }
  }
  
  return 'An error occurred. Please try again later.';
}

