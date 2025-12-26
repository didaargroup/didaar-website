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
          "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex-shrink-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          background: "var(--puck-color-grey-12)",
          borderInlineEnd: "1px solid var(--puck-color-grey-09)",
          gridArea: "left"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Mobile close button */}
          <div
            className="lg:hidden"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              borderBottom: "1px solid var(--puck-color-grey-09)"
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--puck-color-black)" }}>
              Menu
            </span>
            <IconButton
              type="button"
              title="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X focusable="false" />
            </IconButton>
          </div>

          {/* Logo/Brand - Desktop only */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid var(--puck-color-grey-09)"
            }}
          >
            <Link
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--puck-color-black)",
                textDecoration: "none"
              }}
            >
              Pucked
            </Link>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                    width: "100%",
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
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--puck-color-grey-09)" }}>
            <p style={{ fontSize: "14px", color: "var(--puck-color-grey-05)", textAlign: "center" }}>
              © 2025 Pucked
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
