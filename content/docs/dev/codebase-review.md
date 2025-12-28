# Codebase Review & Architecture Guide

**Last Updated**: December 27, 2025  
**Version**: 1.0.0

This guide provides a comprehensive review of the Pucked codebase, divided into logical sections with detailed explanations of how each part works. Each section is numbered and cross-referenced for easy navigation.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Routing & Internationalization](#3-routing--internationalization)
4. [Database & ORM](#4-database--orm)
5. [Page Builder & Content Management](#5-page-builder--content-management)
6. [UI Components & Design System](#6-ui-components--design-system)
7. [Server Actions & Forms](#7-server-actions--forms)
8. [API Routes](#8-api-routes)
9. [Issues & Optimization Guide](#9-issues--optimization-guide)
10. [Quick Reference](#10-quick-reference)

---

## 1. Project Overview

### 1.1 What is Pucked?

**Pucked** is a bilingual (English/Farsi) web application built with Next.js 16 that features:

- **Invitation-based authentication** using GitHub OAuth
- **Visual page builder** powered by `@measured/puck`
- **Turso database** (libSQL/SQLite) with Drizzle ORM
- **Partial internationalization** via next-intl (public routes only)
- **Next.js 16 App Router** with React 19
- **Shadcn UI** component library for public-facing UI
- **Dual design system** (Puck for admin, Shadcn for public)

### 1.2 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| Turso | Latest | Edge-hosted libSQL database |
| Drizzle ORM | Latest | Type-safe ORM |
| Arctic | Latest | OAuth client library |
| next-intl | Latest | Internationalization |
| Tailwind CSS | v4 | Styling |
| TypeScript | Strict mode | Type safety |

### 1.3 Project Structure

```md
pucked/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized public routes
│   ├── admin/             # Admin area (English-only)
│   ├── api/               # API routes
│   ├── actions.ts         # Server actions
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── ui/                # Shadcn UI components
│   └── markdown/          # Documentation components
├── db/                    # Database schema
├── lib/                   # Business logic
├── i18n/                  # Internationalization config
├── content/docs/          # Documentation content
├── public/                # Static assets
├── scripts/               # Utility scripts
└── types/                 # TypeScript definitions
```

**Next**: [2. Authentication & Session Management](#2-authentication--session-management)

---

## 2. Authentication & Session Management

### 2.1 Overview

The authentication system uses GitHub OAuth with an invitation-based signup flow. Users must have a valid invitation code to complete their registration.

### 2.2 Authentication Flow

```md
┌─────────────────┐
│ 1. User visits  │
│    /login       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Redirect to  │
│    GitHub OAuth │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. GitHub       │
│    callback     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Create/      │
│    update user  │
│    in database  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Create       │
│    session      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Check if     │
│    invitation   │
│    accepted?    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   No        Yes
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Redirect│ │ Redirect │
│ to      │ │ to       │
│ /signup │ │ /admin   │
└─────────┘ └──────────┘
```

### 2.3 Key Files

| File | Purpose |
|------|---------|
| `lib/oauth.ts` | GitHub OAuth client configuration using Arctic |
| `lib/session.ts` | Session management (token generation, validation, cookies) |
| `lib/users.ts` | User CRUD operations |
| `lib/invitation.ts` | Invitation code generation and validation |
| `lib/route-guard.ts` | `requireAuth()` for protecting routes |
| `app/api/login/github/route.ts` | OAuth initiation endpoint |
| `app/api/login/github/callback/route.ts` | OAuth callback handler |
| `app/actions.ts` | `submitInvitation`, `loginWithGitHub`, `logout` actions |

### 2.4 Session Management

Sessions use the Oslo crypto library for secure token generation:

- **Token Format**: Base32 encoded, 20 random bytes
- **Storage**: SHA256 hash stored in database, raw token in HttpOnly cookie
- **Expiration**: Sessions auto-extend if within 45 minutes of expiration
- **Security**: Tokens are never stored directly, only their hashes

**Example Session Creation**:
```typescript
// From lib/session.ts
const token = generateRandomToken(20); // 20 random bytes
const sessionId = createSHA256Hash(token); // Hash for storage
await db.insert(sessions).values({
  id: sessionId,
  userId: user.id,
  expiresAt: new Date(Date.now() + SESSION_DURATION * 1000)
});
cookies().set('session', token, { 
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
});
```

### 2.5 Route Protection

**Server Components** (preferred):
```typescript
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user } = await requireAuth({ requireInvitation: true });
  // Redirects to /login if not authenticated
  // Redirects to /signup if authenticated but invitation not accepted
  return <div>Welcome {user.username}</div>;
}
```

**Server Actions**:
```typescript
"use server";
import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth();
  // Perform action with authenticated user
}
```

**Client Components**: Use `AuthGuard` wrapper from `@/components/auth-guard.tsx`

### 2.6 Invitation System

Invitation codes are generated using a cryptographically secure random generator:

- **Format**: 6-character alphanumeric code
- **Usage**: Single-use by default
- **Expiration**: Optional expiration date
- **Tracking**: Creator user ID and usage timestamp stored

**Related Documentation**:
- [3. Routing & Internationalization](#3-routing--internationalization)
- [7. Server Actions & Forms](#7-server-actions--forms)

---

## 3. Routing & Internationalization

### 3.1 Overview

Pucked uses **partial internationalization** - only public routes are internationalized, while admin routes remain English-only.

### 3.2 URL Structure

| Route Pattern | Description | i18n |
|---------------|-------------|-----|
| `/en/*`, `/fa/*` | Internationalized public routes | ✅ Yes |
| `/admin/*` | Admin area | ❌ No |
| `/api/*` | API routes | ❌ No |

### 3.3 Key Files

| File | Purpose |
|------|---------|
| `proxy.ts` | Next-intl middleware with matcher |
| `i18n/routing.ts` | Locale configuration (en, fa) |
| `i18n/request.ts` | Message loading from `messages/{locale}.json` |
| `app/[locale]/layout.tsx` | Locale validation and provider setup |
| `app/page.tsx` | Root redirect to default locale |

### 3.4 Middleware Configuration

The middleware (`proxy.ts`) excludes admin and API routes from i18n processing:

```typescript
export const matcher = [
  // Match all paths except admin, api, and static files
  '/((?!api|admin|_next|_vercel|.*\\..*).*)',
];
```

### 3.5 Adding New Routes

**Public/Bilingual Routes**:
```typescript
// Add to app/[locale]/
app/[locale]/about/page.tsx
```

**Admin-Only Routes**:
```typescript
// Add to app/admin/ (no locale segment)
app/admin/settings/page.tsx
```

**API Routes**:
```typescript
// Add to app/api/
app/api/users/route.ts
```

### 3.6 Message Files

Translation messages are stored in:
- `messages/en.json` - English translations
- `messages/fa.json` - Farsi translations

**Usage in Components**:
```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('MyComponent');
  return <h1>{t('title')}</h1>;
}
```

**Related Documentation**:
- [2. Authentication & Session Management](#2-authentication--session-management)
- [5. Page Builder & Content Management](#5-page-builder--content-management)

---

## 4. Database & ORM

### 4.1 Overview

Pucked uses Turso (edge-hosted libSQL) as the database with Drizzle ORM for type-safe database operations.

### 4.2 Key Files

| File | Purpose |
|------|---------|
| `db/schema.ts` | Drizzle ORM schema with relations |
| `lib/db.ts` | Turso client singleton |
| `drizzle.config.ts` | Migration configuration |
| `migrations/` | Auto-generated migration files |

### 4.3 Database Schema

**Core Tables**:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | githubId, username, invitationAcceptedAt |
| `sessions` | Session management | id (hash), userId, expiresAt |
| `invitations` | Invitation codes | code, creatorId, expiresAt, usedAt |
| `pages` | Page hierarchy | title, slug, parentId, locale |
| `page_translations` | Bilingual content | pageId, locale, content |
| `site_settings` | Site configuration | key, value, locale |

### 4.4 Migration Workflow

```bash
# 1. Modify schema in db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration to database
pnpm db:migrate

# 4. (Optional) Open Drizzle Studio for visual inspection
pnpm db:studio
```

**Important**: Always run `pnpm db:generate` after modifying `db/schema.ts`.

### 4.5 Database Client

The database client is a singleton instance in `lib/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

### 4.6 Environment Variables

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

**Related Documentation**:
- [2. Authentication & Session Management](#2-authentication--session-management)
- [5. Page Builder & Content Management](#5-page-builder--content-management)

---

## 5. Page Builder & Content Management

### 5.1 Overview

Pucked uses `@measured/puck` for visual page building in the admin area, with a dual-layout architecture for the editor preview and guest-facing pages.

### 5.2 Dual-Layout Architecture

**Why Two Layouts?**

The guest navbar and footer components use `next-intl` hooks (`useLocale`, `useTranslations`) which require the `NextIntlClientProvider` context. The Puck editor runs at `/admin/pages/*` which is outside the `[locale]` route structure and doesn't have this provider. Therefore, we use simplified preview components in the editor.

### 5.3 Layout Systems

| Context | Layout Component | i18n Support |
|---------|-----------------|--------------|
| Guest Pages | `GuestNavbar`/`GuestFooter` | ✅ Full |
| Editor Preview | `PreviewNavbar`/`PreviewFooter` | ❌ Simplified |

### 5.4 Key Files

| File | Purpose |
|------|---------|
| `puck.config.tsx` | Puck configuration with `root.render` function |
| `components/puck-render.tsx` | Client component wrapper for Puck's Render component |
| `components/locale-layout-client.tsx` | Guest page layout with navbar/footer |
| `components/guest-navbar.tsx` | Public navbar with full i18n support |
| `components/guest-footer.tsx` | Public footer with full i18n support |
| `app/[locale]/[...path]/page.tsx` | Server Component that renders Puck pages |

### 5.5 Puck Config root.render Pattern

```typescript
// In puck.config.tsx
root: {
  render: ({ children }) => {
    const dir = locale === "fa" ? "rtl" : "ltr";
    
    if (isPreview) {
      // Editor preview mode - show full layout with preview components
      return (
        <div dir={dir} className="min-h-screen flex flex-col">
          <PreviewNavbar locale={locale} />
          <main className="flex-1 mx-auto prose md:prose-lg md:max-w-xl lg:max-w-2xl px-4 py-8 w-full">
            {children}
          </main>
          <PreviewFooter locale={locale} />
        </div>
      );
    }
    
    // Render mode - just return children, no wrapper
    // Layout is handled by Next.js layout (locale-layout-client.tsx)
    return <>{children}</>;
  }
}
```

### 5.6 Critical Rules

1. **Render Mode**: Must return just `<>{children}</>` - NO wrapper div, NO layout
2. **Preview Mode**: Full layout with navbar, footer, prose styling
3. **Prose Classes Must Match**: Both layouts use identical prose classes for WYSIWYG
4. **Never Pass Functions to Client Components**: Use `components/puck-render.tsx` wrapper

### 5.7 Prose Typography Classes

Used in both guest layout and editor preview:
```typescript
"prose md:prose-lg md:max-w-xl lg:max-w-2xl px-4 py-8 w-full"
```

**Related Documentation**:
- [3. Routing & Internationalization](#3-routing--internationalization)
- [6. UI Components & Design System](#6-ui-components--design-system)

---

## 6. UI Components & Design System

### 6.1 Overview

Pucked uses a **dual design system** approach:
- **Admin Area** (`/admin/*`): Uses `@measured/puck` components
- **Guest/Public Area** (`/app/[locale]/*`): Uses Shadcn UI components

### 6.2 Core Principles

1. **NEVER use inline styles** - Always use Tailwind utility classes
2. **Use semantic color tokens** - `bg-primary`, `text-destructive`, not hardcoded colors
3. **Always include dark mode support** - Add `dark:` variants for all colors
4. **Use the `cn()` helper** - For conditional class merging from `@/lib/utils`

### 6.3 Admin Area - Puck Components

**Location**: All files in `app/admin/` directory

**Component Library**: `@measured/puck` version 0.20.2

**Available Components**:
- **ActionBar** - Action bar with label and action buttons
- **Button** - Primary and secondary button variants
- **IconButton** - Icon-only buttons with tooltip support
- **Drawer** - Collapsible drawer for navigation
- **DropZone** - Drop zone for drag-and-drop content
- **FieldLabel** - Labels for form fields
- **AutoField** - Auto-rendering field component

**Standard Pattern**:
```tsx
import { Button, ActionBar, IconButton } from "@measured/puck"

export function AdminPage() {
  return (
    <div className="admin-container">
      <ActionBar label="Actions">
        <ActionBar.Action onClick={() => {}}>
          <Button variant="primary">Save</Button>
        </ActionBar.Action>
      </ActionBar>
    </div>
  )
}
```

### 6.4 Guest/Public Area - Shadcn UI

**Location**: All files in `app/[locale]/` directory

**Component Library**: Shadcn UI (located in `components/ui/`)

**Standard Pattern**:
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PublicPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

### 6.5 Common UI Patterns

**Spacing**:
- Use Tailwind scale (4px base): `gap-4`, `p-6`, `space-y-4`
- For flex layouts: `gap-2`, `gap-4` (NOT `space-x-2`)
- For vertical layouts: `space-y-2`, `space-y-4`

**Text**:
- Sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Weights: `font-medium`, `font-semibold`, `font-bold`
- Colors: `text-muted-foreground`, `text-destructive`, `text-primary`

**Error Styling**:
```tsx
{/* Field error */}
<Input className={hasError ? "border-destructive" : ""} />
{hasError && <p className="text-xs text-destructive">{error}</p>}

{/* Form-level error */}
<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
  <p className="text-sm text-destructive">{error}</p>
</div>
```

**Related Documentation**:
- [5. Page Builder & Content Management](#5-page-builder--content-management)
- [7. Server Actions & Forms](#7-server-actions--forms)

---

## 7. Server Actions & Forms

### 7.1 Overview

All server actions MUST use React 19's `useActionState` hook for form handling.

### 7.2 Server Action Definition

**Location**: `app/actions.ts` (centralized server actions)

**Standard Pattern**:
```typescript
"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/route-guard";

type FormState = {
  errors?: {
    fieldName?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function someAction(prevState: FormState, formData: FormData) {
  const { user } = await requireAuth();
  
  // Validate input
  const title = formData.get("title");
  if (!title || typeof title !== "string") {
    return {
      errors: {
        title: ["Title is required"]
      }
    };
  }
  
  // Process data
  try {
    // Database operations, etc.
    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ["Something went wrong. Please try again."]
      }
    };
  }
}
```

### 7.3 Client Component Form Pattern

**CRITICAL**: Always use `useActionState` from `react`, NOT `useFormState` from `react-dom`.

```typescript
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormState = {
  errors?: {
    title?: string[]
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

export function MyForm() {
  const [state, formAction] = useActionState(someAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Enter title"
          required
          className={state.errors && 'title' in state.errors ? "border-destructive" : ""}
        />
        {state.errors && 'title' in state.errors && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      {state.errors && '_form' in state.errors && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      <Button type="submit" className="w-full">Submit</Button>
    </form>
  )
}
```

### 7.4 Key Requirements

1. Import `useActionState` from `"react"` (NOT `react-dom`)
2. Server action must accept `(prevState, formData)` as parameters
3. Always type the FormState interface
4. Use type-safe error checking: `'field' in state.errors && Array.isArray(state.errors.field)`
5. Use semantic color tokens: `text-destructive`, `bg-destructive/10`, `border-destructive/20`
6. **CRITICAL**: Never call `formAction()` directly in onClick - pass it to form's `action` prop

**Related Documentation**:
- [2. Authentication & Session Management](#2-authentication--session-management)
- [6. UI Components & Design System](#6-ui-components--design-system)

---

## 8. API Routes

### 8.1 Overview

API routes in Pucked handle server-side logic for authentication, file uploads, and admin operations.

### 8.2 API Route Structure

```
app/api/
├── login/
│   └── github/
│       ├── route.ts              # OAuth initiation
│       └── callback/
│           └── route.ts          # OAuth callback handler
├── upload/
│   └── route.ts                  # Image upload endpoint
└── admin/
    └── [...path]/
        └── route.ts              # Admin page operations
```

### 8.3 Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/login/github` | GET | Initiate GitHub OAuth flow |
| `/api/login/github/callback` | GET | Handle GitHub OAuth callback |
| `/api/upload` | POST | Upload images to Cloudinary |
| `/api/admin/[...path]` | GET/POST/DELETE | Admin page CRUD operations |

### 8.4 Authentication in API Routes

API routes can use `requireAuth()` for protection:

```typescript
import { requireAuth } from "@/lib/route-guard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user } = await requireAuth();
  // Process request with authenticated user
  return NextResponse.json({ data: "..." });
}
```

**Related Documentation**:
- [2. Authentication & Session Management](#2-authentication--session-management)
- [7. Server Actions & Forms](#7-server-actions--forms)

---

## 9. Issues & Optimization Guide

### 9.1 Issues by Severity

#### High Severity
- **None critical** - No security or crash-level issues detected.

#### Medium Severity

**Tailwind Class Canonicalization Warnings**:
- **Location**: `components/admin/rtl-text-input.tsx`, `puck.config.tsx`
- **Issue**: Non-canonical Tailwind classes (e.g., `border-[var(--puck-color-grey-09)]` → `border-(--puck-color-grey-09)`)
- **Impact**: Reduced maintainability and potential build performance issues
- **Fix**: Refactor to canonical forms

**Examples**:
```typescript
// Before
className="border-[var(--puck-color-grey-09)] px-[15px]"

// After
className="border-(--puck-color-grey-09) px-3.75"
```

#### Low Severity

**Spellcheck Warnings**:
- **Issue**: "Unknown word" warnings for project-specific terms
- **Examples**: "Pucked", "Turso", "signup", "libsql"
- **Fix**: Add to spellchecker dictionary

### 9.2 Optimization Opportunities

1. **Tailwind Class Canonicalization**
   - Refactor all non-canonical classes
   - Improves consistency and build performance

2. **Spellchecker Dictionary**
   - Add project-specific terms to reduce false positives

3. **Component Unification**
   - Consider unifying guest/admin layout logic for nav/footer
   - Requires solving i18n context issue

4. **Error Handling**
   - Centralize error handling in server actions
   - Standardize error messages

5. **Dark Mode Audit**
   - Ensure all UI components have proper dark mode support

6. **Script Portability**
   - Review scripts for Windows/Unix compatibility

7. **Documentation**
   - Expand usage examples
   - Keep docs in sync with code changes

### 9.3 Performance Considerations

- **Database Queries**: Use proper indexes on frequently queried fields
- **Image Optimization**: Leverage Next.js Image component and Cloudinary transformations
- **Bundle Size**: Regularly audit bundle size for unnecessary dependencies
- **Server Components**: Prefer Server Components over Client Components where possible

**Related Documentation**:
- [4. Database & ORM](#4-database--orm)
- [6. UI Components & Design System](#6-ui-components--design-system)

---

## 10. Quick Reference

### 10.1 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Apply migrations to database
pnpm db:studio        # Open Drizzle Studio

# Invitations
pnpm create-invitation  # Create invitation code
```

### 10.2 Environment Variables

```bash
# Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 10.3 Key File Locations

| Purpose | File Path |
|---------|-----------|
| OAuth Config | `lib/oauth.ts` |
| Session Management | `lib/session.ts` |
| Route Protection | `lib/route-guard.ts` |
| Database Schema | `db/schema.ts` |
| Puck Config | `puck.config.tsx` |
| Server Actions | `app/actions.ts` |
| i18n Config | `i18n/routing.ts` |
| Middleware | `proxy.ts` |

### 10.4 Documentation Links

- [Puck Components Guide](/admin/docs/dev/puck-components) - Complete Puck component API
- [UI Guidelines](/admin/docs/dev/ui-guidelines) - UI patterns and styling conventions
- [Server Actions Guide](/admin/docs/dev/server-actions) - Server action patterns
- [Authentication System](/admin/docs/dev/authentication) - Complete auth flow documentation
- [Database Setup](/admin/docs/dev/database-setup) - Database documentation

---

**Next Steps**:
1. Review each section in detail
2. Address medium-severity issues (Tailwind canonicalization)
3. Implement optimization opportunities
4. Keep documentation updated as code evolves

**Document Version**: 1.0.0  
**Last Reviewed**: December 27, 2025
