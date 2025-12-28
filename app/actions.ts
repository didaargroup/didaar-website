"use server";


import { z } from "zod";
import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";
import { tryCatch } from "@/lib/utils";
import { getDb } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { updatePageFullPath, updateFullPathTree, buildPageTree, updateFullPathsForTree, updateFullPathForSlugChange } from "@/lib/page";
import { requireAuth } from "@/lib/route-guard";

type FormState = {
  errors?: {
    title?: string[]
    slug?: string[]
    isDraft?: string[]
    parentId?: string[]
    _form?: string[]
  }
  success?: boolean
  updatedPage?: {
    id: number
    title: string
    slug: string
    isDraft: boolean
    showOnMenu: boolean
    sortOrder: number
    parentId: number | null
  }
}

const db = getDb();

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
			fullPath: slug, // Initial fullPath
			isDraft: true,
		}).returning();

		// Update fullPath based on parent hierarchy (if parent exists)
		await updatePageFullPath(newPage.id);

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

		// First, update all pages' parent and sort order
		for (const page of pagesOrder) {
			await db
				.update(pages)
				.set({
					parentId: page.parentId ? Number(page.parentId) : null,
					sortOrder: page.sortOrder,
				})
				.where(eq(pages.id, Number(page.id)))
				.returning();
		}

		// After updating all parent relationships, fetch the complete tree
		// and update all full paths in a single batch operation
		const allPages = await db.select().from(pages).orderBy(pages.sortOrder);
		
		// Build the tree structure
		const allTranslations = await db.select().from(pageTranslations);
		const translationsMap = new Map<number, typeof pageTranslations.$inferSelect[]>();
		
		allTranslations.forEach(t => {
			if (!translationsMap.has(t.pageId)) {
				translationsMap.set(t.pageId, []);
			}
			translationsMap.get(t.pageId)!.push(t);
		});
		
		const tree = buildPageTree(allPages, translationsMap, null);
		
		// Update full paths for all pages in one batch
		await updateFullPathsForTree(tree);

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


const pageContentSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.any().optional().nullable(),
});

export async function savePageContent(
	pageId: number,
	locale: string,
	prevState: FormState,
	formData: FormData
) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const action = formData.get("action") as string | null;

	// Handle delete action
	if (action === "delete") {
		try {
			// Check if page exists
			const [existingPage] = await db
				.select()
				.from(pages)
				.where(eq(pages.id, pageId))
				.limit(1);

			if (!existingPage) {
				return {
					errors: {
						_form: ["Page not found"],
					},
				};
			}

			// Delete the translation
			await db
				.delete(pageTranslations)
				.where(
					and(
						eq(pageTranslations.pageId, pageId),
						eq(pageTranslations.locale, locale)
					)
				);

			// Revalidate paths
			revalidatePath("/admin");
			revalidatePath(`/${locale}/${existingPage.slug}`);

			return { success: true, deleted: true };
		} catch (error) {
			console.error("Error deleting page translation:", error);
			return {
				errors: {
					_form: ["Failed to delete page translation. Please try again."],
				},
			};
		}
	}

	// Handle toggle-publish action
	if (action === "toggle-publish") {
		try {
			// Get current translation to toggle published status
			const [existingTranslation] = await db
				.select()
				.from(pageTranslations)
				.where(
					and(
						eq(pageTranslations.pageId, pageId),
						eq(pageTranslations.locale, locale)
					)
				)
				.limit(1);

			if (!existingTranslation) {
				return {
					errors: {
						_form: ["Translation not found. Please save the page first."],
					},
				};
			}

			const newPublishedStatus = !existingTranslation.published;

			// Parse isDraft status from form data
			const rawIsDraft = formData.get("isDraft");
			let isDraft = false;
			if (typeof rawIsDraft === "string") {
				isDraft = rawIsDraft === "true";
			}

			// Update page isDraft status
			await db
				.update(pages)
				.set({ isDraft })
				.where(eq(pages.id, pageId));

			// Update published status
			await db
				.update(pageTranslations)
				.set({ published: newPublishedStatus })
				.where(
					and(
						eq(pageTranslations.pageId, pageId),
						eq(pageTranslations.locale, locale)
					)
				);

			// Revalidate paths
			revalidatePath("/admin");
			revalidatePath(`/${locale}`);

			return { success: true, published: newPublishedStatus };
		} catch (error) {
			console.error("Error toggling publish status:", error);
			return {
				errors: {
					_form: ["Failed to update publish status. Please try again."],
				},
			};
		}
	}

	// Handle default save action
	const rawTitle = formData.get("title");
	const rawContent = formData.get("content");
	const rawPublished = formData.get("published");
	const rawIsDraft = formData.get("isDraft");

	// Parse content if it's a string
	let content = rawContent;
	if (typeof rawContent === "string") {
		try {
			content = JSON.parse(rawContent);
		} catch (error) {
			return {
				errors: {
					_form: ["Invalid content format. Content must be valid JSON."],
				},
			};
		}
	}

	const validatedFields = pageContentSchema.safeParse({
		title: rawTitle,
		content: content,
	});

	if (!validatedFields.success) {
		console.log("Validation errors:", validatedFields.error.flatten().fieldErrors);
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { title, content: validatedContent } = validatedFields.data;

	// Parse published status
	let published = true;
	if (typeof rawPublished === "string") {
		published = rawPublished === "true";
	}

	// Parse isDraft status
	let isDraft = false;
	if (typeof rawIsDraft === "string") {
		isDraft = rawIsDraft === "true";
	}

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			return {
				errors: {
					_form: ["Page not found"],
				},
			};
		}

		// Update page isDraft status
		await db
			.update(pages)
			.set({ isDraft })
			.where(eq(pages.id, pageId));

		// Update or insert page translation
		await db
			.insert(pageTranslations)
			.values({
				pageId,
				locale,
				title,
				content: validatedContent || { root: { props: {}, children: [] } },
				published,
			})
			.onConflictDoUpdate({
				target: [pageTranslations.pageId, pageTranslations.locale],
				set: {
					title,
					content: validatedContent || { root: { props: {}, children: [] } },
					published,
				},
			});

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${locale}/${existingPage.slug}`);

		return { success: true, published };
	} catch (error) {
		console.error("Error saving page content:", error);
		return {
			errors: {
				_form: ["Failed to save page content. Please try again."],
			},
		};
	}
}

const updatePageSchema = z.object({
	pageId: z.string().transform((val) => parseInt(val, 10)),
	title: z.string().min(1).max(200),
	slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
	isDraft: z.union([z.string(), z.null()]).optional().transform((val) => val === "on"),
	showOnMenu: z.union([z.string(), z.null()]).optional().transform((val) => val === "on"),
});

export async function updatePageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const validatedFields = updatePageSchema.safeParse({
		pageId: formData.get("pageId"),
		title: formData.get("title"),
		slug: formData.get("slug"),
		isDraft: formData.get("isDraft"),
		showOnMenu: formData.get("showOnMenu"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { pageId, title, slug, isDraft, showOnMenu } = validatedFields.data;

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			console.log(`[updatePageAction] Page ${pageId} not found`);
			return {
				errors: {
					_form: ["Page not found"],
				},
				success: false,
			};
		}

	// Check if slug is already taken by another page
	const [slugConflict] = await db
		.select()
		.from(pages)
		.where(eq(pages.slug, slug))
		.limit(1);

	if (slugConflict && slugConflict.id !== pageId) {
		return {
			errors: {
				slug: ["This slug is already in use by another page"],
			},
			success: false,
		};
	}

	// Update page
	const [updatedPage] = await db
		.update(pages)
		.set({
			title,
			slug,
			isDraft,
			showOnMenu,
		})
		.where(eq(pages.id, pageId))
		.returning();

	// If slug changed, update fullPath for this page and all descendants
	if (slug !== existingPage.slug) {
		await updateFullPathForSlugChange(pageId, slug);

		// Fetch the updated page with new fullPath
		const [pageWithFullPath] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		console.log(`[updatePageAction] Page with updated fullPath:`, {
			id: pageWithFullPath?.id,
			fullPath: pageWithFullPath?.fullPath,
		});

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${existingPage.fullPath}`);
		revalidatePath(`/${pageWithFullPath?.fullPath || slug}`);

		return {
			success: true,
			updatedPage: pageWithFullPath || updatedPage,
		};
	}

	console.log(`[updatePageAction] Slug unchanged, skipping fullPath update`);
		
		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${existingPage.fullPath}`);

		return { 
			success: true,
			updatedPage: updatedPage || undefined,
		};
	} catch (error) {
		console.error("Error updating page:", error);
		return {
			errors: {
				_form: ["Failed to update page. Please try again."],
			},
			success: false,
		};
	}
}

const deletePageSchema = z.object({
	pageId: z.string().transform((val) => parseInt(val, 10)),
});

export async function deletePageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const validatedFields = deletePageSchema.safeParse({
		pageId: formData.get("pageId"),
	});

	if (!validatedFields.success) {
		return {
			errors: {
				_form: ["Invalid page ID"],
			},
			success: false,
		};
	}

	const { pageId } = validatedFields.data;

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			return {
				errors: {
					_form: ["Page not found"],
				},
				success: false,
			};
		}

		// Check if page has children
		const [childPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.parentId, pageId))
			.limit(1);

		if (childPage) {
			return {
				errors: {
					_form: ["Cannot delete page with child pages. Please move or delete child pages first."],
				},
				success: false,
			};
		}

		// Delete page (cascade will delete translations)
		await db.delete(pages).where(eq(pages.id, pageId));

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${existingPage.slug}`);

		return { success: true };
	} catch (error) {
		console.error("Error deleting page:", error);
		return {
			errors: {
				_form: ["Failed to delete page. Please try again."],
			},
			success: false,
		};
	}
}

// Settings actions
type SettingsFormState = {
  errors?: {
    siteNameEn?: string[]
    siteNameFa?: string[]
    logoUrl?: string[]
    twitter?: string[]
    facebook?: string[]
    instagram?: string[]
    linkedin?: string[]
    youtube?: string[]
    quickLinksEn?: string[]
    quickLinksFa?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function updateSiteSettingsAction(prevState: SettingsFormState, formData: FormData) {
  const { user } = await requireAuth();
  if (!user) {
    redirect("/login");
  }

  try {
    const siteNameEn = formData.get("siteNameEn");
    const siteNameFa = formData.get("siteNameFa");
    const logoUrl = formData.get("logoUrl");
    const twitter = formData.get("twitter");
    const facebook = formData.get("facebook");
    const instagram = formData.get("instagram");
    const linkedin = formData.get("linkedin");
    const youtube = formData.get("youtube");
    
    // Get quick links data
    const quickLinksEnJson = formData.get("quickLinksEn");
    const quickLinksFaJson = formData.get("quickLinksFa");

    // Validate required fields
    const errors: SettingsFormState["errors"] = {};

    if (!siteNameEn || typeof siteNameEn !== "string" || siteNameEn.trim() === "") {
      errors.siteNameEn = ["Site name (English) is required"];
    }

    if (!siteNameFa || typeof siteNameFa !== "string" || siteNameFa.trim() === "") {
      errors.siteNameFa = ["Site name (Farsi) is required"];
    }

    if (Object.keys(errors).length > 0) {
      return { errors, success: false };
    }

    // Parse quick links JSON
    let quickLinksEn: Array<{ label: string; url: string }> = [];
    let quickLinksFa: Array<{ label: string; url: string }> = [];
    
    if (quickLinksEnJson && typeof quickLinksEnJson === "string") {
      try {
        quickLinksEn = JSON.parse(quickLinksEnJson);
      } catch (e) {
        errors.quickLinksEn = ["Invalid quick links format"];
      }
    }
    
    if (quickLinksFaJson && typeof quickLinksFaJson === "string") {
      try {
        quickLinksFa = JSON.parse(quickLinksFaJson);
      } catch (e) {
        errors.quickLinksFa = ["Invalid quick links format"];
      }
    }

    if (Object.keys(errors).length > 0) {
      return { errors, success: false };
    }

    // Update site settings
    const { updateSiteSettings } = await import("@/lib/site-settings");
    await updateSiteSettings({
      siteName: {
        en: siteNameEn as string,
        fa: siteNameFa as string,
      },
      logoUrl: (logoUrl as string || "") || undefined,
      socialLinks: {
        twitter: (twitter as string || "") || undefined,
        facebook: (facebook as string || "") || undefined,
        instagram: (instagram as string || "") || undefined,
        linkedin: (linkedin as string || "") || undefined,
        youtube: (youtube as string || "") || undefined,
      },
      footerQuickLinks: {
        en: quickLinksEn,
        fa: quickLinksFa,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return {
      errors: {
        _form: ["Failed to update site settings. Please try again."],
      },
      success: false,
    };
  }
}