import { AdminBodyClass } from "@/components/admin/admin-body-class";
import "./admin-theme.css";

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  return <AdminBodyClass>{children}</AdminBodyClass>;
} 