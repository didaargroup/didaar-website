import { db } from "@/db";
import { User, users } from "@/db/schema";
import { eq, Query } from "drizzle-orm";

export const getUserFromGitHubId = (githubUserId: number) => {
    return db.query.users.findFirst({
        where: eq(users.githubId, githubUserId)
    });
}

export const createUserFromGitHubId = (githubUserId: number, username: string): Promise<User> => {
    return db.insert(users).values({
        githubId: githubUserId,
        username: username
    }).returning().then(result => result[0]);
}

export const acceptInvitationForUser = (userId: number): Promise<void> => {
    return db.update(users).set({
        invitationAcceptedAt: new Date()
    }).where(eq(users.id, userId)).then(() => {});
}

export const userNeedsInvitation = (user: User | null): boolean => {
    if (!user) return false;
    return user.invitationAcceptedAt === null;
}