"use client";

import { useEffect } from "react";

export function AdminBodyClass({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add admin-area class to body when mounted
    document.body.classList.add("admin-area");

    // Cleanup: remove class when unmounted (navigation away from admin)
    return () => {
      document.body.classList.remove("admin-area");
    };
  }, []);

  return <>{children}</>;
}
