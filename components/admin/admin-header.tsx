"use client";

import { ActionBar, Button, IconButton } from "@measured/puck";
import { Home, LogOut, PanelLeft, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

export function AdminHeader() {
  const pathname = usePathname();

  const toggleMobileSidebar = () => {
    const sidebar = document.querySelector("[data-sidebar]") as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <IconButton type="button" title="Toggle sidebar" onClick={toggleMobileSidebar}>
              <PanelLeft focusable="false" />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              P
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">Puck Admin</div>
              <div className="text-xs text-muted-foreground">{pathname?.replace("/", "") || "admin"}</div>
            </div>
          </div>
        </div>

        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button href="/admin/pages/create" variant="primary" icon={<Plus className="h-4 w-4" />}>
              New page
            </Button>
          </ActionBar.Action>

          <ActionBar.Action onClick={() => {}}>
            <Button href="/" variant="secondary" icon={<Home className="h-4 w-4" />} newTab>
              View site
            </Button>
          </ActionBar.Action>

          <ActionBar.Action onClick={() => {}}>
            <form action={logout}>
              <Button type="submit" variant="secondary" icon={<LogOut className="h-4 w-4" />}>
                Logout
              </Button>
            </form>
          </ActionBar.Action>
        </ActionBar>
      </div>
    </header>
  );
}
