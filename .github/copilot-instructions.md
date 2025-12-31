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

**Tech Stack**: Next.js 16.1.1, React 19.2.3, Turso, Drizzle ORM, Arctic (OAuth), next-intl, Tailwind CSS v4, TypeScript (strict mode), Zod v4.2

**Documentation**:
- All documentation is now available in the admin area at `/content/docs`
- The docs are divided into two main groups: 
  - Development Docs - `/content/docs/dev/*`
  - User Docs - `/content/docs/user/*`

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

## Zod Validation Patterns
- Don't use deprecated `flatten()`. Instead, use Zod v4.2 for schema validation
- Use `z.flattenError()` for flat schemas (https://zod.dev/error-formatting)

## Server Actions & Forms Pattern

**CRITICAL**: All server actions MUST use React 19's `useActionState` hook for form handling.

### Server Action Definition

**Location**: `app/_actions/` (centralized server actions directory)

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

**📖 IMPORTANT**: For detailed information about using Puck components in the admin area, see the Puck Components Guide at `/admin/docs/dev/puck-components`. This guide includes:
- Complete API documentation for all Puck components (ActionBar, Button, Drawer, IconButton, etc.)
- Common patterns and usage examples
- Common pitfalls and how to avoid them
- Design system integration with Tailwind CSS

### Core Principles (Both Systems)

1. **NEVER use inline styles** - Always use Tailwind utility classes
2. **Use semantic color tokens** - `bg-primary`, `text-destructive`, not hardcoded colors
3. **Always include dark mode support** - Add `dark:` variants for all colors
4. **Use the `cn()` helper** - For conditional class merging from `@/lib/utils`

### Admin Area - Puck Components

**Location**: All files in `app/admin/` directory

**Component Library**: `@measured/puck` version 0.20.2
- Import directly from `@measured/puck`
- Uses Puck's design system for consistency with the page editor

**📖 See the Puck Components Guide at `/admin/docs/dev/puck-components` for complete documentation**

**Available Puck Components**:
- **ActionBar** - Action bar with label and action buttons
- **Button** - Primary and secondary button variants (supports href, onClick, icon, fullWidth, loading)
- **IconButton** - Icon-only buttons with tooltip support (requires title prop)
- **Drawer** - Collapsible drawer for navigation
- **DropZone** - Drop zone for drag-and-drop content
- **FieldLabel** - Labels for form fields with optional icons
- **AutoField** - Auto-rendering field component
- **Label** - Text label component

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

**When to use Puck components in admin**:
- ✅ All admin pages, forms, and UI elements
- ✅ Admin dashboard, page management, settings
- ✅ Any UI within `/admin/*` routes
- ✅ Use Button for all actions (primary, secondary, with icons, links)
- ✅ Use ActionBar for action bars with multiple actions
- ✅ Use IconButton for icon-only buttons (always provide title prop)
- ✅ Use Drawer for navigation menus

**Important Puck Component Constraints**:
- ❌ Button does NOT accept `className` prop - use `fullWidth` prop or wrapper div
- ❌ Button does NOT support `asChild` pattern - use `href` prop for links
- ❌ ActionBar uses `label` prop, NOT `ActionBar.Label` subcomponent
- ❌ Drawer.Item `label` expects string, NOT JSX - use plain links for custom navigation
- ❌ IconButton requires `title` prop for accessibility
- ❌ Puck component does NOT accept `isPublishing` prop

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

### Puck Page Builder Architecture

**CRITICAL**: Understanding the dual-layout architecture is essential for working with Puck pages.

**Architecture Overview**:
- **Guest Pages** (`/app/[locale]/[...path]/*`): Rendered content with full layout
- **Editor Preview** (`/admin/pages/[locale]/[slug]/edit`): Live preview during editing
- **Two Separate Layout Systems**: Guest pages use `GuestNavbar`/`GuestFooter`, editor uses `PreviewNavbar`/`PreviewFooter`

**Why Two Layouts?**
The guest navbar and footer components use `next-intl` hooks (`useLocale`, `useTranslations`) which require the `NextIntlClientProvider` context. The Puck editor runs at `/admin/pages/*` which is outside the `[locale]` route structure and doesn't have this provider. Therefore, we use simplified preview components in the editor.

**Key Files**:
- `puck.config.tsx` - Puck configuration with `root.render` function
- `components/puck-render.tsx` - Client component wrapper for Puck's Render component
- `components/locale-layout-client.tsx` - Guest page layout with navbar/footer
- `components/guest-navbar.tsx` - Public navbar with full i18n support
- `components/guest-footer.tsx` - Public footer with full i18n support
- `app/[locale]/[...path]/page.tsx` - Server Component that renders Puck pages

**Puck Config root.render Pattern**:
```tsx
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

**Critical Rules**:
1. **Render Mode**: Must return just `<>{children}</>` - NO wrapper div, NO layout
2. **Preview Mode**: Full layout with navbar, footer, prose styling
3. **Prose Classes Must Match**: Both layouts use identical prose classes for WYSIWYG
4. **Never Pass Functions to Client Components**: Use `components/puck-render.tsx` wrapper

**Prose Typography Classes** (must match exactly):
```tsx
// Used in both guest layout and editor preview
"prose md:prose-lg md:max-w-xl lg:max-w-2xl px-4 py-8 w-full"
```

**When Editing Puck Config**:
- ✅ Modify `PreviewNavbar`/`PreviewFooter` for editor preview changes
- ✅ Modify prose classes in BOTH places if changing typography
- ✅ Keep render mode minimal: `return <>{children}</>;`
- ❌ NEVER add layout wrapper in render mode
- ❌ NEVER use `next-intl` hooks in preview components
- ❌ NEVER pass functions from Server to Client Components

**Guest Page Rendering Flow**:
1. Server Component (`app/[locale]/[...path]/page.tsx`) fetches page data
2. Dynamic import loads `components/puck-render.tsx` (client component)
3. Client component calls `getConfig(locale)` and renders with `@measured/puck`'s Render component
4. Next.js layout (`locale-layout-client.tsx`) wraps with navbar/footer
5. Puck config's `root.render` returns just children (no wrapper)

**Editor Preview Flow**:
1. Editor page (`/admin/pages/[locale]/[slug]/edit`) loads Puck editor
2. Puck config called with `isPreview=true`
3. `root.render` returns full layout with PreviewNavbar/PreviewFooter
4. No Next.js layout wrapper in editor context

**Visual Unification**:
While the code is not truly unified (different components), the visual appearance is unified through:
- Identical prose typography classes
- Matching layout structure (navbar, main, footer)
- Same spacing and styling tokens
- Consistent RTL support

**Future Unification Options**:
If true code unification is needed, consider:
1. Add `NextIntlClientProvider` to admin routes (complex)
2. Create context-free versions of GuestNavbar/Footer (moderate)
3. Accept current dual-layout with visual unification (recommended)

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

**For detailed patterns, forms, layouts, and examples, see the UI Guidelines at `/admin/docs/dev/ui-guidelines`**

## Type System & Organization

**CRITICAL**: All shared types are centralized in the `types/` directory to prevent circular dependencies and improve maintainability.

### Type Organization Structure

```
types/
├── index.ts           # Central export point - import from here!
├── database.ts        # Database & domain types (PageTreeNode, PageTranslationStatus)
├── navigation.ts      # Navigation & routing types (MenuItem, TreeItem, FlattenedItem)
├── components.ts      # React component prop types (ImageBlockProps, AdminSidebarRightProps)
├── puck.ts           # Puck page builder types (PuckData, ComponentProps, RootProps)
├── site-settings.ts  # Site settings types (SiteSettings, SiteSettingValue)
└── env.d.ts          # Environment variable types (ProcessEnv)
```

### Type Import Patterns

**✅ RECOMMENDED** - Import from central index:
```typescript
import type { SiteSettings, MenuItem, PageTreeNode, PuckData } from "@/types"
```

**✅ ALTERNATIVE** - Import from specific module (better tree-shaking):
```typescript
import type { SiteSettings } from "@/types/site-settings"
import type { PageTreeNode } from "@/types/database"
```

**❌ AVOID** - Importing from implementation files:
```typescript
// Don't do this anymore!
import type { SiteSettings } from "@/lib/site-settings"
import type { MenuItem } from "@/lib/page-tree"
import type { PageTreeNode } from "@/lib/page"
```

### Type Categories

**Database Types** (`types/database.ts`):
- `PageTranslationStatus` - Status of a page translation (published, has content)
- `PageTreeNode` - Hierarchical page structure with translations
- Re-exports Drizzle types: `User`, `Session`, `Invitation`, `Page`, `PageTranslation`, `SiteSetting`

**Navigation Types** (`types/navigation.ts`):
- `MenuItem` - Navigation menu item with children
- `TreeItem` - Generic tree structure for drag-and-drop
- `FlattenedItem` - Flattened tree for list rendering

**Component Types** (`types/components.ts`):
- `AdminSidebarRightProps` - Admin right sidebar panel
- `ImageBlockProps` - Image block component
- `TreeItemProps` - Tree item component props
- `SortableTreeProps` - Sortable tree component

**Puck Types** (`types/puck.ts`):
- `ComponentProps` - Props for each Puck component type
- `RootProps` - Root page configuration
- `PuckData` - Complete Puck page data structure
- `TypedComponentData` - Helper for component-specific data

**Site Settings Types** (`types/site-settings.ts`):
- `SiteSettingValue` - Union type of all possible setting values
- `SiteSettings` - Complete settings object structure
- `SiteSettingKey` - Known setting keys

### Critical Rules

1. **No Circular Dependencies**: The `types/` folder must NEVER import from `lib/`, `components/`, or `app/`
2. **Allowed Imports**: Types can only import from `db/schema.ts` (Drizzle types) and external packages
3. **Single Source of Truth**: Each type must be defined in only one place
4. **Type-Only Imports**: Always use `import type { }` for type imports to enable better tree-shaking
5. **Schema Types**: Database schema types are re-exported from `types/database.ts` for convenience

### When Adding New Types

1. **Choose the right file** based on the category (database, navigation, components, puck, settings)
2. **Define the type** with proper JSDoc comments
3. **Export from index** - Add to `types/index.ts` if it's commonly used
4. **Update imports** - Update any files that were using the old location
5. **Never define types in**:
   - Component files (move to `types/components.ts`)
   - Library files in `lib/` (move to appropriate `types/*.ts`)
   - Server actions or route handlers (move to `types/*.ts`)

### Database Schema Type Pattern

When using Drizzle's `mode: "json"` for JSON columns:
```typescript
// In db/schema.ts
import type { SiteSettingValue } from "@/types/site-settings"

export const siteSettings = sqliteTable("site_settings", {
  value: text("value", { mode: "json" }).notNull().$type<SiteSettingValue>(),
})
```

This provides type safety for JSON columns while letting Drizzle handle serialization automatically.

### Migration Examples

**Before** (scattered types):
```typescript
import type { SiteSettings } from "@/lib/site-settings"
import type { MenuItem } from "@/lib/page-tree"
import type { PageTreeNode } from "@/lib/page"
import type { ImageBlockProps } from "@/components/blocks/image-block"
```

**After** (centralized):
```typescript
import type {
  SiteSettings,
  MenuItem,
  PageTreeNode,
  ImageBlockProps
} from "@/types"
```

**See Also**: `types/README.md` for complete documentation and `TYPES_ORGANIZATION.md` for migration guide.

## Common Pitfalls

1. **useActionState with onClick**: Never call `formAction()` directly in onClick handlers. Always pass it to form's `action` prop or use `type="submit"` button
2. **useFormState vs useActionState**: Always use `useActionState` from `"react"`, not `useFormState` from `"react-dom"`
3. **Route Handler Naming**: Using `router.ts` instead of `route.ts` causes 404s
4. **i18n Matcher**: Forgetting to exclude admin routes from i18n middleware causes locale prefix issues
5. **Session Validation**: Always use `getCurrentSession()` from `lib/session.ts`, not direct cookie access
6. **Invitation Flow**: Users created via GitHub OAuth have `invitationAcceptedAt = null` initially
7. **Database Migrations**: Schema changes don't apply until you run `pnpm db:generate && pnpm db:migrate`
8. **Type Imports**: Use `import type { }` for type-only imports to avoid bundling issues
9. **Type Location**: Always define types in the `types/` directory, never in component files or lib files. Import from `@/types` not from implementation files
10. **Circular Dependencies**: The `types/` folder must never import from `lib/`, `components/`, or `app/`. Only import from `db/schema.ts` and external packages
11. **Inline Styles**: Never use inline styles - always use Tailwind classes
12. **Missing Dark Mode**: Always add `dark:` variants for colors
13. **Wrong Component Library**: Using Shadcn in admin or Puck in public areas - stick to the dual design system
14. **Puck Layout Confusion**: The editor preview and guest pages use DIFFERENT layout components (Preview vs Guest). This is intentional - don't try to unify them without understanding the next-intl context limitation
15. **Modifying Puck root.render**: In render mode, always return just `<>{children}</>`. Never add layout wrappers - Next.js layout handles that
16. **Prose Class Mismatch**: If you change prose classes in guest layout, you MUST also update them in puck.config.tsx preview mode, or the editor won't match the published page

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

**Types**:
- `types/index.ts` - Central export point for all types
- `types/database.ts` - Database & domain types (PageTreeNode, PageTranslationStatus)
- `types/navigation.ts` - Navigation types (MenuItem, TreeItem, FlattenedItem)
- `types/components.ts` - Component prop types (ImageBlockProps, AdminSidebarRightProps)
- `types/puck.ts` - Puck page builder types (PuckData, ComponentProps, RootProps)
- `types/site-settings.ts` - Site settings types (SiteSettings, SiteSettingValue)
- `types/README.md` - Complete types documentation

**Routing**:
- `proxy.ts` - i18n middleware (excludes admin/api)
- `i18n/routing.ts` - Locale configuration
- `i18n/request.ts` - Message loading

**Puck Page Builder**:
- `puck.config.tsx` - Puck configuration with root.render function (dual-layout system)
- `components/puck-render.tsx` - Client component wrapper for Puck's Render component
- `components/locale-layout-client.tsx` - Guest page layout with navbar/footer
- `components/guest-navbar.tsx` - Public navbar with full i18n support
- `components/guest-footer.tsx` - Public footer with full i18n support
- `app/[locale]/[...path]/page.tsx` - Server Component that renders Puck pages

**Actions**:
- `app/actions.ts` - Server actions (submitInvitation, loginWithGitHub, logout, createPageAction)

**Documentation**:
- All documentation is now available in the admin area at `/admin/docs`
- Puck Components Guide at `/admin/docs/dev/puck-components` - **Comprehensive guide for using @measured/puck components in admin area**
- UI Guidelines at `/admin/docs/dev/ui-guidelines` - **Comprehensive UI patterns, styling conventions, and design system standards**
- Server Actions Guide at `/admin/docs/dev/server-actions` - Server action patterns
- Authentication System at `/admin/docs/dev/authentication` - Complete auth flow documentation
- Database Setup at `/admin/docs/dev/database-setup` - Database documentation

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

## Component & Form Organization

**CRITICAL**: Follow these rules when creating new components or forms.

### Naming Convention

**File Names**: Use **kebab-case** (e.g., `admin-header.tsx`)
**Component Names**: Use **PascalCase** (e.g., `AdminHeader`)

**Rationale**:
- ✅ Consistency with Shadcn UI
- ✅ Cross-platform safety (no case-sensitivity issues on Linux)
- ✅ URL-friendly
- ✅ Modern React/Next.js standard

**Example**:
```typescript
// File: components/admin/admin-header.tsx
"use client";

export function AdminHeader() {
  return <header>...</header>;
}

// Import:
import { AdminHeader } from "@/components/admin/admin-header";
```

**See Also**: `NAMING_CONVENTION_ANALYSIS.md` for detailed comparison.

### Decision Tree

```
Is it a form?
├─ Yes → Used in ONLY one route?
│   ├─ Yes → app/route/form.tsx
│   └─ No → components/feature/{feature}-form.tsx
└─ No → Reusable UI component?
    ├─ Yes → components/ (admin/, ui/, guest-*)
    └─ No → Layout/route wrapper?
        ├─ Yes → app/route-group/{purpose}-content.tsx
        └─ No → Context provider?
            ├─ Yes → contexts/{feature}-context.tsx
            └─ No → components/feature/{component}.tsx
```

### Location Rules

| Component Type | Location | File Name | Component Name | Example |
|----------------|----------|-----------|----------------|---------|
| Route-specific form | `app/route/form.tsx` | `form.tsx` | `{Route}Form` | `app/admin/pages/create/form.tsx` → `CreatePageForm` |
| Reusable form | `components/feature/` | `{feature}-form.tsx` | `{Feature}Form` | `components/admin/page-properties-form.tsx` → `PagePropertiesForm` |
| Route layout wrapper | `app/route-group/` | `{purpose}-content.tsx` | `{Purpose}Content` | `app/admin/dashboard-content.tsx` → `DashboardContent` |
| Reusable UI component | `components/` | `{component}.tsx` | `{Component}` | `components/admin/admin-header.tsx` → `AdminHeader` |
| Context provider | `contexts/` | `{feature}-context.tsx` | `{Feature}Provider` | `contexts/notification-context.tsx` → `NotificationProvider` |
| Puck block | `components/blocks/` | `{type}-block.tsx` | `{Type}Block` | `components/blocks/image-block.tsx` → `ImageBlock` |

### Key Principles

1. **Route-specific forms** → Co-locate with route in `app/route/form.tsx`
   - Used ONLY for one specific route
   - Tightly coupled to route logic
   - NOT reused elsewhere
   - Example: `app/admin/pages/create/form.tsx` → `CreatePageForm`

2. **Reusable forms** → `components/feature/`
   - Used in multiple routes or shared UI (sidebars, modals)
   - Independently testable
   - Generic, reusable purpose
   - Example: `components/admin/page-properties-form.tsx` → `PagePropertiesForm`

3. **Reusable UI components** → `components/`
   - Used in multiple places
   - Feature-agnostic or part of design system
   - Example: `components/admin/admin-header.tsx` → `AdminHeader`

4. **Layout wrappers** → `app/route-group/`
   - Define layout structure for route group
   - Wrap all pages in route group
   - Provide context for route group
   - Example: `app/admin/dashboard-content.tsx` → `DashboardContent`

5. **Context providers** → `contexts/`
   - Shared across multiple route groups
   - Not tightly coupled to one route
   - Example: `contexts/notification-context.tsx` → `NotificationProvider`

6. **Puck blocks** → `components/blocks/`
   - Page editor content blocks
   - Part of Puck page builder system
   - Example: `components/blocks/image-block.tsx` → `ImageBlock`

### Naming Conventions

| Type | File Name | Component Name |
|------|-----------|----------------|
| Form (route-specific) | `form.tsx` | `{Route}Form` |
| Form (reusable) | `{feature}-form.tsx` | `{Feature}Form` |
| Layout wrapper | `{purpose}-content.tsx` | `{Purpose}Content` |
| UI component | `{component}.tsx` | `{Component}` |
| Context | `{feature}-context.tsx` | `{Feature}Provider`, `use{Feature}` |
| Puck block | `{type}-block.tsx` | `{Type}Block` |

### Import Patterns

```typescript
// ✅ GOOD: Page importing co-located form
import { CreatePageForm } from "./form";

// ✅ GOOD: Page importing reusable component
import { AdminHeader } from "@/components/admin/admin-header";

// ✅ GOOD: Component importing server action
import { createPageAction } from "@/app/_actions";

// ❌ BAD: Component importing from app/ (unless actions)
import { Something } from "@/app/some-route/component";
```

### Common Patterns

**Route with Form**:
```typescript
// app/admin/pages/create/page.tsx
import { CreatePageForm } from "./form";

export default async function CreatePage() {
  return <CreatePageForm />;
}
```

```typescript
// app/admin/pages/create/form.tsx
"use client";

export function CreatePageForm() {
  // ...
}
```

**Reusable Component**:
```typescript
// components/admin/admin-header.tsx
"use client";

export function AdminHeader() {
  return <header>...</header>;
}
```

```typescript
// app/admin/layout.tsx
import { AdminHeader } from "@/components/admin/admin-header";
```

**See Also**: `COMPONENT_ORGANIZATION_ANALYSIS.md` for detailed analysis and `COMPONENT_ORGANIZATION_QUICK_REF.md` for quick reference.

## MCP

**Use Context MCP**: to receive the latest documentations of libraries and frameworks used in this project.