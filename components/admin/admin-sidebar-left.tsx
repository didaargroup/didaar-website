"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { Component, useState } from "react";
import { useAdminLayout } from "@/contexts/admin-layout-context";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Docs", href: "/admin/docs", icon: FileText },
  { name: "Pages", href: "/admin/pages", icon: FileText, disable: true, visible: false, new: true },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarLeftVisible } = useAdminLayout();
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

      {/* Sidebar left  */}
      <aside
        data-sidebar
        data-sidebar-visible={sidebarLeftVisible}
        className={cn(
          "admin-area fixed top-0 left-0 z-50 h-screen w-64 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex-shrink-0 flex flex-col overflow-y-auto",
          !sidebarLeftVisible && "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background: "var(--puck-color-grey-12)",
          borderInlineEnd: "1px solid var(--puck-color-grey-09)",
          transition: "width 150ms ease-in"
        }}
      >
        <div className="flex flex-col h-full">

          {/* Logo/Brand - Desktop only */}
          <div
            className="hidden lg:flex items-center"
            style={{
              padding: "var(--puck-space-px)",
              borderBottom: "1px solid var(--puck-color-grey-09)"
            }}
          >
            <Link
              href="/admin"
              className="flex items-center gap-2 transition-colors"
              style={{
                fontSize: "var(--puck-font-size-s)",
                fontWeight: 700,
                color: "var(--puck-color-black)",
                textDecoration: "none"
              }}
            >
              Primary
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto space-y-1"
            style={{ padding: "calc(var(--puck-space-px) * 0.75)" }}
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const TagName = item.disable ? "div" : Link;
              return (
                <TagName
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center w-full transition-colors",
                    item.visible === false && "hidden"
                  )}
                  style={{
                    gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                    backgroundColor: isActive ? "var(--puck-color-azure-04)" : "transparent",
                    color: isActive ? "var(--puck-color-white)" : "var(--puck-color-grey-05)",
                    transition: "background-color 50ms ease-in, color 50ms ease-in"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "var(--puck-color-grey-10)";
                      e.currentTarget.style.color = "var(--puck-color-azure-04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--puck-color-grey-05)";
                    }
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  {item.name}
                </TagName>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: "var(--puck-space-px)", borderTop: "1px solid var(--puck-color-grey-09)" }}>
            <p style={{ fontSize: "var(--puck-font-size-xxs)", color: "var(--puck-color-grey-05)", textAlign: "center" }}>
              © 2025 Pucked
            </p>
          </div>
        </div>
      </aside>

    </>
  );
}
