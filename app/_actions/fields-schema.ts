import z from "zod"

export const validateInvitationCodeSchema = z.object({
	code: z.string().trim().toUpperCase().refine((val) => {
		const hasInvalidChars = /[^A-F0-9\s-]/.test(val);
		if (hasInvalidChars) {
			return false;
		}
		const cleaned = val.replace(/[^A-F0-9]/g, '');
		return cleaned.length === 12;
	}, {
		message: "Invalid code format. Must be 12 characters using only A-F and 0-9"
	}).transform((val) => {
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
	title: z.string().min(4).max(200),
	content: z.any().optional().nullable(),
});

export const createPageSchema = z.object({
	title: z.string().min(4).max(100),
	slug: z.string().min(4).max(100),
	isDraft: z.coerce.boolean().optional(),
	showOnMenu: z.coerce.boolean().optional(),
});

// export const reorderPagesSchema = z.array({ 