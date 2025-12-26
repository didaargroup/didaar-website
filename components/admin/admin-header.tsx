"use client";

import { Button, IconButton } from "@measured/puck";
import { Home, LogOut, PanelLeft, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

export function AdminHeader() {
  const pathname = usePathname();

  const toggleSidebar = () => {
    const sidebar = document.querySelector("[data-sidebar]") as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <header
      style={{
        background: "var(--puck-color-white)",
        borderBottom: "1px solid var(--puck-color-grey-09)",
        color: "var(--puck-color-black)",
        gridArea: "header",
        position: "relative",
        maxWidth: "100vw"
      }}
    >
      <div
        style={{
          alignItems: "end",
          display: "grid",
          gap: "16px",
          gridTemplateAreas: '"left middle right"',
          gridTemplateColumns: "1fr auto 1fr",
          gridTemplateRows: "auto",
          padding: "16px"
        }}
      >
        {/* Left side - Toggle buttons (always visible like Puck) */}
        <div
          style={{
            color: "var(--puck-color-grey-05)",
            display: "flex",
            marginInlineStart: "-4px",
            paddingTop: "2px"
          }}
        >
          <IconButton
            type="button"
            title="Toggle left sidebar"
            onClick={toggleSidebar}
          >
            <PanelLeft focusable="false" />
          </IconButton>
        </div>

        {/* Middle - Title (using Puck's Heading style) */}
        <div
          style={{
            alignSelf: "center",
            display: "block",
            color: "var(--puck-color-black)",
            fontWeight: 700,
            margin: 0,
            fontSize: "16px"
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
            href="/"
            variant="secondary"
            icon={<Home style={{ width: "14px", height: "14px" }} />}
            newTab
          >
            View site
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
    </header>
  );
}
