"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AdminLayoutState = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutState | undefined>(
  undefined
);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <AdminLayoutContext.Provider
      value={{ sidebarVisible, setSidebarVisible, toggleSidebar }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}
