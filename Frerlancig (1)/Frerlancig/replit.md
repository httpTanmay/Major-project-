# WorkForge - Freelance Marketplace

A modern freelance marketplace platform with seamless onboarding, role-based dashboards, gigs, orders, chat, and payments.

## Overview

WorkForge is a full-stack React application that provides a marketplace for hiring freelancers. The platform includes features for both buyers and sellers, with separate dashboards for managing gigs, orders, earnings, billing, and account management.

**Current State**: Successfully imported and configured to run on Replit. The application is fully functional with development and production deployment configurations in place.

## Recent Changes

- **2025-10-03**: Supabase Integration Completed
  - Integrated Supabase authentication replacing localStorage-based auth
  - Installed @supabase/supabase-js package
  - Created Supabase client utility with environment variable configuration
  - Implemented AuthContext for global session management
  - Updated Login and Register flows to use Supabase auth
  - Added comprehensive error handling for all database operations
  - Configured environment variables via Vite define for client access
  - Seller onboarding now saves skills, languages, certifications, and education to Supabase

- **2025-10-03**: Initial Replit import setup completed
  - Configured Vite dev server to run on port 5000 with host 0.0.0.0
  - Set up HMR for Replit's proxy environment (clientPort: 443)
  - Updated file serving permissions to allow root directory access
  - Configured deployment settings for autoscale production deployment
  - Created .gitignore for Node.js project
  - Installed pnpm package manager and all dependencies

## Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Package Manager**: pnpm (v10.14.0)
- **Testing**: Vitest
- **UI Components**: Radix UI + TailwindCSS 3 + Lucide React icons
- **3D Graphics**: Three.js with React Three Fiber and Drei

## Project Architecture

### Directory Structure

```
builder/
├── client/               # React SPA frontend
│   ├── pages/            # Route components (Index.tsx = home)
│   ├── components/       # React components
│   │   ├── ui/           # Pre-built Radix UI component library
│   │   └── auth/         # Authentication components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── App.tsx           # App entry point with SPA routing
│   └── global.css        # TailwindCSS theming and global styles
├── server/               # Express API backend
│   ├── index.ts          # Main server setup (express config + routes)
│   └── routes/           # API handlers
└── shared/               # Types shared between client & server
    └── api.ts            # Shared API interfaces
```

### Key Features

1. **Dual Dashboard System**
   - Seller Dashboard: Manage gigs, orders, earnings, billing & payments
   - Buyer Dashboard: Explore freelancers, messages, account/profile

2. **Freelancer Discovery**
   - Browse freelancers by skills, projects, certifications
   - View detailed freelancer profiles with ratings

3. **Integrated Development**
   - Single port (5000) for both frontend/backend during development
   - Hot reload for both client and server code
   - API endpoints prefixed with `/api/`

## Development

### Running Locally

The application is configured to run automatically via the "Dev Server" workflow on port 5000.

**Commands:**
- `pnpm dev` - Start dev server (client + server)
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm typecheck` - TypeScript validation
- `pnpm test` - Run Vitest tests

### Environment Configuration

- **Development Port**: 5000
- **Development Host**: 0.0.0.0 (required for Replit)
- **HMR Client Port**: 443 (required for Replit proxy)

### Adding New Features

#### New Page Route
1. Create component in `builder/client/pages/MyPage.tsx`
2. Add route in `builder/client/App.tsx`

#### New API Endpoint
1. Create shared interface in `builder/shared/api.ts` (optional)
2. Create route handler in `builder/server/routes/my-route.ts`
3. Register route in `builder/server/index.ts`

## Deployment

Configured for Replit autoscale deployment:
- **Build**: `cd builder && pnpm build`
- **Run**: `cd builder && pnpm start`

The deployment uses autoscale target, suitable for stateless web applications.

## User Preferences

- Package Manager: pnpm (as specified in package.json)
- Code Style: TypeScript with strict typing
- UI Framework: TailwindCSS with Radix UI components
