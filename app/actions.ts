import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function logout(): Promise<ActionResult> {
	const { session } = await getCurrentSession();
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	return redirect("/login");
}

interface ActionResult {
	error: string | null;
}