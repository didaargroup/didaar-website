import z from "@/node_modules/zod/v4/classic/external.cjs";

export const validateInvitationCodeSchema = z.object({
	code: z.string().trim().toUpperCase().refine((val) => {
		// First check: must only contain valid characters (A-F, 0-9, dashes, spaces)
		const hasInvalidChars = /[^A-F0-9\s-]/.test(val);
		if (hasInvalidChars) {
			return false;
		}
		// Second check: after removing separators, must be exactly 12 characters
		const cleaned = val.replace(/[^A-F0-9]/g, '');
		return cleaned.length === 12;
	}, {
		message: "Invalid code format. Must be 12 characters using only A-F and 0-9"
	}).transform((val) => {
		// Remove any separators and format with dashes: XXXX-XXXX-XXXX
		const cleaned = val.replace(/[^A-F0-9]/g, '');
		return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
	}),
});

export const updatePageSchema = z.object({
	title: z.string().min(4).max(200),
	slug: z.string().min(4).max(200).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
	isDraft: z.union([z.string(), z.null()]).optional().transform((val) => val === "on"),
	showOnMenu: z.union([z.string(), z.null()]).optional().transform((val) => val === "on"),
});

export const pageContentSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.any().optional().nullable(),
});
