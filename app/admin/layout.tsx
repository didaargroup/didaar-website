import { requireAuth } from "@/lib/route-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all admin routes - require authentication and accepted invitation
  await requireAuth({ requireInvitation: true });

  return <>{children}</>;
}