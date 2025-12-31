import { redirect } from "next/navigation";
import InvitationValidateForm from "./form";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/route-guard";

type Props = {
  params: Promise<{locale: string}>;
};

export default async function SignUpPage({ params }: Props) {
  const { user, session } = await requireAuth({ requireInvitation: false });
  const { locale } = await params;

  if (!session) {
    // Get the current full path to redirect back after login
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || `/${locale}/invitation/validate`;
    
    redirect(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Invitation Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div>
              <CardTitle className="text-3xl">Welcome! 🎉</CardTitle>
              <CardDescription className="text-base mt-2">
                You've successfully authenticated with GitHub. Enter your invitation code to complete registration.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Invitation Form */}
            <InvitationValidateForm userId={user.id} />

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
