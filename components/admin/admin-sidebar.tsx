"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "@measured/puck";
import {
  LayoutDashboard,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pages", href: "/admin/pages", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        data-sidebar
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border lg:hidden">
            <span className="text-lg font-semibold text-foreground">Menu</span>
            <IconButton
              type="button"
              title="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X focusable="false" />
            </IconButton>
          </div>

          {/* Logo/Brand - Desktop only */}
          <div className="hidden lg:flex items-center h-16 px-6 border-b border-border">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground">Pucked</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 Pucked. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
