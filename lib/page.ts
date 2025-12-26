
import { db } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { Page } from "@/db/schema";

export interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  isDraft: boolean;
  showOnMenu: boolean;
  children?: PageTreeNode[];
}

/**
 * Build a hierarchical tree structure from flat pages array
 */
function buildPageTree(
  pages: Page[],
  parentId: number | null = null
): PageTreeNode[] {
  const filteredPages = pages
    .filter((page) => page.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((page) => ({
      id: String(page.id),
      title: page.title,
      slug: page.slug,
      isDraft: page.isDraft,
      showOnMenu: page.showOnMenu,
      children: buildPageTree(pages, page.id),
    }));

    console.log("Filtered Pages:", filteredPages);
  return filteredPages;
}

/**
 * Get all pages organized as a tree structure
 */
export async function getPagesTree(): Promise<PageTreeNode[]> {
  const allPages = await db.select().from(pages).orderBy(pages.sortOrder);
  return buildPageTree(allPages, null);
}

/**
 * Get a page by its slug
 */
export async function getPageBySlug(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!page) return null;

  // Get translations for this page
  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, page.id));

  return {
    ...page,
    translations,
  };
}

/**
 * Get a page by its ID with translations
 */
export async function getPageById(id: number) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  if (!page) return null;

  // Get translations for this page
  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, page.id));

  return {
    ...page,
    translations,
  };
}

/**
 * Update an existing page
 */
export async function updatePage(
  id: number,
  data: {
    title?: string;
    slug?: string;
    isDraft?: boolean;
    showOnMenu?: boolean;
    parentId?: number | null;
    sortOrder?: number;
  }
) {
  const [updated] = await db
    .update(pages)
    .set(data)
    .where(eq(pages.id, id))
    .returning();

  return updated;
}

/**
 * Create a new page
 */
export async function createPage(data: {
  title: string;
  slug: string;
  isDraft?: boolean;
  showOnMenu?: boolean;
  parentId?: number | null;
  sortOrder?: number;
}) {
  const [newPage] = await db
    .insert(pages)
    .values({
      title: data.title,
      slug: data.slug,
      isDraft: data.isDraft ?? true,
      showOnMenu: data.showOnMenu ?? true,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  return newPage;
}

/**
 * Get page statistics
 */
export async function getPageStats() {
  const allPages = await db.select().from(pages);

  const total = allPages.length;
  const published = allPages.filter((p) => !p.isDraft).length;
  const drafts = allPages.filter((p) => p.isDraft).length;

  return { total, published, drafts };
}

