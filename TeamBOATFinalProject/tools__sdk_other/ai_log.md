Date: 28/11/2025
Tool: ChatGPT
Prompt: (UI generation prompt for LLM)
"Build a calendar dashboard screen that includes a monthly calendar view, highlighted dates, a section for recent events, and a bottom navigation bar. The layout should be clean, modern, rounded, and minimal, with soft colors and playful accents.

Colors:
Background: #FFFFFF
Primary Text: #000000
Secondary Text: #8A8A8A
Orange: #F4A261
Yellow: #F4D35E
Green: #B7E4C7
Pink: #F7C6CE
Navigation Icons (inactive): #C7C7C7
Active Navigation Icon Background: #F4D35E
Event card backgrounds: #FFE7EF, #FFF7D1

Design notes:
- Ample white space, consistent padding 16-20px, rounded corners 12-20px.
- Typography: Inter; month title 20-22px semibold; day numbers 14-16px; event titles 16px semibold.
- Header: back arrow left, title centered 'Calendar'.
- Calendar: month name with left/right arrows, weekday header M T W T F S S; grid with pastel highlighted date pills; selected date pink #F7C6CE.
- Recent: label 'Recent', two event cards, left date, middle title, right avatar (Unsplash images).
- Bottom nav: fixed, icons Home, Calendar (active), Add, Settings. Active icon has rounded square background (yellow).
- Use actual unsplash images for avatars.

Output expectation: generate Next.js + ShadCN code for full screen layout."

Response summary: Returned a detailed UI spec and sample component structure. Suggested markup, colors, spacing, and sample Unsplash queries for avatar images. Not used verbatim in code; used as visual/style reference.

Used for: visual design and CSS reference for calendar UI.

Validation steps: Compared suggested spacing and colors to mockups. Converted relevant style tokens into CSS variables for project.

Files: tools__ai_sdk_other/ui_prompt.txt



## Entry 2
Date: 29/11/2025
Tool: ChatGPT
Prompt: (Conversion prompt)
"Convert the UI specification above into plain HTML/CSS/JS (no Next.js or ShadCN). Provide:
- a single-page HTML file skeleton with semantic structure for header, calendar grid, recent events, bottom nav
- CSS variables for the color palette and styles matching the prompt
- minimal JS to render a month grid, switch months, highlight sample dates, and implement live search for recent events using fetch/AJAX (mocked data)
Keep code minimal and easily integrable with PHP backend for server-side endpoints (uploads, comments, likes)."

Response summary: Provided an HTML/CSS/JS skeleton and small JS functions for month rendering, month navigation, date highlighting, and AJAX-style fetch for recent events (expects `/api/recent-events` endpoint). Recommended where to plug PHP endpoints.

Used for: starting frontend files: `public/calendar.html`, `public/styles/calendar.css`, `public/scripts/calendar.js`.

Validation steps: Reviewed code for accessibility and progressive enhancement. Confirmed JS does not depend on frameworks and can be connected to PHP endpoints.


## Entry 3
Date: 30/11/2025
Tool: ChatGPT
Prompt: (Security and deployment checklist)
"List minimal security checks for XSS, SQLi, file uploads, and CSRF for a PHP backend serving this project. Provide concrete, simple measures to implement."

Response summary: Short checklist recommending prepared statements (PDO), server-side input validation and output escaping (htmlspecialchars), file mime/size checks, storing uploads outside web root, CSRF tokens for POST requests, and rate limiting. No code was copied directly into project; used as checklist.

Used for: `tools__ai_sdk_other/security_checklist.md`

Validation steps: Applied checklist when writing PHP upload and input handling; tested sample inputs locally.

Files: tools__ai_sdk_other/security_checklist.md
