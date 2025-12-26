import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { userNeedsInvitation } from "@/lib/users";

export interface AuthGuardOptions {
  requireInvitation?: boolean;
  redirectTo?: string;
}

/**
 * Server-side authentication guard for protected routes
 * Use this in server components and route handlers
 */
export async function requireAuth(options: AuthGuardOptions = {}) {
  const { requireInvitation = true, redirectTo = "/login" } = options;
  
  const { user, session } = await getCurrentSession();

  // Not authenticated
  if (!user || !session) {
    redirect(redirectTo);
  }

  // Authenticated but needs invitation
  if (requireInvitation && userNeedsInvitation(user)) {
    redirect("/invitation/validate");
  }

  return { user, session };
}

/**
 * Check if user is authenticated (doesn't redirect)
 */
export async function checkAuth() {
  const { user, session } = await getCurrentSession();
  return {
    isAuthenticated: !!user && !!session,
    user,
    session,
    needsInvitation: user ? userNeedsInvitation(user) : false,
  };
}

/**
 * Client-side redirect helper (use with useEffect in client components)
 */
export function getAuthRedirectUrl(needsInvitation: boolean, isAuthenticated: boolean): string | null {
  if (!isAuthenticated) {
    return "/login";
  }
  if (needsInvitation) {
    return "/invitation/validate";
  }
  return null;
}
