
import { getDb } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { eq, and, isNull, sql, like } from "drizzle-orm";
import type { Page, PageTranslation } from "@/db/schema";

export interface PageTranslationStatus {
  locale: string;
  published: boolean;
  hasContent: boolean;
}

export interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  isDraft: boolean;
  showOnMenu: boolean;
  translations?: PageTranslationStatus[];
  children?: PageTreeNode[];
}

/**
 * Build a hierarchical tree structure from flat pages array
 */
const db = getDb();
export function buildPageTree(
  pages: Page[],
  translationsMap: Map<number, PageTranslation[]>,
  parentId: number | null = null
): PageTreeNode[] {
  const filteredPages = pages
    .filter((page) => page.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((page) => {
      const pageTranslations = translationsMap.get(page.id) || [];
      const translationStatuses = pageTranslations.map(t => ({
        locale: t.locale,
        published: t.published,
        hasContent: t.content !== null,
      }));

      return {
        id: String(page.id),
        title: page.title,
        slug: page.slug,
        isDraft: page.isDraft,
        showOnMenu: page.showOnMenu,
        translations: translationStatuses,
        children: buildPageTree(pages, translationsMap, page.id),
      };
    });

  return filteredPages;
}

/**
 * Get all pages organized as a tree structure
 */
export async function getPagesTree(): Promise<PageTreeNode[]> {
  const allPages = await db.select().from(pages).orderBy(pages.sortOrder);
  
  // Fetch all translations and group by pageId
  const allTranslations = await db.select().from(pageTranslations);
  const translationsMap = new Map<number, PageTranslation[]>();
  
  allTranslations.forEach(translation => {
    const pageId = translation.pageId;
    if (!translationsMap.has(pageId)) {
      translationsMap.set(pageId, []);
    }
    translationsMap.get(pageId)!.push(translation);
  });
  
  return buildPageTree(allPages, translationsMap, null);
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
 * Get a page by its full path (e.g., "about/team" or "home")
 */
export async function getPageByFullPath(fullPath: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.fullPath, fullPath))
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
 * Check if a page is the landing page (singleton "home" page)
 */
export function isLandingPage(page: Pick<Page, "slug">): boolean {
  return page.slug === "home";
}

/**
 * Get all published translations for a page
 */
export async function getPublishedTranslationsForPage(pageId: number) {
  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, pageId));

  return translations.filter(t => t.published);
}

/**
 * Find the best fallback translation for a page
 * Priority: English -> first published translation
 */
export async function findFallbackTranslation(pageId: number, currentLocale: string) {
  const translations = await db
    .select()
    .from(pageTranslations)
    .where(eq(pageTranslations.pageId, pageId));

  // Filter to only published translations
  const publishedTranslations = translations.filter(t => t.published);

  if (publishedTranslations.length === 0) {
    return null;
  }

  // First, try to find English translation
  const englishTranslation = publishedTranslations.find(t => t.locale === 'en');
  if (englishTranslation) {
    return englishTranslation;
  }

  // Otherwise, return the first published translation
  return publishedTranslations[0];
}

/**
 * Get page content with fallback logic
 * Returns null if no published translation exists
 */
export async function getPageContentWithFallback(pageId: number, locale: string) {
  const [translation] = await db
    .select()
    .from(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.locale, locale)
      )
    )
    .limit(1);

  // If translation exists and is published, return it
  if (translation && translation.published) {
    return {
      translation,
      fallbackLocale: null,
    };
  }

  // If translation doesn't exist or is not published, find fallback
  const fallback = await findFallbackTranslation(pageId, locale);
  
  if (!fallback) {
    // No published translation exists
    return null;
  }

  return {
    translation: fallback,
    fallbackLocale: fallback.locale,
  };
}

/**
 * Get or create the landing page (singleton "home" page)
 * The landing page is treated as the root page for each locale (/en, /fa, etc.)
 */
export async function getOrCreateLandingPage() {
  // First, try to find an existing page with slug "home"
  let page = await getPageBySlug("home");

  if (!page) {
    // Create the landing page if it doesn't exist
    page = {...(await createPage({
      title: "Home",
      slug: "home",
      isDraft: false,
      showOnMenu: true,
      parentId: null,
      sortOrder: 0,
    })), translations: []};
  }

  return page;
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

  // If slug or parent changed, update fullPath for this page and all descendants
  if (data.slug !== undefined || data.parentId !== undefined) {
    await updateFullPathTree(id);
    
    // Return the page with updated fullPath
    const [pageWithFullPath] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);
    
    return pageWithFullPath;
  }

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
      fullPath: data.slug, // Initial fullPath is just the slug
      isDraft: data.isDraft ?? true,
      showOnMenu: data.showOnMenu ?? true,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  // Update fullPath based on parent hierarchy
  await updatePageFullPath(newPage.id);

  // Return the page with updated fullPath
  const [pageWithFullPath] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, newPage.id))
    .limit(1);

  return pageWithFullPath;
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

/**
 * Get page content for a specific locale
 */
export async function getPageContent(pageId: number, locale: string) {
  const [translation] = await db
    .select()
    .from(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.locale, locale)
      )
    )
    .limit(1);

  if (!translation) {
    // Return empty content if translation doesn't exist
    return {
      title: "",
      content: { root: { props: {}, children: [] } },
      published: false,
    };
  }

  return {
    title: translation.title,
    content: translation.content || { root: { props: {}, children: [] } },
    published: translation.published,
  };
}

/**
 * Get page by slug with locale-specific content
 */
export async function getPageBySlugAndLocale(slug: string, locale: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!page) return null;

  // Get translation for this locale
  const [translation] = await db
    .select()
    .from(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, page.id),
        eq(pageTranslations.locale, locale)
      )
    )
    .limit(1);

  return {
    ...page,
    translation: translation || {
      title: page.title,
      content: { root: { props: {}, children: [] } },
      published: false,
    },
  };
}

/**
 * Generate the full path for a page by traversing up the parent chain
 * This is optimized to work with in-memory tree data
 */
async function generateFullPath(pageId: number): Promise<string> {
  const pathSegments: string[] = [];
  let currentId: number | null = pageId;

  // Traverse up the parent chain
  while (currentId !== null) {
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, currentId))
      .limit(1);

    if (!page) break;

    // Add the slug to the beginning of the path
    pathSegments.unshift(page.slug);
    currentId = page.parentId;
  }

  return pathSegments.join('/');
}

/**
 * Update the full path for a single page
 */
export async function updatePageFullPath(pageId: number) {
  const fullPath = await generateFullPath(pageId);
  
  await db
    .update(pages)
    .set({ fullPath })
    .where(eq(pages.id, pageId));
}

/**
 * Update full paths for a page and all its descendants
 * Call this when a page's slug or parent changes
 */
export async function updateFullPathTree(pageId: number) {
  // Update the page itself
  await updatePageFullPath(pageId);

  // Recursively update all descendants
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!page) return;

  // Get all children
  const children = await db
    .select()
    .from(pages)
    .where(eq(pages.parentId, pageId));

  // Recursively update each child's tree
  for (const child of children) {
    await updateFullPathTree(child.id);
  }
}

/**
 * Build a map of page IDs to their full paths from a tree structure
 * This is much more efficient than querying the database for each page
 */
export function buildFullPathMap(tree: PageTreeNode[], parentPath = ""): Map<string, string> {
  const pathMap = new Map<string, string>();

  function traverse(nodes: PageTreeNode[], currentPath: string) {
    for (const node of nodes) {
      const nodePath = currentPath ? `${currentPath}/${node.slug}` : node.slug;
      pathMap.set(node.id, nodePath);

      if (node.children && node.children.length > 0) {
        traverse(node.children, nodePath);
      }
    }
  }

  traverse(tree, parentPath);
  return pathMap;
}

/**
 * Get the full path for a page from the tree structure
 * Use this when you have the tree in memory (client-side or server-side with tree loaded)
 */
export function getFullPathFromTree(tree: PageTreeNode[], pageId: string): string | null {
  function findPath(nodes: PageTreeNode[], targetId: string, currentPath = ""): string | null {
    for (const node of nodes) {
      const nodePath = currentPath ? `${currentPath}/${node.slug}` : node.slug;
      
      if (node.id === targetId) {
        return nodePath;
      }
      
      if (node.children && node.children.length > 0) {
        const childPath = findPath(node.children, targetId, nodePath);
        if (childPath) return childPath;
      }
    }
    return null;
  }

  return findPath(tree, pageId);
}

/**
 * Update the full path for a page when only its slug changes
 * This is more efficient than rebuilding the entire tree
 */
export async function updateFullPathForSlugChange(pageId: number, newSlug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!page) {
    return;
  }

  // Get the parent's full path (if exists)
  let parentFullPath = "";
  if (page.parentId) {
    const [parent] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, page.parentId))
      .limit(1);
    
    if (parent) {
      parentFullPath = parent.fullPath ? `${parent.fullPath}/` : "";
    }
  }

  // Update the page's fullPath
  const newFullPath = `${parentFullPath}${newSlug}`;
  
  await db
    .update(pages)
    .set({ fullPath: newFullPath })
    .where(eq(pages.id, pageId));

  // Update all descendants by replacing the old path prefix with new path
  const oldFullPath = page.fullPath;
  
  const descendants = await db
    .select()
    .from(pages)
    .where(like(pages.fullPath, `${oldFullPath}/%`));

  for (const descendant of descendants) {
    const newDescendantPath = descendant.fullPath.replace(
      `${oldFullPath}/`,
      `${newFullPath}/`
    );
    
    await db
      .update(pages)
      .set({ fullPath: newDescendantPath })
      .where(eq(pages.id, descendant.id));
  }
}

/**
 * Update full paths for all pages in a tree
 * Call this after reordering pages to update the database in a single batch
 */
export async function updateFullPathsForTree(tree: PageTreeNode[]) {
  const pathMap = buildFullPathMap(tree);

  // Update pages sequentially to avoid SQLite locking issues
  let successCount = 0;
  let failureCount = 0;
  
  for (const [pageId, fullPath] of pathMap.entries()) {
    try {
      const numericId = parseInt(pageId, 10);
      
      const result = await db
        .update(pages)
        .set({ fullPath })
        .where(eq(pages.id, numericId))
        .returning();
      
      if (result.length > 0) {
        successCount++;
      } else {
        failureCount++;
      }
    } catch (error) {
      failureCount++;
    }
  }
  
  if (failureCount > 0) {
    throw new Error(`Failed to update ${failureCount} page(s) out of ${pathMap.size}`);
  }

  return { successCount, failureCount };
}
