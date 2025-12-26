import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

export function generateInvitationCode(): string {
  const bytes = randomBytes(6);
  const code = bytes.toString("hex").toUpperCase();
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export async function createInvitation(code: string, createdBy: number, expiresAt: Date) {
  const invitation = await db.insert(invitations).values({
    code,
    createdBy,
    expiresAt,
  }).returning();
  return invitation[0];
}

export async function getInvitationByCode(code: string) {
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.code, code.toUpperCase()),
  });
  return invitation;
}

export function isInvitationValid(invitation: any): boolean {
  if (!invitation) return false;
  if (invitation.usedBy !== null) return false; // Already used
  if (new Date() > invitation.expiresAt) return false; // Expired
  return true;
}

export function getInvitationStatus(invitation: any): { valid: boolean; reason?: string } {
  if (!invitation) {
    return { valid: false, reason: "Invitation not found" };
  }
  
  if (invitation.usedBy !== null) {
    return { valid: false, reason: "Already used" };
  }
  
  if (new Date() > invitation.expiresAt) {
    return { valid: false, reason: "Expired" };
  }
  
  return { valid: true };
}

export function formatInvitationCode(code: string): string {
  // Remove any non-hex characters and convert to uppercase
  const cleaned = code.toUpperCase().replace(/[^A-F0-9]/g, '');
  
  // Format as XXXX-XXXX-XXXX
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  }
  
  return code;
}

export async function useInvitation(code: string, userId: number) {
  const invitation = await getInvitationByCode(code);
  if (!invitation) {
    throw new Error("Invalid invitation code");
  }
  
  if (!isInvitationValid(invitation)) {
    throw new Error("Invitation expired or already used");
  }

  // Mark invitation as used
  await db.update(invitations)
    .set({
      usedBy: userId,
      usedAt: new Date(),
    })
    .where(eq(invitations.id, invitation.id));

  return invitation;
}

export async function listInvitations() {
  return await db.query.invitations.findMany({
    with: {
      createdByUser: true,
      usedByUser: true,
    },
  });
}
