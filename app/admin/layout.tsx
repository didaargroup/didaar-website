import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) 

{
    const {user} = await getCurrentSession()
    if (!user) {
        redirect("/login");
    }

    if (!user.invitationAcceptedAt) {
        redirect("/invitation/validate");
    }
  return <>{children}</>;
}