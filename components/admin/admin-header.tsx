"use client";

import { Button } from "@/components/ui/button";
import { LogOut, PanelLeft, PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/_actions/auth";
import {
  isButtonAction,
  useAdminLayout,
} from "@/contexts/admin-layout-context";
import { HeaderAction } from "@/types";
import { useEffect, useMemo } from "react";

export function AdminHeader() {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "Dashboard";

    const pathWithoutAdmin = pathname.replace("/admin", "");
    const segments = pathWithoutAdmin.split("/").filter(Boolean);

    if (segments.length === 0) return "Dashboard";

    return segments[segments.length - 1]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [pathname]);

  const {
    sidebarLeftVisible,
    toggleSidebarLeft,
    sidebarRightVisible,
    toggleSidebarRight,
    actions,
    setActions,
    hasDirtyForm,
    hasErrors,
    submitAll,
    isSubmitting
  } = useAdminLayout();

  // Default actions
  useEffect(() => {
    setActions([
      {
        label: "Logout",
        icon: <LogOut className="w-3.5 h-3.5" />,
        onClick: logout,
      },
    ]);
  }, [setActions]);

  return (
    <header className="admin-area bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 relative max-w-screen">
      <div className="flex items-center gap-4 px-4 py-2" style={{ gap: "var(--puck-space-px)", padding: "var(--puck-space-px)" }}>
        {/* Left side - Toggle buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Toggle left sidebar"
            onClick={toggleSidebarLeft}
            className={sidebarLeftVisible ? "text-foreground" : "text-muted-foreground"}
          >
            <PanelLeft focusable="false" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Toggle right sidebar"
            onClick={toggleSidebarRight}
            className={sidebarRightVisible ? "text-foreground" : "text-muted-foreground"}
          >
            <PanelRight focusable="false" className="h-4 w-4" />
          </Button>
        </div>

        {/* Middle - Title */}
        <div className="flex-1">
          <h1 className="text-sm font-semibold" style={{ fontSize: "var(--puck-font-size-xxs)", fontWeight: 500 }}>
            {title}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {hasDirtyForm && (
            <Button
              variant="primary"
              onClick={submitAll}
              disabled={isSubmitting || hasErrors}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          )}
          {actions.map((action, index) => (
            <HeaderActionItem key={index} action={action} />
          ))}
        </div>
      </div>
    </header>
  );
}

function HeaderActionItem({ action }: { action: HeaderAction }) {
  const actionType = useMemo(() => {
    if (typeof action !== "object" && action !== null) {
      return null;
    }

    if ("options" in action) {
      return "dropdown";
    } else if ("href" in action) {
      return "link";
    } else if ("onClick" in action) {
      return "button";
    }

    return null;
  }, [action]);

  if (isButtonAction(action)) {
    return (
      <Button
        key={action.label}
        variant={action?.variant || "secondary"}
        onClick={action.onClick}
        icon={action.icon}
      >
        {action.label}
      </Button>
    );
  }
}
