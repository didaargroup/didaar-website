"use server";

import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";

export async function logout() {
	const { session } = await getCurrentSession();
	if (!session) {
		return;
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	redirect("/login");
}

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

export async function checkInvitationStatus() {
	const { user } = await getCurrentSession();
	
	if (!user) {
		return { authenticated: false, needsInvitation: false };
	}

	return {
		authenticated: true,
		needsInvitation: user.invitationAcceptedAt === null,
		invitationAcceptedAt: user.invitationAcceptedAt,
	};
}

export async function submitInvitation(prevState: { error: string }, formData: FormData) {
	const rawCode = formData.get("code");
	const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

	const { user } = await getCurrentSession();

	if (!user) {
		return { error: "You must be logged in to submit an invitation code" };
	}

	// Check if user already accepted invitation
	if (user.invitationAcceptedAt !== null) {
		return { error: "You have already accepted an invitation" };
	}

	if (!code) {
		return { error: "Invitation code is required" };
	}

	// Validate code format (XXXX-XXXX-XXXX)
	const codePattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
	if (!codePattern.test(code)) {
		return { error: "Invalid code format. Expected format: XXXX-XXXX-XXXX" };
	}

	const invitation = await getInvitationByCode(code);
	
	if (!invitation) {
		return { error: "Invitation code not found. Please check and try again." };
	}

	if (!isInvitationValid(invitation)) {
		if (invitation.usedBy !== null) {
			return { error: "This invitation code has already been used." };
		}
		if (new Date() > invitation.expiresAt) {
			return { error: "This invitation code has expired." };
		}
		return { error: "Invalid or expired invitation code" };
	}

	try {
		await useInvitation(code, user.id);
		await acceptInvitationForUser(user.id);
	} catch (error) {
		console.error("Error accepting invitation:", error);
		return { error: "Failed to accept invitation. Please try again." };
	}

	redirect("/admin");
}

