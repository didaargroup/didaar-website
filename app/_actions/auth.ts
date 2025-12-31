"use server"

import { github } from "@/lib/oauth";
import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/session";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


/**
 * Log out the current user by invalidating their session and deleting the session cookie
 * @returns void
 */
export async function logout(): Promise<void> {
	const { session } = await getCurrentSession();
	if (!session) {
		return;
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	redirect("/login");
}

/**
 * Initiate GitHub OAuth login flow
 * 
 * @param redirectTo (optional) URL to redirect to after successful login
 * @returns void
 */
export async function loginWithGitHub(redirectTo?: string) {
	const state = generateState();
	const url = github.createAuthorizationURL(state, []);

	const cookieStore = await cookies();
	cookieStore.set("github_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	// Store the redirect URL (with locale) to use after successful OAuth
	if (redirectTo) {
		cookieStore.set("github_oauth_redirect", redirectTo, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: "lax"
		});
	}

	redirect(url.toString());
}


