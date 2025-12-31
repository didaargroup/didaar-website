"use server";

import { getDb } from "@/db";
import { Page, pages, pageTranslations } from "@/db/schema";
import { requireAuth } from "@/lib/route-guard";
import { tryCatch } from "@/lib/utils";
import { FormResults } from "@/types/actions";
import { and, eq, is } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createPageSchema,
  pageContentSchema,
  updatePageSchema,
} from "./fields-schema";
import z from "zod";
import {
  buildPageTree,
  updateFullPathForSlugChange,
  updateFullPathsForTree,
  updatePageFullPath,
} from "@/lib/page";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Todo
type FormState = {
  errors?: {
    formErrors?: string[];
    fieldErrors?: {
      title?: string[];
      slug?: string[];
      isDraft?: string[];
      showOnMenu?: string[];
      parentId?: string[];
    };
  };
  success?: boolean;
  updatedPage?: {
    id: number;
    title: string;
    slug: string;
    isDraft: boolean;
    showOnMenu: boolean;
    sortOrder: number;
    parentId: number | null;
  };
};

/**
 * Delete a page by its ID
 *
 * @param pageId
 * @returns Status of the deletion operation
 */
export async function deletePageAction(
  pageId: number
): Promise<FormResults<null, null>> {
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

    return { success: "Page deleted successfully" };
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

type UpdatePageResult = FormResults<z.infer<typeof updatePageSchema>, Page>;

/**
 * Update a page's properties
 *
 * @param pageId - Page ID (bound parameter)
 * @param formData - Form data from the submitted form
 * @returns Status of the update operation
 */
export async function updatePageAction(
  pageId: number,
  prevState: UpdatePageResult,
  formData: FormData
): Promise<UpdatePageResult> {
  await requireAuth();

  const getData = (formData: FormData) => ({
    title: formData.get("title"),
    slug: formData.get("slug"),
    isDraft: formData.get("isDraft"),
    showOnMenu: formData.get("showOnMenu"),
  });

  const validatedFields = updatePageSchema.safeParse(getData(formData));

  if (!validatedFields.success) {
    return {
      errors: {
        fieldErrors: z.flattenError(validatedFields.error).fieldErrors,
      },
    };
  }

  const db = getDb();
  const { title, slug, isDraft, showOnMenu } = validatedFields.data;

  const result = await tryCatch(async () => {
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!existingPage) throw new Error("Page not found");

    // Check if slug is already taken by another page
    const [slugConflict] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (slugConflict && slugConflict.id !== pageId) {
      throw new Error("This slug is already in use by another page");
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

    // Update fullPath if slug changed
    await updateFullPathForSlugChange(pageId, slug);

    revalidatePath("/admin");
    revalidatePath(`/${existingPage.fullPath}`);

    return updatedPage;
  });

  if (!result.success) {
    return {
      errors: {
        formErrors: [result.error.message],
      },
    };
  }

  return {
    success: "Page updated successfully",
    data: result.data,
  };
}

type SavePageOrderResult = FormResults<null, null>;
/**
 * Save the order of pages based on the provided form data
 *
 * @param prevState
 * @param formData
 * @returns
 */
export async function savePageOrder(prevState: FormState, formData: FormData) {
  await requireAuth();

  
  // Get the order data from form data
  const orderData = formData.get("order");
  if (!orderData || typeof orderData !== "string") {
    return {
      errors: {
        _form: ["Invalid order data"],
      },
    };
  }
  
  const db = getDb();
  
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
    const translationsMap = new Map<
      number,
      (typeof pageTranslations.$inferSelect)[]
    >();

    allTranslations.forEach((t) => {
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

  const db = getDb();
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
      await db.update(pages).set({ isDraft }).where(eq(pages.id, pageId));

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
    console.log(
      "Validation errors:",
      validatedFields.error.flatten().fieldErrors
    );
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
    await db.update(pages).set({ isDraft }).where(eq(pages.id, pageId));

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

type CreatePageState = FormResults<z.infer<typeof createPageSchema>, Page>;

/**
 * Create a new page
 * 
 * @param prevState 
 * @param formData 
 * @returns 
 */
export async function createPageAction(
  prevState: CreatePageState,
  formData: FormData
): Promise<CreatePageState> {
  await requireAuth();

  const validatedFields = createPageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    isDraft: formData.get("isDraft"),
    showOnMenu: formData.get("showOnMenu"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        fieldErrors: z.flattenError(validatedFields.error).fieldErrors,
      },
    };
  }

  const db = getDb();

  const result = await tryCatch(async () => {
    const [newPage] = await db
      .insert(pages)
      .values(validatedFields.data)
      .returning();

    // Create initial translations for both locales
    await db.insert(pageTranslations).values(
      ["en", "fa"].map((locale) => ({
        pageId: newPage.id,
        locale,
        title: validatedFields.data.title,
        content: { root: { props: {}, children: [] } },
      }))
    );

		revalidatePath("/admin");

		return newPage;
  });

	if (!result.success) {
		return {
			errors: {
				formErrors: [result.error.message]
			}
		}
	}

	return {
		success: "Page created successfully",
		data: result.data
	}

}
