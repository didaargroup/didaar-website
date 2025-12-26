"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkInvitationStatus } from "@/app/actions";

interface AuthGuardProps {
  children: React.ReactNode;
  requireInvitation?: boolean;
}

export function AuthGuard({ children, requireInvitation = true }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const status = await checkInvitationStatus();

      if (!status.authenticated) {
        router.push("/login");
        return;
      }

      if (requireInvitation && status.needsInvitation) {
        router.push("/invitation/validate");
        return;
      }
    }

    checkAuth();
  }, [router, requireInvitation]);

  // While checking auth, you could show a loading spinner
  // For now, we'll render children (they'll be redirected if needed)
  return <>{children}</>;
}

/**
 * Higher-order component to wrap pages that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireInvitation?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireInvitation={options.requireInvitation}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
