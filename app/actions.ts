"use server";


import { z } from "zod";
import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";
import { tryCatch } from "@/lib/utils";
import { db } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

type FormState = {
  errors?: {
    title?: string[]
    slug?: string[]
    isDraft?: string[]
    parentId?: string[]
    _form?: string[]
  }
  success?: boolean
}

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
	} catch {
		return { error: "Failed to accept invitation. Please try again." };
	}

	redirect("/admin");
}



 
const createPageSchema = z.object({
	title: z.string().min(1).max(100),
})

function slugify(text: string) : string {
	return text.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.trim();
}

export async function createPageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const rawTitle = formData.get("title");

	const validatedFields = createPageSchema.safeParse({
		title: rawTitle,
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	// Generate slug from title if not provided
	const slug = slugify(validatedFields.data.title);

	try {
		const [newPage] = await db.insert(pages).values({
			title: validatedFields.data.title,
			slug: slug,
			isDraft: true,
		}).returning();

		// Create initial translations for both locales
		await db.insert(pageTranslations).values([
			{
				pageId: newPage.id,
				locale: "en",
				title: validatedFields.data.title,
				content: { root: { props: {}, children: [] }},
			},
			{
				pageId: newPage.id,
				locale: "fa",
				title: validatedFields.data.title,
				content: { root: { props: {}, children: [] } },
			},
		]);

		revalidatePath("/admin");
	} catch (error) {
		console.log("Error creating page:", error);
		return {
			errors: {
				_form: ["Failed to create page. Please try again."],
			},
		};
	}

	redirect("/admin")
}

/**
 * Save page order after drag and drop reordering
 */
export async function savePageOrder(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		return {
			errors: {
				_form: ["You must be logged in to save page order"],
			},
		};
	}

	// Get the order data from form data
	const orderData = formData.get("order");
	if (!orderData || typeof orderData !== "string") {
		return {
			errors: {
				_form: ["Invalid order data"],
			},
		};
	}

	try {
		const pagesOrder = JSON.parse(orderData) as Array<{
			id: string;
			parentId: string | null;
			sortOrder: number;
		}>;

		console.log("Saving page order:", pagesOrder);

		// Update each page's parent and sort order
		for (const page of pagesOrder) {
			console.log(`Updating page ${page.id}: parentId=${page.parentId}, sortOrder=${page.sortOrder}`);
			await db
				.update(pages)
				.set({
					parentId: page.parentId ? Number(page.parentId) : null,
					sortOrder: page.sortOrder,
				})
				.where(eq(pages.id, Number(page.id)));
		}

		revalidatePath("/admin");

		return { success: true };
	} catch (error) {
		console.error("Error saving page order:", error);
		return {
			errors: {
				_form: ["Failed to save page order. Please try again."],
			},
		};
	}
}