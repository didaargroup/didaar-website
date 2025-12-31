"use server"

import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { getCurrentSession } from "@/lib/session";
import { acceptInvitationForUser } from "@/lib/users";
import { redirect } from "next/navigation";
import z from "zod";
import { validateInvitationCodeSchema } from "./fields-schema";
import { FormResults, InvitationStatus } from "../../types/actions";
import { tryCatch } from "@/lib/utils";

/**
 * Checks the invitation status of the current user.
 * @returns InvitationStatus object indicating authentication and invitation status
 */
export async function checkInvitationStatus(): Promise<InvitationStatus> {
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

/**
 * Submits an invitation code for the current user.
 * Follows the standard FormState pattern for server actions.
 *
 * @param prevState Previous form state (for useActionState)
 * @param formData FormData from the form
 * @returns FormState with errors or success status
 */
export async function submitInvitation(
	userId: number,
	_: FormResults<z.infer<typeof validateInvitationCodeSchema>, null>,
	formData: FormData
): Promise<FormResults<z.infer<typeof validateInvitationCodeSchema>, null>> {

	const validatedFields = validateInvitationCodeSchema.safeParse({
		code: formData.get("code") as string,
	});

	if (!validatedFields.success) return {
			errors: z.flattenError(validatedFields.error)
	};


	const { code } = validatedFields.data;
	const invitation = await getInvitationByCode(code);

	if (!invitation) {
		return {
			errors: {
				formErrors: ["Invitation code not found. Please check and try again."]
			}
		};
	}

	if (!isInvitationValid(invitation)) {
		if (invitation.usedBy !== null) {
			return {
				errors: {
					formErrors: ["This invitation code has already been used."]
				}
			};
		}
		if (new Date() > invitation.expiresAt) {
			return {
				errors: {
					formErrors: ["This invitation code has expired."]
				}
			};
		}
		return {
			errors: {
				formErrors: ["Invalid or expired invitation code"]
			}
		};
	}


	const result = await tryCatch(async() => {
		await useInvitation(code, userId);
		await acceptInvitationForUser(userId);
	})
	
	if (!result.success) return {
		errors: {
			formErrors: ["Failed to accept invitation. Please try again."]
		}
	}
	
	redirect("/admin");
}
