/**
 * OWASP A09:2021 - Security Logging and Monitoring Failures
 * Security event logging for audit and monitoring
 */

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'registration_attempt'
  | 'registration_success'
  | 'registration_failure'
  | 'unauthorized_access_attempt'
  | 'file_upload'
  | 'file_upload_failed'
  | 'rate_limit_exceeded'
  | 'account_locked'
  | 'password_change'
  | 'session_timeout'
  | 'suspicious_activity';

export interface SecurityEvent {
  eventType: SecurityEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log a security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY EVENT]', fullEvent);
  }

  // In production, send to logging service
  // TODO: Integrate with logging service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to API endpoint
    // fetch('/api/security/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(fullEvent),
    // }).catch(err => console.error('Failed to log security event:', err));
    
    // For now, log to console (replace with actual logging service)
    console.log('[SECURITY EVENT]', JSON.stringify(fullEvent));
  }
}

/**
 * Helper functions for common security events
 */

export function logLoginAttempt(
  email: string,
  success: boolean,
  ip?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    eventType: success ? 'login_success' : 'login_failure',
    email,
    ip,
    userAgent,
    severity: success ? 'low' : 'medium',
    details: {
      success,
    },
  });
}

export function logRegistrationAttempt(
  email: string,
  success: boolean,
  ip?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    eventType: success ? 'registration_success' : 'registration_failure',
    email,
    ip,
    userAgent,
    severity: success ? 'low' : 'medium',
    details: {
      success,
    },
  });
}

export function logUnauthorizedAccessAttempt(
  userId: string,
  resource: string,
  resourceId: string,
  ip?: string
): void {
  logSecurityEvent({
    eventType: 'unauthorized_access_attempt',
    userId,
    resource,
    resourceId,
    ip,
    severity: 'high',
    details: {
      attemptedResource: resource,
      attemptedResourceId: resourceId,
    },
  });
}

export function logFileUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  success: boolean
): void {
  logSecurityEvent({
    eventType: success ? 'file_upload' : 'file_upload_failed',
    userId,
    severity: success ? 'low' : 'medium',
    details: {
      fileName,
      fileSize,
      fileType,
      success,
    },
  });
}

export function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  ip?: string
): void {
  logSecurityEvent({
    eventType: 'rate_limit_exceeded',
    email: identifier.includes('@') ? identifier : undefined,
    ip,
    severity: 'medium',
    details: {
      identifier,
      endpoint,
    },
  });
}

export function logAccountLocked(
  identifier: string,
  ip?: string
): void {
  logSecurityEvent({
    eventType: 'account_locked',
    email: identifier.includes('@') ? identifier : undefined,
    ip,
    severity: 'high',
    details: {
      identifier,
    },
  });
}

