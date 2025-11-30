# DiaryPro Next.js Build Plan (Updated)

## 1. Bootstrap & Configure Project

- setup-app: Initialize Next 14 App Router project with TypeScript, Tailwind, ShadCN UI, Lucide icons, and Supabase client config (env wiring, responsive base styles).

## 2. Data Layer & Services

- implement-supabase: Define Supabase schema/types/tables for users, entries (text, media metadata, moods), quotes, and guest demo data; add client-side helpers for auth, CRUD, media upload, and analytics queries.

## 3. Core UI & Pages

- build-layout: Implement shared layout (header, nav bar) using ShadCN components matching `UI.md` colors/spacing; ensure responsive behavior and guest mode notice.
- build-dashboard: Create dashboard page combining monthly calendar, mood selector, quick entry form with media inputs, recent entries list, and motivational quote block fed by Supabase.
- build-entry-page: Implement detailed entry creation/edit view supporting text, media uploads (Supabase storage), mood tagging, and delete flow.
- build-insights: Add mood analytics page with charts (e.g., Recharts) powered by Supabase aggregated data.
- build-auth: Implement login/register screens per storyboard with quote display and guest preview.

## 4. Calendar Screen per Spec

- build-calendar-ui: Reproduce `UI.md` screen with styled calendar grid, highlighted dates, recent event cards with Unsplash avatars, responsive tweaks for mobile/desktop.

## 5. Supabase-Backed Features

- hook-auth: Integrate Supabase auth (sign in/up, session handling), guest-mode demo data, profile management, and protected routes.
- hook-entries: Wire calendar, dashboard, and recent list to Supabase CRUD endpoints, including media upload handling and mood tagging.
- hook-quotes: Fetch motivational quote (Supabase table or API) and display on login/dashboard.
- hook-insights: Build Supabase queries for mood analytics powering the Insights page.

## 6. Responsiveness & Polish

- polish-responsive: Add breakpoints, accessible labels, loading states, and error handling across pages; ensure bottom nav adapts on desktop and media behaves.

## 7. Testing & Verification

- verify-tests: Add integration tests (Playwright/Cypress) plus unit tests for Supabase helpers and reducers; run lint/test scripts.