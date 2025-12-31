/**
 * Client component for dashboard contextual aside
 * Shows page properties when a page is selected
 */
"use client";

import { AdminSidebarRight } from "@/components/admin/admin-sidebar-right";
import { PagePropertiesForm } from "@/components/admin/page-properties-form";
import { usePageSelection } from "@/components/admin/page-selection-context";

export function DashboardAsideContent() {
  const { selectedPage } = usePageSelection();

  return (
    <AdminSidebarRight title={selectedPage ? "Page Properties" : "Properties"}>
      {selectedPage ? (
        <PagePropertiesForm key={selectedPage.id} page={selectedPage} />
      ) : (
        <div style={{ textAlign: "center", color: "var(--puck-color-grey-05)", padding: "var(--puck-space-px)" }}>
          <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>Select a page to view properties</p>
        </div>
      )}
    </AdminSidebarRight>
  );
}
