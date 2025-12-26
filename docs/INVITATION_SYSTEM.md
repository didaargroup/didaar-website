# Invitation System Documentation

This document describes the invitation-based signup system that integrates with GitHub OAuth authentication.

## Overview

The application uses an invitation-only registration system:
1. Users authenticate with GitHub OAuth
2. New users must enter a valid invitation code to complete registration
3. Once accepted, users have full access to the application

## Authentication Flow

```
┌─────────────┐
│ User visits │
│   /login    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Click "Login    │
│ with GitHub"    │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│ GitHub OAuth        │
│ Authentication      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Callback: /api/login/github │
│ /callback                   │
└──────┬──────────────────────┘
       │
       ├─────────────────┬──────────────────────┐
       │                 │                      │
       ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────┐    ┌──────────────┐
│ New User     │  │ Existing     │    │ Error        │
│ Created      │  │ User Found   │    │ (Invalid     │
│              │  │              │    │  Code)       │
└──────┬───────┘  └──────┬───────┘    └──────────────┘
       │                 │
       │                 │
       ▼                 ▼
┌─────────────────────────────────────┐
│ Session Created                     │
│ Cookie Set                          │
└──────┬──────────────────────────────┘
       │
       ├─────────────────┬──────────────────────┐
       │                 │                      │
       ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────┐    ┌──────────────┐
│ Invitation   │  │ Invitation   │    │ Redirect to  │
│ Not Accepted │  │ Already      │    │ /admin       │
│              │  │ Accepted     │    │              │
└──────┬───────┘  └──────┬───────┘    └──────────────┘
       │                 │
       │                 │
       ▼                 │
┌──────────────┐         │
│ Redirect to  │         │
│ /signup      │         │
└──────────────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ User enters  │         │
│ invitation   │         │
│ code         │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ Code         │         │
│ validated    │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ Invitation   │         │
│ marked used  │         │
└──────┬───────┘         │
       │                 │
       ▼                 │
┌──────────────┐         │
│ User         │         │
│ invitation   │         │
│ accepted     │         │
└──────┬───────┘         │
       │                 │
       └─────────────────┴──────────────────────┐
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │ Redirect to  │
                                         │ /admin       │
                                         └──────────────┘
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  github_id INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL,
  invitation_accepted_at INTEGER,  -- NULL if not yet accepted
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### Invitations Table
```sql
CREATE TABLE invitations (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,        -- Format: XXXX-XXXX-XXXX
  created_by INTEGER NOT NULL,      -- User ID who created it
  expires_at INTEGER NOT NULL,      -- Unix timestamp
  used_by INTEGER,                  -- User ID who used it (NULL if unused)
  used_at INTEGER,                  -- Unix timestamp
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);
```

## API Endpoints

### GitHub OAuth Login
- **Route**: `GET /api/login/github`
- **Description**: Initiates GitHub OAuth flow
- **Response**: Redirects to GitHub

### GitHub OAuth Callback
- **Route**: `GET /api/login/github/callback`
- **Query Params**: `code`, `state`
- **Description**: Handles GitHub OAuth callback
- **Behavior**:
  - Creates new user if doesn't exist
  - Creates session and sets cookie
  - Redirects to `/signup` if invitation not accepted
  - Redirects to `/admin` if invitation accepted

### Submit Invitation Code
- **Route**: `POST /api/actions` (via `submitInvitation` action)
- **Form Data**: `code` (invitation code)
- **Description**: Validates and accepts invitation code
- **Behavior**:
  - Validates code format (XXXX-XXXX-XXXX)
  - Checks if code exists, is unused, and not expired
  - Marks invitation as used
  - Marks user's invitation as accepted
  - Redirects to `/admin` on success

## Server Actions

### `loginWithGitHub()`
Initiates GitHub OAuth flow by generating state and redirecting to GitHub.

### `submitInvitation(prevState, formData)`
Processes invitation code submission:
- Validates user is authenticated
- Validates code format
- Checks invitation validity
- Marks invitation as used
- Accepts invitation for user
- Redirects to admin on success

### `logout()`
Invalidates session and redirects to login.

### `checkInvitationStatus()`
Returns current user's invitation status.

## Utility Functions

### `lib/route-guard.ts`

#### `requireAuth(options)`
Server-side auth guard for protected routes.
```typescript
const { user, session } = await requireAuth({ 
  requireInvitation: true,
  redirectTo: "/login" 
});
```

#### `checkAuth()`
Check authentication status without redirecting.
```typescript
const { isAuthenticated, user, needsInvitation } = await checkAuth();
```

### `lib/invitation.ts`

#### `generateInvitationCode()`
Generates a random 12-character hex code formatted as XXXX-XXXX-XXXX.

#### `createInvitation(code, createdBy, expiresAt)`
Creates a new invitation in the database.

#### `getInvitationByCode(code)`
Retrieves invitation by code (case-insensitive).

#### `isInvitationValid(invitation)`
Checks if invitation is valid (not used, not expired).

#### `getInvitationStatus(invitation)`
Returns detailed status with reason if invalid.

#### `formatInvitationCode(code)`
Formats code as XXXX-XXXX-XXXX.

#### `useInvitation(code, userId)`
Marks invitation as used by a user.

### `lib/users.ts`

#### `getUserFromGitHubId(githubUserId)`
Retrieves user by GitHub ID.

#### `createUserFromGitHubId(githubUserId, username)`
Creates new user from GitHub credentials.

#### `acceptInvitationForUser(userId)`
Marks user's invitation as accepted.

#### `userNeedsInvitation(user)`
Checks if user needs to accept invitation.

## Creating Invitations

Use the provided script to create invitations:

```bash
pnpm run create-invitation
```

Or programmatically:

```typescript
import { generateInvitationCode, createInvitation } from "@/lib/invitation";

const code = generateInvitationCode(); // e.g., "A1B2-C3D4-E5F6"
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

await createInvitation(code, adminUserId, expiresAt);
```

## Client Components

### `AuthGuard`
Wrapper component to protect client components:
```tsx
import { AuthGuard } from "@/components/auth-guard";

export default function ProtectedPage() {
  return (
    <AuthGuard requireInvitation={true}>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### `withAuth` HOC
Higher-order component for protecting pages:
```tsx
import { withAuth } from "@/components/auth-guard";

function Dashboard() {
  return <div>Protected content</div>;
}

export default withAuth(Dashboard, { requireInvitation: true });
```

## Route Protection Examples

### Server Component (Recommended)
```tsx
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user } = await requireAuth({ requireInvitation: true });
  
  return <div>Welcome, {user.username}!</div>;
}
```

### Server Action
```typescript
"use server";

import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth();
  
  // Perform action with authenticated user
}
```

## Error Handling

The invitation system provides clear error messages:

- "Invitation code is required" - Empty code submitted
- "Invalid code format. Expected format: XXXX-XXXX-XXXX" - Wrong format
- "Invitation code not found" - Code doesn't exist in database
- "This invitation code has already been used" - Code already redeemed
- "This invitation code has expired" - Code past expiration date
- "You have already accepted an invitation" - User already completed signup
- "You must be logged in to submit an invitation code" - No active session

## Security Features

1. **GitHub OAuth**: Secure authentication via GitHub
2. **State Parameter**: CSRF protection during OAuth flow
3. **HttpOnly Cookies**: Session tokens not accessible via JavaScript
4. **Secure Flag**: Cookies only sent over HTTPS in production
5. **SameSite Protection**: Prevents CSRF attacks
6. **One-time Use**: Each invitation code can only be used once
7. **Expiration**: Invitation codes expire after set time
8. **Case Insensitive**: Codes work regardless of case input

## Best Practices

1. **Always use `requireAuth()`** in server components for protected routes
2. **Set appropriate expiration times** for invitations (e.g., 30 days)
3. **Monitor invitation usage** to detect abuse
4. **Use strong random generation** for invitation codes
5. **Log invitation events** for audit trails
6. **Provide clear error messages** to users
7. **Test the full flow** from OAuth to invitation acceptance

## Troubleshooting

### User stuck on /signup after accepting invitation
- Check if `invitationAcceptedAt` is properly set in database
- Verify session cookie is being set correctly
- Check for redirect loops in route handlers

### Invitation code shows as invalid
- Verify code format (XXXX-XXXX-XXXX)
- Check if code exists in database
- Verify code hasn't been used already
- Check expiration date

### GitHub OAuth not working
- Verify GitHub OAuth app credentials
- Check callback URL configuration
- Verify state cookie is being set
- Check for CORS issues

## Future Enhancements

Potential improvements to consider:

1. **Email invitations**: Send codes via email
2. **Invitation quotas**: Limit how many codes a user can create
3. **Invitation tiers**: Different permission levels
4. **Batch creation**: Create multiple codes at once
5. **Revocation**: Invalidate unused invitations
6. **Analytics**: Track invitation usage patterns
7. **Custom expiration**: Different expiration per code
8. **Multi-provider**: Add Google, GitLab OAuth options
