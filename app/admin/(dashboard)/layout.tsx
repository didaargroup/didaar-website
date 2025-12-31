import { requireAuth } from "@/lib/route-guard";
import { DashboardContent } from "./dashboard-content";
import { AdminLayoutProvider } from "@/contexts/admin-layout-context";
import { PageSelectionProvider } from "@/components/admin/page-selection-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationToast } from "@/components/admin/notification-toast";
import { PageTreeProvider } from "@/contexts/page-tree-context";
import { getPagesTree } from "@/lib/page";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ requireInvitation: true });
  const pagesTree = await getPagesTree();

  return (
    <NotificationProvider>
      <PageTreeProvider initialTree={pagesTree}>
        <AdminLayoutProvider>
          <PageSelectionProvider>
            <DashboardContent>{children}</DashboardContent>
            <NotificationToast />
          </PageSelectionProvider>
        </AdminLayoutProvider>
      </PageTreeProvider>
    </NotificationProvider>
  );
}