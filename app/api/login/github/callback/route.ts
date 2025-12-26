// app/login/github/callback/route.ts
import { generateSessionToken, createSession, setSessionTokenCookie } from "@/lib/session";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";

import type { OAuth2Tokens } from "arctic";
import { createUserFromGitHubId, getUserFromGitHubId } from "@/lib/users";
import { redirect } from "next/navigation";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieStore = await cookies();
	const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
	const storedRedirect = cookieStore.get("github_oauth_redirect")?.value ?? null;

	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});
	const githubUser = await githubUserResponse.json();
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	const existingUser = await getUserFromGitHubId(githubUserId);

	// Create user if doesn't exist
	let user = existingUser;
	if (!user) {
		user = await createUserFromGitHubId(githubUserId, githubUsername);
	}

	// Always create session (user is authenticated via GitHub)
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	// Determine where to redirect after login
	let redirectPath = "/";

	// Check if user has accepted invitation
	if (user.invitationAcceptedAt === null) {
		// User authenticated but needs to accept invitation
		// Use stored redirect if available (should include locale), otherwise default
		redirectPath = storedRedirect || "/en/invitation/validate";
	} else if (storedRedirect) {
		// User has invitation, use stored redirect
		redirectPath = storedRedirect;
	}

	return redirect(redirectPath);

}