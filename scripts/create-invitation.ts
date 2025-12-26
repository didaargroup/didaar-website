import { db } from "@/db";
import { users } from "@/db/schema";
import { generateInvitationCode, createInvitation } from "@/lib/invitation";
import { eq } from "drizzle-orm";

async function main() {
  // Get the first user (should be an admin)
  const adminUsers = await db.query.users.findMany({
    limit: 1,
  });

  if (adminUsers.length === 0) {
    console.error("No users found. Please create a user first.");
    process.exit(1);
  }

  const adminUser = adminUsers[0];
  console.log(`Creating invitation as user: ${adminUser.username} (ID: ${adminUser.id})`);

  // Generate invitation code
  const code = generateInvitationCode();
  console.log(`Generated code: ${code}`);

  // Set expiration (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Create invitation
  const invitation = await createInvitation(code, adminUser.id, expiresAt);
  
  console.log("\n✅ Invitation created successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Code:        ${invitation.code}`);
  console.log(`Created by:  ${adminUser.username} (ID: ${adminUser.id})`);
  console.log(`Expires:     ${invitation.expiresAt.toISOString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nShare this code with the person you want to invite:");
  console.log(`\n  ${invitation.code}\n`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error creating invitation:", error);
    process.exit(1);
  });
