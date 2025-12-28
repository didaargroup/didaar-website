"use client";

import { Button, IconButton } from "@measured/puck";
import { Home, LogOut, PanelLeft, PanelRight, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useAdminLayout } from "@/app/admin/(dashboard)/admin-layout-context";

export function AdminHeader() {
  const pathname = usePathname();
  const { sidebarLeftVisible, toggleSidebarLeft, sidebarRightVisible, toggleSidebarRight } = useAdminLayout();

  return (
    <header
      style={{
        background: "var(--puck-color-white)",
        borderBottom: "1px solid var(--puck-color-grey-09)",
        color: "var(--puck-color-black)",
        position: "relative",
        maxWidth: "100vw"
      }}
    >
      <div
        style={{
          alignItems: "end",
          display: "grid",
          gap: "var(--puck-space-px)",
          gridTemplateAreas: '"left middle right"',
          gridTemplateColumns: "1fr auto 1fr",
          gridTemplateRows: "auto",
          padding: "var(--puck-space-px)"
        }}
      >
        {/* Left side - Toggle buttons (always visible like Puck) */}
        <div
          style={{
            display: "flex",
            marginInlineStart: "-4px",
            paddingTop: "2px"
          }}
        >
          <div
            style={{
              color: sidebarLeftVisible ? "var(--puck-color-black)" : "var(--puck-color-grey-05)",
            }}
          >
            <IconButton
              type="button"
              title="Toggle left sidebar"
              onClick={toggleSidebarLeft}
            >
              <PanelLeft focusable="false" />
            </IconButton>
          </div>
          <div
            style={{
              color: sidebarRightVisible ? "var(--puck-color-black)" : "var(--puck-color-grey-05)",
            }}
          >
            <IconButton
              type="button"
              title="Toggle right sidebar"
              onClick={toggleSidebarRight}
            >
          <PanelRight focusable="false" />
        </IconButton>
          </div>
      </div>

      {/* Middle - Title (using Puck's Heading style) */}
      <div
        style={{
          alignSelf: "center",
          display: "block",
          color: "var(--puck-color-black)",
          fontWeight: 700,
          margin: 0,
          fontSize: "var(--puck-font-size-xs)"
        }}
      >
        {pathname?.replace("/admin", "") || "Dashboard"}
      </div>

      {/* Right side - Actions */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "flex-end",
          alignItems: "center"
        }}
      >
        <Button
          href="/admin/pages/create"
          variant="primary"
          icon={<Plus style={{ width: "14px", height: "14px" }} />}
        >
          New page
        </Button>

        <Button
          variant="secondary"
          icon={<LogOut style={{ width: "14px", height: "14px" }} />}
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
    </header >
  );
}
