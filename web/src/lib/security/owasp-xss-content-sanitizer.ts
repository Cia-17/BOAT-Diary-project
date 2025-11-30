/**
 * OWASP A03:2021 - Injection
 * XSS (Cross-Site Scripting) sanitization for user-generated content
 * 
 * Sanitizes HTML content to prevent XSS attacks
 */

/**
 * Sanitize text content to prevent XSS
 * Removes or escapes potentially dangerous HTML/JavaScript
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Escape HTML special characters
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content (allows safe HTML tags)
 * For more advanced sanitization, use DOMPurify library
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (!html) return '';
  
  // If no allowed tags, escape everything
  if (allowedTags.length === 0) {
    return sanitizeText(html);
  }
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, ''); // Remove data URIs with HTML
  
  // For production, use DOMPurify:
  // import DOMPurify from 'isomorphic-dompurify';
  // return DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags });
  
  return sanitized;
}

/**
 * Check if text contains potentially dangerous patterns
 */
export function containsXSSPatterns(text: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(text));
}

/**
 * Validate and sanitize entry text
 */
export function sanitizeEntryText(text: string): string {
  // First check for dangerous patterns
  if (containsXSSPatterns(text)) {
    // Log security event
    console.warn('[SECURITY] XSS pattern detected in entry text');
    // Sanitize the text
    return sanitizeText(text);
  }
  
  // For entry text, we want to preserve line breaks but escape HTML
  // Replace newlines with <br> tags (after escaping)
  const escaped = sanitizeText(text);
  return escaped.replace(/\n/g, '<br>');
}

