"use server";
import { requireAuth } from "@/lib/route-guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SettingsFormState } from "../_actions_";


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
		let quickLinksEn: Array<{ label: string; url: string; }> = [];
		let quickLinksFa: Array<{ label: string; url: string; }> = [];

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
