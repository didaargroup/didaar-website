# Authentication & Authorization

This folder contains documentation for the Pucked authentication and authorization system.

## Overview

Pucked uses an **invitation-based GitHub OAuth authentication system**:

1. Users authenticate with GitHub OAuth
2. New users must enter a valid invitation code
3. Once accepted, users have full access to the application

## Documentation

### [invitation-system.md](./invitation-system.md)
Complete guide to the invitation-based authentication flow, including:

- GitHub OAuth setup and configuration
- Invitation code generation and validation
- User registration flow
- Session management
- Route protection patterns
- Security considerations

**Read this when:**
- Setting up authentication for the first time
- Creating invitation codes
- Troubleshooting auth issues
- Understanding how users sign up

## Key Files

| File | Purpose |
|------|---------|
| `lib/oauth.ts` | GitHub OAuth client configuration (Arctic) |
| `lib/session.ts` | Session management (Oslo crypto) |
| `lib/users.ts` | User CRUD operations |
| `lib/invitation.ts` | Invitation code logic |
| `lib/route-guard.ts` | Auth guards for routes |
| `app/api/login/github/route.ts` | OAuth initiation |
| `app/api/login/github/callback/route.ts` | OAuth callback handler |
| `app/actions.ts` | `submitInvitation`, `loginWithGitHub`, `logout` |

## Authentication Flow

```
User visits /login
    ↓
Click "Login with GitHub"
    ↓
GitHub OAuth authentication
    ↓
Callback: /api/login/github/callback
    ↓
User created/retrieved in database
    ↓
Session created
    ↓
Check if invitation accepted
    ↓
├─ No → Redirect to /signup
│         ↓
│      Enter invitation code
│         ↓
│      Invitation validated
│         ↓
│      User marked as accepted
│         ↓
│      Redirect to /admin
│
└─ Yes → Redirect to /admin
```

## Quick Reference

### Creating an Invitation Code

```bash
pnpm create-invitation
```

This generates a code and saves it to the database.

### Protecting a Server Route

```tsx
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user } = await requireAuth({ requireInvitation: true });
  // User is authenticated and has accepted invitation
  return <div>Welcome {user.username}</div>;
}
```

### Protecting a Server Action

```tsx
"use server";
import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth();
  // Perform action with authenticated user
}
```

### Protecting a Client Component

```tsx
"use client";
import { AuthGuard } from "@/components/auth-guard";

export function ClientComponent() {
  return (
    <AuthGuard requireInvitation>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

## Security Features

- **GitHub OAuth**: Secure, industry-standard authentication
- **Invitation-Only**: Prevents unauthorized signups
- **Session Tokens**: Secure token generation using Oslo crypto
- **HttpOnly Cookies**: Prevents XSS attacks
- **CSRF Protection**: Built-in token validation
- **Auto-Expiration**: Sessions expire after 30 days

## Environment Variables

Required for authentication:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback

# Database (for user/session storage)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## Related Documentation

- **[Server Actions Guide](../server-actions/nextjs-server-actions.md)** - Form handling patterns
- **[UI Guidelines](../UI_GUIDELINES.md)** - Login form UI patterns
- **[DATABASE_SETUP.md](../../DATABASE_SETUP.md)** - Database schema

## Troubleshooting

### "Invalid invitation code"

**Cause:** Code doesn't exist, already used, or expired

**Solution:** 
- Generate a new code with `pnpm create-invitation`
- Check the `invitations` table in the database
- Verify the code hasn't expired

### "Session expired"

**Cause:** Session token expired (30 days)

**Solution:** User needs to log in again with GitHub

### Redirect loop on /signup

**Cause:** User already accepted invitation but still being redirected

**Solution:** Check `user.invitationAcceptedAt` in database

---

**Need help?** See [invitation-system.md](./invitation-system.md) for complete documentation.
