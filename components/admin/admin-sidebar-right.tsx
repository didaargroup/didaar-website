"use client";

import { useAdminLayout } from "@/app/admin/(dashboard)/admin-layout-context";


export interface AdminSidebarRightProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminSidebarRight({ children, title = "Properties" }: AdminSidebarRightProps) {
  const { sidebarRightVisible } = useAdminLayout();

  return (
    <>
      {/* Sidebar right */}
      <aside
        data-sidebar-right
        data-sidebar-right-visible={sidebarRightVisible}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          background: "var(--puck-color-white)",
          borderInlineStart: "1px solid var(--puck-color-grey-09)",
          transition: "width 150ms ease-in",
          width: sidebarRightVisible ? "320px" : "0",
          flexShrink: 0,
          overflow: sidebarRightVisible ? "auto" : "hidden"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          {/* Header */}
          {title && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--puck-space-px)",
                borderBottom: "1px solid var(--puck-color-grey-09)",
                fontSize: "var(--puck-font-size-s)",
                fontWeight: 600,
                color: "var(--puck-color-black)",
                flexShrink: 0
              }}
            >
              <span>{title}</span>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", minHeight: 0, paddingBottom: "24px" }}>
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
