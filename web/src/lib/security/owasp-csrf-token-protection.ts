/**
 * OWASP A04:2021 - Insecure Design
 * CSRF (Cross-Site Request Forgery) protection
 * 
 * Generates and validates CSRF tokens for form submissions
 */

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  // Generate a cryptographically random token
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to base64 URL-safe string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Store CSRF token in session storage
 */
export function storeCsrfToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
    // Also set in cookie for server-side validation
    document.cookie = `csrf_token=${token}; SameSite=Strict; Path=/; Secure; HttpOnly=false; Max-Age=3600`;
  }
}

/**
 * Get CSRF token from storage
 */
export function getCsrfToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
}

/**
 * Validate CSRF token
 * @param token - Token to validate
 * @param storedToken - Stored token to compare against
 */
export function validateCsrfToken(token: string | null, storedToken: string | null): boolean {
  if (!token || !storedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Initialize CSRF protection for a form
 * Call this when component mounts
 */
export function initializeCsrfProtection(): string {
  let token = getCsrfToken();
  
  // Generate new token if doesn't exist
  if (!token) {
    token = generateCsrfToken();
    storeCsrfToken(token);
  }
  
  return token;
}

/**
 * Get CSRF token from form data or headers
 */
export function extractCsrfToken(formData: FormData | null, headers?: Headers): string | null {
  // Try form data first
  if (formData) {
    const token = formData.get('csrf_token');
    if (typeof token === 'string') {
      return token;
    }
  }
  
  // Try headers
  if (headers) {
    return headers.get('X-CSRF-Token');
  }
  
  return null;
}

