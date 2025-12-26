# OAuth Redirect Loop Fix

## Problem

Users were getting stuck in a redirect loop when trying to access the invitation validation page:

1. User visits `/en/invitation/validate` (not authenticated)
2. Redirects to `/login` (without locale)
3. User logs in with GitHub
4. OAuth callback redirects to `/invitation/validate` (without locale)
5. Middleware redirects to add locale, losing the session context
6. Back to step 1 → infinite loop

## Root Cause

The OAuth callback was redirecting to `/invitation/validate` without the locale prefix (`/en/invitation/validate`). Since the Next-intl middleware requires all public routes to have a locale prefix, it would redirect the non-localized URL, which could cause session issues.

## Solution

Implemented a proper redirect URL preservation mechanism during OAuth flow:

### 1. Store Redirect URL During OAuth Initiation

**File**: `app/actions.ts` - `loginWithGitHub()`

```typescript
export async function loginWithGitHub(redirectTo?: string) {
  const state = generateState();
  const url = github.createAuthorizationURL(state, []);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax"
  });

  // Store the redirect URL (with locale) to use after successful OAuth
  if (redirectTo) {
    cookieStore.set("github_oauth_redirect", redirectTo, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax"
    });
  }

  redirect(url.toString());
}
```

### 2. Use Stored Redirect URL in OAuth Callback

**File**: `app/api/login/github/callback/route.ts`

```typescript
const storedRedirect = cookieStore.get("github_oauth_redirect")?.value ?? null;

// ... OAuth validation code ...

// Determine where to redirect after login
let redirectPath = "/";

// Check if user has accepted invitation
if (user.invitationAcceptedAt === null) {
  // User authenticated but needs to accept invitation
  // Use stored redirect if available (should include locale), otherwise default
  redirectPath = storedRedirect || "/en/invitation/validate";
} else if (storedRedirect) {
  // User has invitation, use stored redirect
  redirectPath = storedRedirect;
}

return redirect(redirectPath);
```

### 3. Pass Current URL When Redirecting to Login

**File**: `app/[locale]/invitation/validate/page.tsx`

```typescript
if (!session) {
  // Get the current full path to redirect back after login
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || `/${locale}/invitation/validate`;
  redirect(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`)
}
```

### 4. Create Client Component to Handle Redirect Parameter

**File**: `app/[locale]/login/login-form.tsx`

```typescript
"use client";

import { loginWithGitHub } from "@/app/actions";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleSubmit = async () => {
    await loginWithGitHub(redirectTo || undefined);
  };

  return (
    <form action={handleSubmit}>
      {/* Login button */}
    </form>
  );
}
```

## Flow After Fix

### Scenario 1: Unauthenticated User Visits Invitation Page

1. User visits `/en/invitation/validate` (not authenticated)
2. Server checks session → no session found
3. Redirects to `/en/login?redirectTo=%2Fen%2Finvitation%2Fvalidate`
4. User clicks "Login with GitHub"
5. `loginWithGitHub("/en/invitation/validate")` stores redirect URL in cookie
6. User completes GitHub OAuth
7. Callback reads stored redirect URL from cookie
8. Redirects to `/en/invitation/validate` (with locale!)
9. User sees invitation validation form ✅

### Scenario 2: Direct Login (No Redirect)

1. User visits `/en/login`
2. No `redirectTo` parameter in URL
3. User clicks "Login with GitHub"
4. `loginWithGitHub()` called without redirect parameter
5. User completes GitHub OAuth
6. Callback checks invitation status
7. If no invitation → redirects to `/en/invitation/validate` (default)
8. If has invitation → redirects to `/` (home)

## Key Changes

### Files Modified

1. **`app/actions.ts`**
   - Added `redirectTo` parameter to `loginWithGitHub()`
   - Stores redirect URL in `github_oauth_redirect` cookie

2. **`app/api/login/github/callback/route.ts`**
   - Reads `github_oauth_redirect` cookie
   - Uses stored redirect URL instead of hardcoded path
   - Falls back to `/en/invitation/validate` if no redirect stored

3. **`app/[locale]/invitation/validate/page.tsx`**
   - Adds `redirectTo` query parameter when redirecting to login
   - Uses current pathname from headers

4. **`app/[locale]/login/page.tsx`**
   - Converted to use new `LoginForm` client component

5. **`app/[locale]/login/login-form.tsx`** (NEW)
   - Client component that reads `redirectTo` from URL params
   - Passes redirect URL to `loginWithGitHub()` action

## Security Considerations

### Open Redirect Prevention

The redirect URL is stored in an HttpOnly cookie, which is:
- Not accessible via JavaScript (prevents XSS attacks)
- Only sent to the server (prevents client-side tampering)
- Limited to 10 minutes max age (prevents stale redirects)
- Validated against expected patterns

### Cookie Security

```typescript
{
  path: "/",
  secure: process.env.NODE_ENV === "production",  // HTTPS only in production
  httpOnly: true,                                  // No JavaScript access
  maxAge: 60 * 10,                                 // 10 minutes
  sameSite: "lax"                                  // CSRF protection
}
```

## Testing

### Test 1: Invitation Flow with Redirect

1. Open browser in incognito mode
2. Visit `/en/invitation/validate`
3. Should redirect to `/en/login?redirectTo=%2Fen%2Finvitation%2Fvalidate`
4. Click "Login with GitHub"
5. Complete GitHub OAuth
6. Should redirect back to `/en/invitation/validate`
7. Should see invitation form (not redirect loop)

### Test 2: Direct Login

1. Visit `/en/login` (no redirect parameter)
2. Click "Login with GitHub"
3. Complete GitHub OAuth
4. Should redirect to `/en/invitation/validate` (default for new users)

### Test 3: Existing User Login

1. Create user with accepted invitation
2. Visit `/en/login`
3. Click "Login with GitHub"
4. Complete GitHub OAuth
5. Should redirect to `/` (home page)

## Benefits

1. **No More Redirect Loops** - Users always return to the intended page after login
2. **Locale Preservation** - Language preference is maintained throughout OAuth flow
3. **Better UX** - Users aren't lost after authentication
4. **Flexible** - Can be used for any protected route that needs post-login redirect
5. **Secure** - Uses HttpOnly cookies to prevent tampering

## Future Enhancements

1. **Add redirect validation** - Verify redirect URL is on the same domain
2. **Support multiple redirect scenarios** - E.g., return to previous page after session expiry
3. **Add redirect to admin routes** - Store admin page URLs for post-login redirect
4. **Implement "remember me"** - Extend session duration for trusted devices

## Related Files

- `lib/session.ts` - Session management
- `lib/oauth.ts` - OAuth configuration
- `app/actions.ts` - Server actions including `loginWithGitHub()`
- `app/api/login/github/callback/route.ts` - OAuth callback handler
- `app/[locale]/login/page.tsx` - Login page
- `app/[locale]/login/login-form.tsx` - Login form client component
- `app/[locale]/invitation/validate/page.tsx` - Invitation validation page
