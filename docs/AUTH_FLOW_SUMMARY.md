# Authentication Flow Summary

## Protected Routes Pattern

### Server Component Authentication Check

For pages that require authentication, use the following pattern:

```typescript
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ProtectedPage({ params }: Props) {
  const { session } = await getCurrentSession()
  const { locale } = await params

  if (!session) {
    redirect(`/${locale}/login`)
  }

  // Page content here
  return <div>Protected content</div>
}
```

### Using `requireAuth()` Helper

For more advanced checks (including invitation verification), use the `requireAuth()` helper:

```typescript
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user } = await requireAuth({ requireInvitation: true });
  // Redirects to /login if not authenticated
  // Redirects to /signup if authenticated but invitation not accepted
  return <div>Welcome {user.username}</div>;
}
```

## Current Route Protection Status

### ✅ Protected Routes

1. **`/admin`** - Admin dashboard
   - File: `app/admin/layout.tsx`
   - Protection: `requireAuth({ requireInvitation: true })`
   - Redirects to `/login` if not authenticated
   - Redirects to `/signup` if invitation not accepted

2. **`/[locale]/invitation/validate`** - Invitation code entry
   - File: `app/[locale]/invitation/validate/page.tsx`
   - Protection: `getCurrentSession()` check
   - Redirects to `/{locale}/login` if not authenticated
   - Shows invitation form if authenticated

### 🔓 Public Routes

1. **`/[locale]/login`** - Login page
   - No authentication required
   - Publicly accessible

2. **`/`** - Root redirect
   - Redirects to default locale

3. **`/[locale]`** - Localized home page
   - Publicly accessible

## Authentication Flow

### 1. User visits protected route without session
```
User → /admin → Check session → No session → Redirect to /login
```

### 2. User visits invitation validation without session
```
User → /en/invitation/validate → Check session → No session → Redirect to /en/login
```

### 3. User logs in with GitHub
```
User → /en/login → Click "Login with GitHub" → GitHub OAuth → Callback → Create session → Check invitation status
```

### 4. Invitation flow
```
New user → GitHub OAuth → Create user (invitationAcceptedAt: null) → Redirect to /en/invitation/validate → Enter code → Mark invitation used → Redirect to /admin
```

## Key Functions

### `getCurrentSession()`
**Location**: `lib/session.ts`

Returns the current session and user from cookies.

```typescript
const { session, user } = await getCurrentSession()
```

**Returns**:
- `session` - Session object or `null`
- `user` - User object or `null`

### `requireAuth(options)`
**Location**: `lib/route-guard.ts`

Protects server routes and redirects if authentication fails.

```typescript
const { user } = await requireAuth({ requireInvitation: true })
```

**Options**:
- `requireInvitation` - If `true`, also checks if user has accepted invitation

**Redirects**:
- No session → `/login`
- No invitation → `/signup` (or `/{locale}/invitation/validate`)

## Best Practices

### 1. Always Use Server-Side Checks

```typescript
// ✅ GOOD - Server component check
export default async function Page() {
  const { session } = await getCurrentSession()
  if (!session) redirect("/login")
  return <div>Protected</div>
}
```

### 2. Use Localized Redirects

For routes under `[locale]`, always include the locale in redirects:

```typescript
// ✅ GOOD - Localized redirect
if (!session) {
  redirect(`/${locale}/login`)
}

// ❌ BAD - Non-localized redirect
if (!session) {
  redirect("/login")
}
```

### 3. Check Invitation Status When Needed

```typescript
// For admin routes that require accepted invitation
const { user } = await requireAuth({ requireInvitation: true })

// For routes that just need authentication
const { user } = await requireAuth()
```

### 4. Use Proper TypeScript Types

```typescript
type Props = {
  params: Promise<{locale: string}>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params
  // ...
}
```

## Common Patterns

### Pattern 1: Simple Auth Check
```typescript
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await getCurrentSession()
  if (!session) redirect("/login")

  return <div>Content</div>
}
```

### Pattern 2: Auth Check with Locale
```typescript
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Page({ params }: Props) {
  const { session } = await getCurrentSession()
  const { locale } = await params

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return <div>Content</div>
}
```

### Pattern 3: Auth + Invitation Check
```typescript
import { requireAuth } from "@/lib/route-guard";

export default async function Page() {
  const { user } = await requireAuth({ requireInvitation: true })

  return <div>Welcome {user.username}</div>
}
```

### Pattern 4: Server Action Protection
```typescript
"use server";

import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth()
  // Perform action with authenticated user
}
```

## Testing Authentication

### Test 1: Unauthenticated Access
1. Open browser in incognito mode
2. Visit `/admin`
3. Should redirect to `/login`

### Test 2: Authenticated Without Invitation
1. Create new user via GitHub OAuth
2. Visit `/admin`
3. Should redirect to `/en/invitation/validate`

### Test 3: Authenticated With Invitation
1. Complete invitation flow
2. Visit `/admin`
3. Should see admin dashboard

### Test 4: Localized Redirects
1. Visit `/en/invitation/validate` without session
2. Should redirect to `/en/login` (not `/login`)

## Security Considerations

1. **Always check authentication on the server** - Client-side checks can be bypassed
2. **Use HttpOnly cookies** - Session tokens are stored in HttpOnly cookies
3. **Validate sessions on every request** - Sessions are checked on each protected route
4. **Use secure redirects** - Always use the `redirect()` function from `next/navigation`
5. **Never expose sensitive data** - Only return necessary user data to the client

## Related Files

- `lib/session.ts` - Session management
- `lib/route-guard.ts` - Route protection helpers
- `lib/oauth.ts` - OAuth configuration
- `lib/users.ts` - User CRUD operations
- `lib/invitation.ts` - Invitation logic
- `app/actions.ts` - Server actions (login, logout, submit invitation)
- `app/api/login/github/callback/route.ts` - OAuth callback handler
