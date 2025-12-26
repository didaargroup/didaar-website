import { requireAuth } from "@/lib/route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  // Protect this route - requires authentication and accepted invitation
  const { user } = await requireAuth({ requireInvitation: true });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.username}!
          </p>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Access Granted Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle>Access Granted</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have full access to the application. Your invitation has been verified and accepted.
            </p>
          </CardContent>
        </Card>

        {/* More cards can be added here */}
      </div>

      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-muted-foreground">
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Use the navigation menu to explore different sections of the admin panel.</span>
            </p>
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Manage pages, content, and settings using the intuitive interface.</span>
            </p>
            <p className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Create and manage invitation codes for new users.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}