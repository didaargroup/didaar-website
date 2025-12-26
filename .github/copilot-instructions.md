# GitHub Copilot Instructions - Pucked Project

This document guides AI coding agents working on the Pucked codebase - a bilingual Next.js 16 application with invitation-based authentication and visual content management.

## Project Overview

**Pucked** - A bilingual (English/Farsi) web application with:
- GitHub OAuth authentication with invitation-only signup
- Visual page builder using `@measured/puck`
- Turso database (libSQL/SQLite) with Drizzle ORM
- Partial internationalization via next-intl (public routes only)
- Next.js 16 App Router with React 19
- Shadcn UI for component library

**Tech Stack**: Next.js 16.1.1, React 19.2.3, Turso, Drizzle ORM, Arctic (OAuth), next-intl, Tailwind CSS v4, TypeScript (strict mode)

## Critical Architecture Patterns

### Authentication Flow (Invitation-Based)

**This is the core authentication pattern - understand it before making auth changes:**

1. **GitHub OAuth Initiation**: `GET /api/login/github` → redirects to GitHub
2. **OAuth Callback**: `GET /api/login/github/callback` → creates/updates user, creates session
3. **Invitation Check**: If `user.invitationAcceptedAt === null` → redirect to `/signup`
4. **Code Submission**: `POST` via `submitInvitation` action → validates code, marks invitation used, accepts user invitation
5. **Access Granted**: User can now access protected routes

**Key Files**:
- `lib/oauth.ts` - GitHub OAuth client configuration (Arctic)
- `lib/session.ts` - Session management using Oslo crypto (Base32 tokens, SHA256 hashing)
- `lib/users.ts` - User CRUD operations
- `lib/invitation.ts` - Invitation code generation, validation, usage tracking
- `lib/route-guard.ts` - `requireAuth()` for protecting server routes
- `app/api/login/github/route.ts` - OAuth initiation
- `app/api/login/github/callback/route.ts` - OAuth callback handler
- `app/actions.ts` - `submitInvitation`, `loginWithGitHub`, `logout`, `checkInvitationStatus`

**Session Management**:
- Uses Oslo crypto for secure token generation (Base32 encoded, 20 random bytes)
- Session tokens stored in HttpOnly cookies
- Sessions auto-extend if within 45 minutes of expiration
- Session IDs are SHA256 hashes of tokens (not stored directly)

### Route Protection Pattern

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

### Internationalization Architecture

**Critical**: This app uses **partial i18n** - admin routes are NOT internationalized.

**URL Structure**:
- `/en/*`, `/fa/*` - Internationalized public routes
- `/admin/*` - English-only, NO locale prefix
- `/api/*` - No i18n processing

**Implementation**:
- `proxy.ts` - Next-intl middleware with matcher that **excludes** `/admin`, `/api`, `/trpc`
- `i18n/routing.ts` - Locale configuration (en, fa)
- `i18n/request.ts` - Message loading from `messages/{locale}.json`
- `app/[locale]/layout.tsx` - Locale validation and provider setup
- `app/page.tsx` - Root redirect to default locale

**When adding routes**:
- Public/bilingual → Add to `app/[locale]/`
- Admin-only → Add to `app/admin/` (no locale segment)
- API → Add to `app/api/`

### Database Schema & Migrations

**Schema**: `db/schema.ts` - Drizzle ORM schema with relations
**Client**: `lib/db.ts` - Turso client singleton
**Config**: `drizzle.config.ts` - Points to schema and credentials

**Key Tables**:
- `users` - GitHub ID, username, invitationAcceptedAt timestamp
- `sessions` - Session tokens with expiration
- `invitations` - Codes, creator, expiration, usage tracking
- `pages` - Page hierarchy with parent-child relationships
- `page_translations` - Bilingual content for pages

**Migration Workflow**:
```bash
pnpm db:generate  # Generate migration from schema changes
pnpm db:migrate   # Apply migrations to database
pnpm db:studio    # Open Drizzle Studio for visual inspection
```

**Important**: Always run `pnpm db:generate` after modifying `db/schema.ts`. Migration files are auto-generated in `migrations/`.

## Server Actions & Forms Pattern

**CRITICAL**: All server actions MUST use React 19's `useActionState` hook for form handling.

### Server Action Definition

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

### Client Component Form Pattern

**CRITICAL**: Always use `useActionState` from `react`, NOT `useFormState` from `react-dom`.

```typescript
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
        <CardDescription>Brief description</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Field with error */}
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
            {state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Form-level error */}
          {state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Form with Custom Data Submission**:
```typescript
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"

type FormState = {
  errors?: {
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

export function CustomDataForm() {
  const [state, formAction] = useActionState(someAction, initialState)

  const handleSubmit = (formData: FormData) => {
    // Add custom data to form before submitting
    formData.append('customField', JSON.stringify(customData))
    return formAction(formData)
  }

  return (
    <form action={handleSubmit}>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

**Key Requirements**:
1. Import `useActionState` from `"react"` (NOT `react-dom`)
2. Server action must accept `(prevState, formData)` as parameters
3. Always type the FormState interface
4. Use type-safe error checking: `'field' in state.errors && Array.isArray(state.errors.field)`
5. Use semantic color tokens: `text-destructive`, `bg-destructive/10`, `border-destructive/20`
6. **CRITICAL**: Never call `formAction()` directly in onClick - pass it to form's `action` prop or use wrapper function that returns `formAction(formData)`

## UI Design System

**CRITICAL**: This project uses a **dual design system** approach:
- **Admin Area** (`/admin/*`): Uses `@measured/puck` components and styling
- **Guest/Public Area** (`/app/[locale]/*`): Uses Shadcn UI components

### Core Principles (Both Systems)

1. **NEVER use inline styles** - Always use Tailwind utility classes
2. **Use semantic color tokens** - `bg-primary`, `text-destructive`, not hardcoded colors
3. **Always include dark mode support** - Add `dark:` variants for all colors
4. **Use the `cn()` helper** - For conditional class merging from `@/lib/utils`

### Admin Area - Puck Components

**Location**: All files in `app/admin/` directory

**Component Library**: `@measured/puck`
- Import directly from `@measured/puck`
- Uses Puck's design system for consistency with the page editor

**Available Puck Components**:
- **Button** - Primary and secondary variants with loading states
- **IconButton** - Icon-only buttons with tooltip support
- **ActionBar** - Action bar with Action, Label, and Group sub-components
- **Drawer** - Collapsible drawer with Item sub-component
- **DropZone** - Drop zone for drag-and-drop content
- **FieldLabel** - Labels for form fields with optional icons
- **AutoField** - Auto-rendering field component

**Standard Pattern**:
```tsx
import { Button } from "@measured/puck"

export function AdminPage() {
  return (
    <div className="admin-container">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  )
}
```

**When to use Puck components in admin**:
- ✅ All admin pages, forms, and UI elements
- ✅ Admin dashboard, page management, settings
- ✅ Any UI within `/admin/*` routes
- ✅ Use Button for all actions (primary, secondary, icon buttons)
- ✅ Use ActionBar for action bars with multiple actions
- ✅ Use Drawer for collapsible sections

**Note**: Puck does NOT export Input, Label, or Card components. For form inputs and cards in admin area, create custom components using Tailwind classes or use Shadcn components if needed.

### Guest/Public Area - Shadcn UI

**Location**: All files in `app/[locale]/` directory

**Component Library**: Shadcn UI
- Located in `components/ui/`
- Pre-built accessible components with Radix UI primitives
- Examples: `Button`, `Card`, `Input`, `Label`, `Badge`, `Checkbox`

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

**When to use Shadcn components**:
- ✅ Public pages (`/app/[locale]/page.tsx`)
- ✅ Login/signup forms
- ✅ Guest-facing UI
- ✅ Any UI outside `/admin/*` routes

**Adding New Shadcn Components**:
```bash
npx shadcn@latest add [component-name]
```

### Common UI Patterns (Both Systems)

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

**Checkbox Pattern**:
```tsx
<div className="flex items-center gap-2">
  <Checkbox id="agree" name="agree" />
  <Label htmlFor="agree" className="cursor-pointer">I agree</Label>
</div>
```

### Layout Patterns

**Centered Form**:
```tsx
<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
  <div className="w-full max-w-lg">
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form content */}
      </CardContent>
    </Card>
  </div>
</div>
```

**For detailed patterns, forms, layouts, and examples, see `docs/UI_GUIDELINES.md`**

## Common Pitfalls

1. **useActionState with onClick**: Never call `formAction()` directly in onClick handlers. Always pass it to form's `action` prop or use `type="submit"` button
2. **useFormState vs useActionState**: Always use `useActionState` from `"react"`, not `useFormState` from `"react-dom"`
3. **Route Handler Naming**: Using `router.ts` instead of `route.ts` causes 404s
4. **i18n Matcher**: Forgetting to exclude admin routes from i18n middleware causes locale prefix issues
5. **Session Validation**: Always use `getCurrentSession()` from `lib/session.ts`, not direct cookie access
6. **Invitation Flow**: Users created via GitHub OAuth have `invitationAcceptedAt = null` initially
7. **Database Migrations**: Schema changes don't apply until you run `pnpm db:generate && pnpm db:migrate`
8. **Type Imports**: Use `import type { }` for type-only imports to avoid bundling issues
9. **Inline Styles**: Never use inline styles - always use Tailwind classes
10. **Missing Dark Mode**: Always add `dark:` variants for colors
11. **Wrong Component Library**: Using Shadcn in admin or Puck in public areas - stick to the dual design system

## Key Files Reference

**Authentication**:
- `lib/oauth.ts` - OAuth client configuration
- `lib/session.ts` - Session token generation, validation, cookie management
- `lib/users.ts` - User CRUD operations
- `lib/invitation.ts` - Invitation code logic
- `lib/route-guard.ts` - Auth guards for routes

**Database**:
- `db/schema.ts` - Drizzle schema definitions
- `lib/db.ts` - Database client
- `drizzle.config.ts` - Migration configuration

**Routing**:
- `proxy.ts` - i18n middleware (excludes admin/api)
- `i18n/routing.ts` - Locale configuration
- `i18n/request.ts` - Message loading

**Actions**:
- `app/actions.ts` - Server actions (submitInvitation, loginWithGitHub, logout, createPageAction)

**Documentation**:
- `docs/UI_GUIDELINES.md` - **Comprehensive UI patterns, styling conventions, and design system standards**
- `docs/SERVER_ACTIONS_GUIDE.md` - Server action patterns
- `docs/INVITATION_SYSTEM.md` - Complete auth flow documentation
- `DATABASE_SETUP.md` - Database documentation

## Development Workflows

**Database Operations**:
```bash
pnpm db:generate  # Generate migration from schema changes
pnpm db:migrate   # Apply migrations to database
pnpm db:studio    # Open Drizzle Studio
pnpm create-invitation  # Create invitation code
```

**Development Server**:
```bash
pnpm dev      # Start Next.js dev server on port 3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

**Environment Variables** (in `.env.local`):
```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback
```

## Testing Authentication Flow

1. Create invitation: `pnpm create-invitation`
2. Visit `/login` (redirects to `/en/login`)
3. Click "Login with GitHub"
4. Complete GitHub OAuth
5. Should redirect to `/signup` (new user)
6. Enter invitation code
7. Should redirect to `/admin`
