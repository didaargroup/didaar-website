"use client";

import { Button, IconButton } from "@measured/puck";
import { LogOut, PanelLeft, PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  isButtonAction,
  useAdminLayout,
} from "@/app/admin/(dashboard)/admin-layout-context";
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 relative max-w-screen">
      <div className="grid items-end gap-(--puck-space-px) grid-areas-[left_middle_right] grid-cols-[1fr_auto_1fr] grid-rows-auto p-(--puck-space-px)">
        {/* Left side - Toggle buttons (always visible like Puck) */}
        <div className="flex -ms-1 pt-0.5">
          <div
            className={
              sidebarLeftVisible
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-600"
            }
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
            className={
              sidebarRightVisible
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-600"
            }
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
        <div className="self-center block text-gray-900 dark:text-gray-100 font-bold m-0 text-xs">
          {/* {pathname?.replace("/admin", "") || "Dashboard"} */}
          {title}
        </div>

        {/* Right side - Actions */}
        <div className="flex gap-4 justify-end items-center">
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
