## File Structure

```
php/
├── config.php              # Configuration and security utilities
├── SupabaseClient.php      # Supabase API client class
├── security.php            # OWASP security functions
├── header.php              # Common header component
├── footer.php              # Common footer component
├── styles.css              # Complete vanilla CSS stylesheet
├── index.php               # Home page (redirects)
├── landing.php             # Landing/marketing page
├── login.php               # Login page
├── register.php            # Registration page
├── dashboard.php           # Main dashboard
├── logout.php              # Logout handler
├── journal.php             # Journal entries list
├── entry_new.php           # Create new entry
├── entry_edit.php          # Edit entry
├── entry_view.php          # View entry
├── calendar.php            # Calendar view
├── insights.php            # Analytics/insights
├── settings.php            # User settings
├── js/
│   └── main.js            # Minimal JavaScript
└── .env.example           # Environment variables template
```

## Setup Instructions

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit .env file:
   Add your Supabase URL and Anon Key:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Configure PHP:
   - Ensure PHP 8+ is installed
   - Enable cURL extension
   - Set proper file permissions

4. Deploy:
   - Upload all files to your web server
   - Ensure PHP can write to session directory
   - Configure web server to serve PHP files

## Features Implemented

✅ User Authentication (Login/Register)
✅ Password Strength Validation (OWASP A07)
✅ Rate Limiting (OWASP A04)
✅ Account Lockout (OWASP A07)
✅ CSRF Protection (OWASP A04)
✅ File Upload Security (OWASP A08)
✅ XSS Prevention (OWASP A03)
✅ Dashboard with Quick Entry
✅ Mood Tracking
✅ Media File Support
✅ Entry Management (Create/Read/Update/Delete)
✅ Security Headers

## Security Features

All OWASP Top 10 security measures are implemented:
- Strong password policy (12+ chars, complexity)
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- CSRF token protection
- Input sanitization
- File type validation (magic bytes)
- XSS prevention

## Database

Uses Supabase PostgreSQL database. Schema is defined in `../web/schema.sql`.

## Notes

- All styling converted from Tailwind to vanilla CSS
- All React components converted to PHP pages
- TypeScript logic converted to PHP
- Maintains 100% feature parity with React version
- Simplified file structure for easy maintenance

