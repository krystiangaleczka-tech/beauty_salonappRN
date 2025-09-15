# Project Overview

This document summarizes the codebase structure, tech stack, run instructions, and per-file descriptions to enable fast AI search and serve as living memory for future changes.

## Tech Stack

- __Monorepo__: `apps/mobile` (Expo/React Native), `apps/web` (Vite + React Router + Express dev server)
- __Language__: TypeScript and JavaScript
- __Mobile__: Expo SDK 54, React Native 0.81.4, Expo Router 5, TanStack Query 5, Lucide icons
- __Web__: Vite 6, React 18, React Router 7, Express dev server, Chakra UI, TanStack Query, Stripe SDK
- __Server/API (dev)__: Express proxy + Vite middleware (`apps/web/server.js`), API routes under `apps/web/src/app/api/*`
- __DB Layer__: PostgreSQL with `pg` connector (`@/app/api/utils/sql.js`), fallback to mock data

## How to Run

- __Mobile (Expo)__
  - From repo root: `cd apps/mobile && npx expo start`
  - iOS simulator: press `i`; Android emulator: press `a`; device: scan QR in Expo Go

- __Web (Vite + Express)__
  - From repo root: `cd apps/web && npm i`, then `HOST=0.0.0.0 npm run dev` (runs `node server.js`)
  - Opens dev server at http://localhost:3000 (accessible on all network interfaces)
  - For mobile app connectivity: Use `HOST=0.0.0.0` to bind server to all interfaces
  - Proxies API to http://localhost:4000 via `/api` (see `apps/web/server.js`)

## Repository Layout

- `apps/`
  - `mobile/` — Expo/React Native app
  - `web/` — Vite + React web app and API routes

---

## apps/mobile (Expo / React Native)

Key configuration and entry files:

- `apps/mobile/App.tsx` — Expo app entry shim (delegates to `index.tsx` / router).
- `apps/mobile/index.tsx` — Client entry for web/native rendering.
- `apps/mobile/index.web.tsx` — Web-specific entry.
- `apps/mobile/app.json` — Expo app config (name, icons, splash).
- `apps/mobile/metro.config.js` — Metro bundler config.
- `apps/mobile/eas.json` — EAS build config.
- `apps/mobile/package.json` — Dependencies and scripts.
- `apps/mobile/global.css` / `fontawesome.css` — Global styles for web/native rendering.
- `apps/mobile/expo-env.d.ts` / `global.d.ts` — Type declarations for Expo/global types.

Patches and polyfills:

- `apps/mobile/patches/*` — Patch-package overrides for specific dependencies.
- `apps/mobile/polyfills/native/texinput.native.jsx` — Native text input polyfill.
- `apps/mobile/polyfills/shared/expo-image.tsx` — Shared polyfill for Expo image.
- `apps/mobile/polyfills/web/*` — Web polyfills and shims (SafeAreaView, notifications, maps, etc.).

Generated/cache (dev only):

- `apps/mobile/caches/*` — Metro cache files.

Source code (`apps/mobile/src/`):

- `__create/fetch.ts` — Fetch helper for development scaffolding.
- `__create/polyfills.ts` — Dev polyfills bootstrap.

Routing and screens:

- `app/_layout.jsx` — Root Expo Router layout.
- `app/+not-found.tsx` — 404 screen.
- `app/index.jsx` — Initial route/screen.
- `app/(tabs)/_layout.jsx` — Tab navigator layout.
- `app/(tabs)/home.jsx` — Home tab screen.
- `app/(tabs)/dashboard.jsx` — Dashboard tab screen.
- `app/(tabs)/bookings.jsx` — Bookings tab screen.
- `app/(tabs)/profile.jsx` — Profile tab screen.
- `app/(tabs)/services.jsx` — Services list screen.
  - Uses `@tanstack/react-query` to fetch `/api/services`.
  - Renders cards with name, description, duration, price.
  - Category filter UI with "All" default, filtering by `service.category`.
- `app/book-service.jsx` — Booking flow for a selected service.

Components:

- `components/KeyboardAvoidingAnimatedView.jsx` — Wrapper combining KeyboardAvoidingView with animations.

Config and hooks:

- `config.ts` — App configuration (env, constants). BASE_URL set to IP address for network connectivity.
- `utils/auth/*` — Auth integrations for the mobile app:
  - `AuthWebView.jsx` — WebView-based auth flow.
  - `index.js` — Auth exports.
  - `store.js` — Zustand store for auth state.
  - `useAuth.js` — Hook exposing auth actions/state.
  - `useAuthModal.jsx` — Hook to handle auth modal presentation.
  - `useUser.js` — Hook for current user retrieval.
- `utils/useHandleStreamResponse.js` — Stream response parsing utility.
- `utils/usePreventBack.js` — Hook to intercept/block back navigation.
- `utils/useUpload.js` — Upload handling utilities (likely via Uploadcare).

Assets:

- `assets/images/*` — Icons and splash assets.

---

## apps/web (Vite + React + Express Dev Server)

Dev server:

- `apps/web/server.js` — Express server with Vite in middleware mode.
  - Proxies `/api` to `http://localhost:4000` and forwards public env vars.
  - Enables HMR (overlay disabled), polling watcher for stability.

App root and global:

- `src/app/layout.jsx` — Root layout wrapper.
- `src/app/page.jsx` — Default page/route.
- `src/app/root.tsx` — React Router root integration.
- `src/app/routes.ts` — Route definitions (filesystem-based helper).
- `src/app/global.css` / `src/index.css` — Global styles.
- `src/client.d.ts` / `src/global.d.ts` — Type declarations.

Dev helpers (`src/__create/*`):

- `@auth/create.js` — Auth scaffolding for dev.
- `HotReload.tsx` — Dev hot-reload helper.
- `PolymorphicComponent.tsx` — Utility component example.
- `dev-error-overlay.js` — Custom error overlay.
- `fetch.ts` — Fetch wrapper for dev.
- `hmr-sandbox-store.ts` — HMR store utilities.
- `stripe.ts` — Stripe client helper for dev/testing.
- `useDevServerHeartbeat.ts` — Dev server health ping.

Client integrations:

- `src/client-integrations/chakra-ui.jsx` — Chakra UI provider setup.
- `src/client-integrations/pdfjs.js` — PDF.js setup.
- `src/client-integrations/react-google-maps.jsx` — Google Maps provider setup.
- `src/client-integrations/react-markdown.jsx` — React Markdown config (with GFM).
- `src/client-integrations/recharts.jsx` — Recharts integration.
- `src/client-integrations/shadcn-ui.jsx` — shadcn/ui integration glue.

Utilities:

- `src/utils/create.js` — Shared create utilities.
- `src/utils/useAuth.js` — Authentication hook (web).
- `src/utils/useHandleStreamResponse.js` — Stream response utility.
- `src/utils/useUpload.js` — Upload helper.

Authentication:

- `src/auth.js` — Auth core config (Auth.js/Hono integration).

API routes (`src/app/api/*`):

- `__create/ssr-test/route.js` — Dev SSR test endpoint.
- `admin/dashboard/route.js` — Admin dashboard data.
- `auth/expo-web-success/route.js` — Expo auth callback.
- `auth/token/route.js` — Token issuing endpoint.
- `availability/route.js` — Availability API.
- `bookings/[id]/route.js` — Booking by ID.
- `bookings/route.js` — Bookings collection endpoint.
- `calendar/availability/route.js` — Calendar availability.
- `google-calendar/sync/route.js` — Google Calendar sync endpoint.
- `services/mock-data.js` — Mock services dataset with categories (Manicure, Pedicure, Podology, Facial, Eyebrows, Permanent Makeup, Other).
- `services/route.js` — GET lists active services (PostgreSQL DB first via `utils/sql.js`, fallback to mock). Server-side category filtering via `?category=` param. POST creates service.
- `services/seed/route.js` — Seeds services into DB (dev helper).
- `utils/create.js` — API helper utilities.
- `utils/sql.js` — SQL client helper (PostgreSQL with `pg` connector) used by routes.
- `utils/upload.js` — Upload utilities for API.
- `vitest.config.ts` — Test config for API layer.

Other app files:

- `src/app/__create/not-found.tsx` — Dev 404 page.

---

## Conventions and Notes

- __Paths__: Many web API files use `@/app/...` aliased pathing (see Vite TS config and `vite-tsconfig-paths`).
- __Data fetching__: Mobile fetches from `/api` expecting the web dev server to proxy to backend.
- __Services API__: The mobile `services.jsx` uses `GET /api/services` and expects fields: `id`, `name`, `description`, `category`, `duration_minutes`, `price`. Category filtering is server-side via `?category=` param.
- __Styling__: Mobile uses inline styles with a warm palette. Web uses global CSS and Chakra UI where needed.

## Future Work / Memory

- If adding new service categories, ensure consistency in `category` strings across DB and mock data.
- ✅ Server-side filtering implemented in `apps/web/src/app/api/services/route.js` by query param `?category=Pedicure`.
- Add tests for API endpoints using `vitest` (see `vitest.config.ts`).
- Document environment variables in `apps/web/.env` (currently `.env` is loaded by `server.js`).
- Centralize shared types for Service between mobile and web (e.g., `/packages/types`).

