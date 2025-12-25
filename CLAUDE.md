# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Didaar Website** - A bilingual (EN/FA) web application with a visual content management system using Next.js 16, Puck editor, and Turso database.

### Tech Stack

- **Next.js 16.1.1** - App Router, React 19.2.3
- **@measured/puck 0.20.2** - Visual page builder/editor for content management
- **Turso** - SQLite-compatible database via `@libsql/client`
- **Tailwind CSS v4** - Styling with PostCSS
- **next-intl** - Planned for partial i18n (public routes only)
- **TypeScript** - Strict mode enabled

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Next.js 16 Architecture

### Directory Structure

```
app/                     # Next.js App Router (file-based routing)
├── (intl)/             # Route group - internationalized public routes
│   └── [locale]/       # Dynamic locale segment (en, fa)
│       ├── page.tsx    # Public homepage
│       └── ...
├── (admin)/            # Route group - non-internationalized admin
│   └── admin/
│       ├── page.tsx    # Admin dashboard
│       └── ...
├── api/                # API routes (non-internationalized)
├── actions/            # Server Actions (Next.js 16)
├── layout.tsx          # Root layout
└── page.tsx           # Root redirect to default locale
lib/
├── db.ts              # Database client
├── auth/              # Authentication utilities (lucia)
└── i18n/              # Internationalization config
types/                  # TypeScript definitions
messages/               # Translation files (en/, fa/)
```

### Next.js 16: Request Proxies (Replacing Middleware)

**Important:** Next.js 16 uses request proxies instead of middleware.

```typescript
// lib/proxy.ts or app/proxy.ts
import { createProxy } from 'next/request';

export const config = {
  // Exclude routes from i18n processing
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)'
};

export default createProxy(({ request, reply }) => {
  // Handle locale detection and routing here
});
```

### Actions Folder (Server Actions)

Server Actions live in `app/actions/`:

```
app/actions/
├── pages/        # Page CRUD operations
├── auth/         # Authentication actions
└── settings/     # Site settings actions
```

### Lib Folder (Shared Utilities)

```
lib/
├── db.ts          # Database client singleton
├── auth/
│   └── lucia.ts   # GitHub OAuth configuration
├── i18n/
│   ├── routing.ts # next-intl routing config
│   └── request.ts # Request configuration
└── validators.ts  # Schema validation
```

## i18n Architecture: Partial Localization

**Decision:** Use next-intl with middleware matcher to exclude admin routes.

### URL Structure

- `/en/*` - English public pages (internationalized)
- `/fa/*` - Farsi public pages (internationalized)
- `/admin/*` - Admin dashboard (English-only, no locale prefix)
- `/api/*` - API routes (no i18n)

### Routing Configuration

```typescript
// lib/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fa'],
  defaultLocale: 'en',
  // No custom pathnames needed - use prefixed routing
});
```

### Matcher Excludes Admin

```typescript
// In request proxy configuration
matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)'
```

This ensures `/admin`, `/api`, and other internal routes bypass i18n processing.

## Puck Editor Integration

### Current Implementation

- Demo editor at `app/demo/editor.tsx` (will be moved to admin)
- Uses `@measured/puck` with component-based configuration
- Save function is placeholder - needs implementation

### Planned Architecture

- Admin-only: `/admin/editor/[pageId]`
- Stores Puck data as JSON in `pages.translations` field
- Separate Puck configs for EN and FA content

## Database Schema (Planned)

### Pages Table

```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES pages(id),
  is_draft BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE page_translations (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES pages(id),
  locale TEXT NOT NULL, -- 'en' or 'fa'
  puck_data TEXT NOT NULL, -- JSON from Puck editor
  UNIQUE(page_id, locale)
);
```

### Recursive Slug Logic

- Home: `/`
- Child: `/parent/child`
- Grandchild: `/parent/child/grandchild`

Child pages can be published even if parent is draft.

## Planned Features

From Anytype project spec ("Didaar website" page):

1. **GitHub OAuth** - Admin authentication via lucia
2. **Bilingual Support** - English and Farsi with next-intl
3. **Page Hierarchy** - Nested pages with parent-child relationships
4. **Draft/Publish Logic** - Child pages can be published even if parent is draft
5. **Admin Dashboard** - Page tree manager with drag-and-drop, site settings

## VS Code Compatibility

### Recommended Extensions

- `dbaeumer.vscode-eslint` - ESLint
- `esbenp.prettier-vscode` - Prettier
- `bradlc.vscode-tailwindcss` - Tailwind CSS IntelliSense
- `ms-vscode.vscode-typescript-next` - TypeScript

### Workspace Settings

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Development Notes

- Demo at `/demo` shows basic database connectivity
- Main landing page still uses default Next.js template
- GitHub OAuth and Drizzle ORM not yet implemented
