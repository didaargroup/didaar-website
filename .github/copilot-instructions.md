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

**Migration Workflow**:
```bash
pnpm db:generate  # Generate migration from schema changes
pnpm db:migrate   # Apply migrations to database
pnpm db:studio    # Open Drizzle Studio for visual inspection
```

**Important**: Always run `pnpm db:generate` after modifying `db/schema.ts`. Migration files are auto-generated in `migrations/`.

### Server Actions Pattern

**Location**: `app/actions.ts` (centralized server actions)

**Standard Patterns** (see `docs/SERVER_ACTIONS_GUIDE.md`):
1. **FormActionResult** - For form submissions with error display
2. **ActionResult** - For API-like responses with success/error
3. **Void Actions** - For actions that always redirect

**Example**:
```typescript
"use server";

export async function submitInvitation(
  prevState: { error: string },
  formData: FormData
) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Must be logged in" };
  
  // Validate, process, redirect
  redirect("/admin");
}
```

**Usage in Client Components**:
```typescript
import { useActionState } from "react";
import { submitInvitation } from "@/app/actions";

const [state, formAction, isPending] = useActionState(submitInvitation, initialState);
```

## Essential Developer Workflows

### Database Operations

**Create migration after schema change**:
```bash
pnpm db:generate
```

**Apply migrations**:
```bash
pnpm db:migrate
```

**Create invitation code**:
```bash
pnpm create-invitation
# Runs scripts/create-invitation.ts
```

**Inspect database**:
```bash
pnpm db:studio
# Opens Drizzle Studio UI
```

### Development Server

```bash
pnpm dev      # Start Next.js dev server on port 3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Environment Variables

Required in `.env.local`:
```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback
```

## Project-Specific Conventions

### Import Aliases

**Path alias**: `@/*` maps to project root
```typescript
import { requireAuth } from "@/lib/route-guard";
import { db } from "@/db";
```

### Type Safety

**Infer types from schema**:
```typescript
import type { User, Session, Invitation } from "@/db/schema";
// Types are auto-generated via $inferSelect
```

**Session user typing**:
```typescript
userId: integer("user_id").$type<number>() // Explicit type annotation
```

### Styling & UI Guidelines

**CRITICAL**: All UI components MUST follow the established design system. See `docs/UI_GUIDELINES.md` for comprehensive UI patterns.

**Core Principles:**
1. **NEVER use inline styles** - Always use Tailwind utility classes
2. **Use semantic color tokens** - `bg-primary`, `text-destructive`, not hardcoded colors
3. **Always include dark mode support** - Add `dark:` variants for all colors
4. **Use the `cn()` helper** - For conditional class merging from `@/lib/utils`
5. **Use Shadcn UI components** - Don't recreate buttons, cards, inputs, etc.

**Quick Reference:**
```tsx
// ✅ GOOD - Using Tailwind utilities
<div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button variant="default">Submit</Button>
</div>

// ❌ BAD - Inline styles
<div style={{ padding: "2rem", backgroundColor: "#fff", borderRadius: "8px" }}>
  <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Title</h2>
  <button style={{ padding: "0.75rem", background: "#000" }}>Submit</button>
</div>
```

**Standard Patterns:**
- **Cards**: `bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6`
- **Buttons**: Use `<Button>` from `@/components/ui/button` with variants
- **Inputs**: `w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50`
- **Spacing**: Use Tailwind scale (4px base): `gap-4`, `p-6`, `space-y-4`
- **Text**: `text-sm`, `text-base`, `text-lg` with `font-medium`, `font-semibold`, `font-bold`
- **Colors**: Use semantic tokens - `bg-primary`, `text-muted-foreground`, `border-destructive`

**Component Library:**
- Shadcn UI components in `components/ui/`
- Add new components: `npx shadcn@latest add [component]`
- All components support dark mode via `dark:` variants

**For detailed patterns, forms, layouts, and examples, see `docs/UI_GUIDELINES.md`**

## Integration Points

### OAuth Providers

Currently uses GitHub via Arctic library. To add more providers:
1. Add provider client to `lib/oauth.ts`
2. Create callback route at `app/api/login/{provider}/callback/route.ts`
3. Add initiation route at `app/api/login/{provider}/route.ts`

### Puck Editor Integration

**Current**: Demo at `app/demo/editor.tsx`
**Planned**: Move to `/admin/editor/[pageId]` with JSON storage in database

**Key Points**:
- Puck data stored as JSON in database (planned: `pages.translations` field)
- Separate Puck configs for EN and FA content
- Save function needs implementation (currently placeholder)

## Common Pitfalls

1. **Route Handler Naming**: Using `router.ts` instead of `route.ts` causes 404s
2. **i18n Matcher**: Forgetting to exclude admin routes from i18n middleware causes locale prefix issues
3. **Session Validation**: Always use `getCurrentSession()` from `lib/session.ts`, not direct cookie access
4. **Invitation Flow**: Users created via GitHub OAuth have `invitationAcceptedAt = null` initially
5. **Database Migrations**: Schema changes don't apply until you run `pnpm db:generate && pnpm db:migrate`
6. **Type Imports**: Use `import type { }` for type-only imports to avoid bundling issues

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
- `app/actions.ts` - Server actions (submitInvitation, loginWithGitHub, logout)

**Documentation**:
- `CLAUDE.md` - Detailed project overview
- `DATABASE_SETUP.md` - Database documentation
- `docs/UI_GUIDELINES.md` - **Comprehensive UI patterns, styling conventions, and design system standards**
- `docs/INVITATION_SYSTEM.md` - Complete auth flow documentation
- `docs/SERVER_ACTIONS_GUIDE.md` - Server action patterns

## Testing Authentication Flow

1. Create invitation: `pnpm create-invitation`
2. Visit `/login` (redirects to `/en/login`)
3. Click "Login with GitHub"
4. Complete GitHub OAuth
5. Should redirect to `/signup` (new user)
6. Enter invitation code
7. Should redirect to `/admin`

## Future Architecture Notes

**Planned Features** (from Anytype spec):
- Page hierarchy with parent-child relationships
- Draft/publish logic (child pages can be published independently)
- Admin dashboard with page tree manager
- Bilingual Puck configs for EN/FA content

**When implementing**: Reference existing patterns in `lib/` for consistency.
