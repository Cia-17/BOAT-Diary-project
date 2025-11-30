Security checklist for PHP backend

1. Authentication
- Use password_hash() / password_verify() for passwords.
- Use secure session cookies (session_set_cookie_params with HttpOnly and Secure flags).

2. SQL Injection
- Use PDO with prepared statements for all DB access.

3. XSS
- Escape all output with htmlspecialchars() before rendering in HTML.
- For any rich text, sanitize server-side (strip_tags or a library) and restrict allowed tags.

4. CSRF
- Add CSRF tokens to all forms that perform state changes and validate on POST.

5. File uploads
- Check MIME type and extension on server.
- Limit file size (e.g., 5MB for images, 10MB for audio if used).
- Store uploads outside web root or use randomized filenames.
- Validate images with getimagesize() for images.

6. Input validation
- Validate and sanitize input server-side; do not rely on client validation.

7. Rate limiting & brute force
- Add simple login attempt counters per IP or user; lockout after N attempts.

8. HTTPS
- Use HTTPS in production.

9. Logging
- Log failed auth attempts and file upload errors; avoid logging sensitive data.

10. Deployment
- Do not commit .env or secrets to GitHub; use environment variables on the server.
