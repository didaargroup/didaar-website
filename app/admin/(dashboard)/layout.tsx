import { requireAuth } from "@/lib/route-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar-left";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLayoutProvider } from "@/contexts/admin-layout-context";
import { PageSelectionProvider } from "@/components/admin/page-selection-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationToast } from "@/components/admin/notification-toast";
import { PageTreeProvider } from "@/contexts/page-tree-context";
import { getPagesTree } from "@/lib/page";

export default async function DashboardLayout({
  children,
  ctx,
}: {
  children: React.ReactNode;
  ctx?: React.ReactNode;
}) {
  await requireAuth({ requireInvitation: true });
  const pagesTree = await getPagesTree();

  return (
    <NotificationProvider>
      <PageTreeProvider initialTree={pagesTree}>
        <AdminLayoutProvider>
          <PageSelectionProvider>
            <div className="h-screen flex flex-col bg-muted">
              <AdminHeader />
              <div className="flex-1 grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
                {ctx}
              </div>
            </div>
            <NotificationToast />
          </PageSelectionProvider>
        </AdminLayoutProvider>
      </PageTreeProvider>
    </NotificationProvider>
  );
}