"use server"

import { getDb } from "@/db";
import { pages } from "@/db/schema";
import { requireAuth } from "@/lib/route-guard";
import { tryCatch } from "@/lib/utils";
import { FormResults } from "@/types/actions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


/**
 * Delete a page by its ID
 * 
 * @param pageId 
 * @returns Status of the deletion operation
 */
export async function deletePageAction(pageId: number): Promise<FormResults<null>> {
  await requireAuth();

  const db = getDb();

  const result = await tryCatch(async () => {
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!existingPage) {
      return {
        errors: {
          formErrors: ["Page not found"],
        },
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
          formErrors: [
            "Cannot delete page with child pages. Please move or delete child pages first.",
          ],
        },
      };
    }

    // Delete page (cascade will delete translations)
    await db.delete(pages).where(eq(pages.id, pageId));

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath(`/${existingPage.slug}`);

    return { success: "Page deleted successfully"};
  });

  if (!result.success) {
    return {
      errors: {
        formErrors: ["Failed to delete page"],
      },
    };
  }

  return result.data;
}


export async function updatePageAction(formData: FormData) {
  await requireAuth();

  const validatedFields = updatePageSchema.safeParse({
    pageId: formData.get("pageId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    isDraft: formData.get("isDraft"),
    showOnMenu: formData.get("showOnMenu"),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error),
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