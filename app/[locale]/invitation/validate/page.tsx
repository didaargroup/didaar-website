

import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import InvitationValidateForm from "./form";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function SignUpPage({ params }: Props) {
  const { session, user } = await getCurrentSession();
  const { locale } = await params;

  // Debug logging
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  console.log("Invitation validate page - Session cookie exists:", !!sessionCookie);
  console.log("Invitation validate page - Session from DB:", !!session);
  console.log("Invitation validate page - User:", user?.username);

  if (!session) {
    // Get the current full path to redirect back after login
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || `/${locale}/invitation/validate`;
    console.log("No session found, redirecting to login with redirectTo:", pathname);
    redirect(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Invitation Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-3xl">Welcome! 🎉</CardTitle>
              <CardDescription className="text-base mt-2">
                You've successfully authenticated with GitHub. Enter your invitation code to complete registration.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Invitation Form */}
            <InvitationValidateForm />

            {/* Help Text */}
            <div className="p-4 rounded-lg bg-muted border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Need an invitation?</span> Contact an administrator to request access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Secure invitation-based registration powered by GitHub OAuth
          </p>
        </div>
      </div>
    </div>
  );
}
