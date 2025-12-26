import { requireAuth } from "@/lib/route-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import styles from "./admin-dashboard.module.css";
import { AdminLayoutProvider } from "./admin-layout-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ requireInvitation: true });

  return (
    <AdminLayoutProvider>
      <div className={styles.adminDashboard}>
        <div className={styles.adminDashboardContainer}>
          <AdminHeader />
          <div className={styles.adminDashboardContent}>
            <AdminSidebar />
            <main className={styles.adminDashboardMain}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}