import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/session";
import { redirect } from "next/navigation";


export async function logout() {
	const { session } = await getCurrentSession();
	if (!session) {
		return;
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	redirect("/login");
}
