# Safe Courier — Client

A modern single-page app for the Safe Courier delivery platform, built with
**Vite + React + TypeScript + MUI**.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **MUI v6** (Material UI) + **@mui/x-data-grid** for tables
- **TanStack Query** for server state (caching, mutations, invalidation)
- **Axios** with JWT + 401 interceptors
- **React Hook Form** + **Zod** for forms and validation
- **React Router v7** for routing
- **notistack** for notifications

## Features

- Email/username + password auth (JWT), with token decoding and auto-logout on 401
- Role-aware UI (user / courier / admin) driven by the token claims
- Dashboard with delivery stats and recent parcels
- Parcels list with filters, search, and a data grid
- Create parcel, parcel detail with status timeline
- Role-scoped actions: cancel, update destination (owner/admin); update
  status & current location (admin / assigned courier); assign courier &
  payment status (admin)
- Public parcel tracking (no auth)
- Profile management and password change
- Admin user management
- Light/dark theme

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

In development, requests to `/api` are proxied to the backend (default
`http://localhost:4500`). Override with `VITE_PROXY_TARGET`.

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable            | Purpose                                                        |
| ------------------- | ------------------------------------------------------------- |
| `VITE_API_URL`      | API base URL. Defaults to `/api/v1` (uses the dev proxy).     |
| `VITE_PROXY_TARGET` | Backend origin the dev proxy forwards `/api` to.              |

> `VITE_API_URL` is inlined at **build time**.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Type-check and build for production   |
| `npm run preview`   | Preview the production build         |
| `npm run typecheck` | Type-check only                      |
| `npm run lint`      | Lint                                 |
| `npm run format`    | Format with Prettier                 |

## Docker

```bash
docker build -t safe-courier-client --build-arg VITE_API_URL=https://api.example.com/api/v1 .
docker run -p 8080:80 safe-courier-client
```

The image builds the SPA and serves it with nginx (with SPA fallback routing).

## Structure

```
src/
  api/         TanStack Query hooks + typed API functions (parcels, users, search)
  auth/        Auth context/provider, token-based session
  components/  Layout (sidebar/topbar) and shared UI (chips, dialogs, timeline)
  lib/         Axios client, query client, token storage
  pages/       Route components (lazy-loaded)
  providers/   Color-mode (theme) provider
  routes/      Route guards (protected / admin / public-only)
  types/       Shared API types
  utils/       Formatting helpers
```
