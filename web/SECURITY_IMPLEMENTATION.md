# Security Implementation Guide - DiaryPro

## Overview

This document describes how security is implemented throughout the DiaryPro application, covering authentication, authorization, data protection, and security best practices.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [File Upload Security](#file-upload-security)
5. [Error Handling](#error-handling)
6. [Security Headers](#security-headers)
7. [Database Security](#database-security)
8. [Session Management](#session-management)
9. [Security Monitoring](#security-monitoring)

---

## Authentication & Authorization

### Authentication Flow

DiaryPro uses **Supabase Auth** for user authentication, which provides:
- Secure password hashing (bcrypt)
- JWT token-based sessions
- Email verification
- Password reset functionality

#### Registration Process

```typescript
// Location: web/src/app/auth/register/page.tsx

1. User submits registration form
2. Client-side validation:
   - Email format validation
   - Password length check (minimum 6 characters - should be 12+)
   - Password confirmation match
3. Supabase Auth signUp():
   - Password is hashed server-side
   - User account created
   - Email verification sent
4. User redirected to login page
```

**Security Features:**
- ✅ Password hashing (handled by Supabase)
- ✅ Email verification required
- ⚠️ Weak password policy (6 chars minimum - needs improvement)
- ⚠️ No password strength meter
- ⚠️ No rate limiting on registration

#### Login Process

```typescript
// Location: web/src/app/auth/login/page.tsx

1. User submits credentials
2. Supabase Auth signInWithPassword():
   - Credentials validated
   - JWT token issued
   - Session created
3. Token stored in secure HTTP-only cookies (via @supabase/ssr)
4. User redirected to dashboard
```

**Security Features:**
- ✅ Secure token storage (HTTP-only cookies)
- ✅ Automatic token refresh
- ⚠️ No rate limiting (vulnerable to brute force)
- ⚠️ No account lockout mechanism
- ⚠️ No MFA/2FA support

### Authorization (Access Control)

#### Row-Level Security (RLS)

Supabase implements **Row-Level Security** policies at the database level:

```sql
-- Location: web/schema.sql

-- Users can only view their own entries
CREATE POLICY "Users can view their own entries"
    ON entries FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only update their own entries
CREATE POLICY "Users can update their own entries"
    ON entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own entries
CREATE POLICY "Users can delete their own entries"
    ON entries FOR DELETE
    USING (auth.uid() = user_id);
```

**Defense in Depth:** Client-side also verifies ownership:

```typescript
// Location: web/src/lib/supabase/entries.ts

export async function getEntryById(entryId: number): Promise<Entry | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // ✅ Client-side ownership verification (defense in depth)
  const { data, error } = await supabase
    .from("entries")
    .select(...)
    .eq("entry_id", entryId)
    .eq("user_id", user.id) // Enforce ownership
    .eq("is_deleted", false)
    .single();
}
```

**Security Layers:**
1. **Database Level:** RLS policies enforce access control
2. **Client Level:** Additional ownership checks (defense in depth)
3. **API Level:** Supabase automatically applies RLS to all queries

---

## Data Protection

### Encryption

#### At Rest
- **Database:** Supabase uses encrypted storage (managed by Supabase)
- **Media Files:** ⚠️ Currently stored as base64 in database (not encrypted)
  - **Recommendation:** Migrate to Supabase Storage with encryption

#### In Transit
- **HTTPS:** All communications use TLS/SSL
- **Security Headers:** HSTS enforced (see Security Headers section)

### Sensitive Data Handling

#### Password Storage
- ✅ Passwords are **never stored in plaintext**
- ✅ Supabase uses bcrypt for password hashing
- ✅ Passwords are hashed server-side before storage

#### User Data
- ✅ User IDs are UUIDs (non-sequential, harder to enumerate)
- ⚠️ Console logs may expose sensitive data (mitigated in production)

#### Media Files
- ⚠️ Currently stored as base64 strings in database
- ⚠️ No encryption applied to media content
- **Risk:** Unencrypted sensitive photos/audio/video
- **Recommendation:** Use Supabase Storage with encryption

---

## Input Validation & Sanitization

### Client-Side Validation

```typescript
// Location: web/src/app/entry/new/page.tsx

// File validation
const validFiles = files.filter((file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  
  if (file.size > maxSize) return false;
  if (file.type.startsWith("image/") && !validImageTypes.includes(file.type)) return false;
  
  return true;
});
```

**Limitations:**
- ⚠️ MIME type can be spoofed
- ⚠️ No magic byte validation (file signature checking)
- ⚠️ Client-side only (can be bypassed)

### Server-Side Validation

```typescript
// Location: web/src/lib/security/validation.ts

// Entry text validation
export const entryTextSchema = z.string()
  .min(1)
  .max(50000)
  .refine((text) => {
    // Check for XSS patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
    ];
    return !dangerousPatterns.some(pattern => pattern.test(text));
  });
```

**Security Features:**
- ✅ Input length limits
- ✅ XSS pattern detection
- ✅ File name sanitization
- ⚠️ Needs server-side file type validation

### File Name Sanitization

```typescript
// Location: web/src/lib/security/validation.ts

export function sanitizeFileName(fileName: string): string {
  // Remove path components (prevent path traversal)
  const basename = fileName.split('/').pop() || fileName;
  
  // Remove special characters
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length (255 chars)
  return sanitized.substring(0, 255);
}
```

**Protection Against:**
- ✅ Path traversal attacks (`../../../etc/passwd`)
- ✅ Special character injection
- ✅ Filename length attacks

---

## File Upload Security

### Current Implementation

```typescript
// Location: web/src/app/entry/new/page.tsx

1. File selected by user
2. Client-side validation:
   - File size check (10MB max)
   - MIME type validation
3. File compressed (images only)
4. Converted to base64
5. Stored in database TEXT column
```

### Security Measures

✅ **Implemented:**
- File size limits (10MB per file)
- MIME type checking
- File name sanitization
- Image compression

⚠️ **Missing:**
- Magic byte validation (file signature checking)
- Server-side file validation
- Virus/malware scanning
- File type verification beyond MIME type
- Storage encryption

### Recommended Improvements

```typescript
// File type validation using magic bytes
export async function validateFileType(
  file: File,
  expectedType: 'image' | 'audio' | 'video'
): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Verify actual file signature matches expected type
  const imageSignatures = [
    [0xFF, 0xD8, 0xFF], // JPEG
    [0x89, 0x50, 0x4E, 0x47], // PNG
  ];
  
  return imageSignatures.some(sig => 
    sig.every((byte, index) => bytes[index] === byte)
  );
}
```

---

## Error Handling

### Secure Error Handling

```typescript
// Location: web/src/lib/security/error-handler.ts

export function handleError(error: unknown, context: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Development: Show detailed errors
    console.error(`[${context}]`, error);
    return error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Production: Generic messages only
  console.error(`[${context}]`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
  });
  
  return 'An error occurred. Please try again later.';
}
```

**Security Features:**
- ✅ No sensitive data in production error messages
- ✅ Generic user-facing messages
- ✅ Detailed logging for debugging (development only)
- ✅ Timestamp tracking for security events

### Error Message Examples

**Development:**
```
Error: Failed to save media files: null value in column "file_size" violates not-null constraint
```

**Production:**
```
An error occurred. Please try again later.
```

---

## Security Headers

### HTTP Security Headers

```javascript
// Location: web/next.config.js

async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
        }
      ],
    },
  ];
}
```

### Header Explanations

1. **Strict-Transport-Security (HSTS)**
   - Forces HTTPS connections
   - Prevents MITM attacks
   - Duration: 2 years

2. **X-Frame-Options: SAMEORIGIN**
   - Prevents clickjacking attacks
   - Blocks embedding in iframes from other domains

3. **X-Content-Type-Options: nosniff**
   - Prevents MIME type sniffing
   - Forces browsers to respect Content-Type headers

4. **X-XSS-Protection**
   - Enables browser XSS filter
   - Blocks reflected XSS attacks

5. **Content-Security-Policy (CSP)**
   - Restricts resource loading
   - Prevents XSS attacks
   - Controls which scripts/styles can execute

---

## Database Security

### Row-Level Security (RLS)

All tables have RLS enabled with user-specific policies:

```sql
-- Entries table
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
    ON entries FOR SELECT
    USING (auth.uid() = user_id);
```

**Benefits:**
- ✅ Database-level access control
- ✅ Cannot be bypassed by client code
- ✅ Automatic enforcement on all queries
- ✅ Prevents unauthorized data access

### SQL Injection Protection

Supabase uses **parameterized queries** automatically:

```typescript
// Supabase client automatically parameterizes queries
const { data } = await supabase
  .from("entries")
  .select("*")
  .eq("entry_id", entryId) // ✅ Parameterized, safe from SQL injection
  .eq("user_id", user.id);
```

**Protection:**
- ✅ All queries are parameterized
- ✅ No raw SQL execution from client
- ✅ Type-safe query builder

---

## Session Management

### Session Storage

```typescript
// Location: web/src/lib/supabase/client.ts

// Uses @supabase/ssr for secure session management
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Security Features:**
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Automatic token refresh
- ✅ Secure cookie flags (SameSite, Secure)
- ⚠️ No explicit session timeout
- ⚠️ No concurrent session limits

### Session Lifecycle

1. **Login:** JWT token issued and stored in HTTP-only cookie
2. **Requests:** Token automatically included in requests
3. **Refresh:** Token refreshed automatically before expiration
4. **Logout:** Token invalidated, cookie cleared

---

## Security Monitoring

### Current Logging

```typescript
// Console logging for debugging
console.log("Creating entry with data:", {
  user_id: user.id,
  entry_text_length: entryData.entry_text.length,
  // ...
});
```

**Limitations:**
- ⚠️ No structured security event logging
- ⚠️ No alerting on suspicious activities
- ⚠️ No intrusion detection
- ⚠️ Sensitive data may be logged

### Recommended Security Logging

```typescript
// Security event logging
import { logger } from '@/lib/security-logger';

// Log authentication events
logger.security({
  event: 'login_attempt',
  userId: user.id,
  success: true,
  ip: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
  timestamp: new Date().toISOString(),
});

// Log authorization failures
logger.security({
  event: 'unauthorized_access_attempt',
  userId: user.id,
  resource: 'entry',
  resourceId: entryId,
  ip: request.ip,
  timestamp: new Date().toISOString(),
});
```

**Events to Monitor:**
- Failed login attempts
- Unauthorized access attempts
- File uploads (size, type, frequency)
- Unusual activity patterns
- Error rate spikes

---

## Security Best Practices Implemented

### ✅ Implemented

1. **Authentication**
   - Secure password hashing (Supabase)
   - JWT token-based sessions
   - HTTP-only cookie storage

2. **Authorization**
   - Row-Level Security (RLS) policies
   - Client-side ownership verification
   - Defense-in-depth approach

3. **Input Validation**
   - Client-side validation
   - Input length limits
   - XSS pattern detection
   - File name sanitization

4. **Error Handling**
   - Generic error messages in production
   - No sensitive data exposure
   - Secure error logging

5. **Security Headers**
   - HSTS, CSP, X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection

6. **Database Security**
   - Parameterized queries
   - RLS policies
   - User isolation

### ⚠️ Needs Improvement

1. **Password Policy**
   - Current: 6 characters minimum
   - Recommended: 12+ characters with complexity

2. **Rate Limiting**
   - No rate limiting on auth endpoints
   - Vulnerable to brute force attacks

3. **File Upload Security**
   - No magic byte validation
   - No server-side validation
   - No virus scanning

4. **Multi-Factor Authentication**
   - No MFA/2FA support
   - Single-factor authentication only

5. **Session Management**
   - No explicit session timeout
   - No concurrent session limits

6. **Security Monitoring**
   - No structured security logging
   - No alerting system
   - No intrusion detection

---

## Security Architecture

### Defense in Depth

DiaryPro implements multiple security layers:

```
┌─────────────────────────────────────┐
│  1. Client-Side Validation          │  ← First line of defense
│     - Input validation              │
│     - File type checking             │
│     - Size limits                    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  2. API/Server Validation           │  ← Second line
│     - Authentication check          │
│     - Authorization verification     │
│     - Input sanitization             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  3. Database RLS Policies           │  ← Final line
│     - Row-level security             │
│     - User isolation                 │
│     - Automatic enforcement         │
└─────────────────────────────────────┘
```

### Security Flow Example: Entry Access

```
User Request → Authentication Check → Authorization Check → RLS Policy → Data Return
     ↓              ↓                      ↓                    ↓              ↓
  Browser      JWT Token            User ID Match        Database      Filtered Data
  Client       Validation           Ownership           Query         (User's Only)
```

---

## Security Checklist

### Authentication
- [x] Secure password hashing
- [x] JWT token-based sessions
- [x] HTTP-only cookie storage
- [ ] Strong password policy (12+ chars)
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout mechanism
- [ ] MFA/2FA support

### Authorization
- [x] Row-Level Security (RLS)
- [x] Client-side ownership checks
- [x] User isolation in database
- [ ] API-level authorization middleware

### Data Protection
- [x] HTTPS/TLS encryption
- [x] Secure cookie flags
- [ ] Media file encryption
- [ ] Database backup encryption

### Input Validation
- [x] Client-side validation
- [x] Input length limits
- [x] XSS pattern detection
- [x] File name sanitization
- [ ] Server-side file validation
- [ ] Magic byte validation

### Error Handling
- [x] Generic error messages (production)
- [x] No sensitive data exposure
- [x] Secure error logging
- [ ] Structured error tracking

### Security Headers
- [x] HSTS
- [x] CSP
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] X-XSS-Protection

### Monitoring
- [ ] Security event logging
- [ ] Intrusion detection
- [ ] Alerting system
- [ ] Activity monitoring

---

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor logs for suspicious activity
   - Review error patterns
   - Check for unauthorized access attempts

2. **Containment**
   - Disable affected accounts
   - Revoke compromised sessions
   - Block suspicious IPs

3. **Investigation**
   - Review security logs
   - Identify attack vector
   - Assess data exposure

4. **Remediation**
   - Patch vulnerabilities
   - Update security measures
   - Notify affected users (if required)

5. **Recovery**
   - Restore services
   - Monitor for continued attacks
   - Document lessons learned

---

## Compliance Considerations

### GDPR Compliance

- ✅ User data isolation (RLS)
- ✅ Secure data storage
- ⚠️ Need data export functionality
- ⚠️ Need data deletion functionality
- ⚠️ Need privacy policy

### Data Retention

- ⚠️ No automatic data retention policy
- ⚠️ No data archival process
- ⚠️ Soft delete only (data still in database)

---

## Security Testing

### Recommended Tests

1. **Authentication Testing**
   - Brute force attack simulation
   - Session hijacking attempts
   - Token manipulation

2. **Authorization Testing**
   - Unauthorized entry access
   - Cross-user data access
   - Privilege escalation

3. **Input Validation Testing**
   - XSS payload injection
   - SQL injection attempts
   - File upload attacks

4. **File Upload Testing**
   - Malicious file uploads
   - Oversized file attacks
   - File type spoofing

---

## Conclusion

DiaryPro implements multiple security layers including authentication, authorization, input validation, and secure error handling. However, several areas need improvement, particularly around password policies, rate limiting, file upload security, and security monitoring.

**Priority Actions:**
1. Strengthen password policy
2. Implement rate limiting
3. Add file type validation (magic bytes)
4. Set up security event logging
5. Migrate media files to encrypted storage

For detailed vulnerability information, see `SECURITY_AUDIT.md`.

---

**Last Updated:** 2024  
**Next Review:** Quarterly or after major changes

