import { requireAuth } from "@/lib/route-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import "@measured/puck/puck.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all admin routes - require authentication and accepted invitation
  await requireAuth({ requireInvitation: true });

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}