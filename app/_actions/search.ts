"use server";

import { getDb } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Fuse from "fuse.js";
import type { PuckData } from "@/types/puck";

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  fullPath: string;
  locale: string;
  excerpt?: string;
}

export type FormState = {
  errors?: {
    query?: string[];
    _form?: string[];
  };
  success?: boolean;
};

/**
 * Search pages by title and content using Fuse.js for fuzzy search
 */
export async function searchPages(query: string, locale: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const db = getDb();
  // Get all published pages with translations for the current locale
  const results = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      fullPath: pages.fullPath,
      locale: pageTranslations.locale,
      content: pageTranslations.content,
      published: pageTranslations.published,
    })
    .from(pages)
    .innerJoin(pageTranslations, eq(pageTranslations.pageId, pages.id))
    .where(
      and(
        eq(pageTranslations.locale, locale),
        eq(pageTranslations.published, true)
      )
    );

  // Prepare data for Fuse.js by extracting text from Puck content
  const searchableResults = results.map((item) => ({
    ...item,
    // Extract text content from Puck JSON for searching
    contentText: extractTextFromPuckData(item.content as unknown as PuckData),
  }));

  // Create Fuse.js instance for fuzzy search
  const fuse = new Fuse(searchableResults, {
    keys: [
      {
        name: "title",
        weight: 2, // Title matches are more important
      },
      {
        name: "contentText",
        weight: 1,
      },
    ],
    includeScore: true,
    threshold: 0.4, // Adjust this for more/less strict matching (0.0 = perfect, 1.0 = match anything)
    ignoreLocation: true,
  });

  // Perform fuzzy search
  const searchResults = fuse.search(query);

  // Transform results to our format
  return searchResults
    .filter((result) => result.score !== undefined && result.score < 0.6) // Filter out poor matches
    .map((result) => {
      const item = result.item;
      // Create a brief excerpt from content
      let excerpt: string | undefined;
      if (item.contentText && item.contentText.length > 0) {
        const queryIndex = item.contentText.toLowerCase().indexOf(query.toLowerCase());
        if (queryIndex !== -1) {
          // Show context around the match
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(item.contentText.length, queryIndex + 100);
          excerpt = (start > 0 ? "..." : "") + item.contentText.substring(start, end) + (end < item.contentText.length ? "..." : "");
        } else {
          excerpt = item.contentText.substring(0, 150) + (item.contentText.length > 150 ? "..." : "");
        }
      }

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        fullPath: item.fullPath,
        locale: item.locale,
        excerpt,
      };
    })
    .slice(0, 10); // Limit to 10 results
}

/**
 * Extract text content from Puck page data
 */
function extractTextFromPuckData(data: PuckData | null | undefined): string {
  if (!data || typeof data !== 'object') return '';

  const textParts: string[] = [];

  // Extract from content array (main page content)
  if (data.content && Array.isArray(data.content)) {
    textParts.push(...data.content.map((item) => extractTextFromComponent(item)));
  }

  // Extract from zones (if any)
  if (data.zones && typeof data.zones === 'object') {
    Object.values(data.zones).forEach((zone) => {
      if (Array.isArray(zone)) {
        textParts.push(...zone.map((item) => extractTextFromComponent(item)));
      }
    });
  }

  // Extract from root props
  if (data.root?.props) {
    const rootProps = data.root.props;
    if (rootProps.title) textParts.push(rootProps.title);
    if (rootProps.description) textParts.push(rootProps.description);
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract text from a single Puck component
 */
function extractTextFromComponent(item: any): string {
  if (!item || typeof item !== 'object') return '';

  const textParts: string[] = [];

  // Extract from props based on component type
  if (item.props) {
    const props = item.props;

    // Common text properties
    if (props.title) textParts.push(String(props.title));
    if (props.text) textParts.push(String(props.text));
    if (props.label) textParts.push(String(props.label));
    if (props.caption) textParts.push(String(props.caption));
    if (props.alt) textParts.push(String(props.alt));
    if (props.description) textParts.push(String(props.description));

    // For TipTapBlock, content is HTML - strip tags
    if (item.type === 'TipTapBlock' && props.content) {
      const text = stripHtmlTags(props.content);
      textParts.push(text);
    }
    // For other content props that might contain HTML
    else if (props.content && typeof props.content === 'string') {
      // Check if content looks like HTML
      if (props.content.includes('<')) {
        const text = stripHtmlTags(props.content);
        textParts.push(text);
      } else {
        textParts.push(props.content);
      }
    }
  }

  return textParts.join(' ');
}

/**
 * Strip HTML tags from text and decode HTML entities
 */
function stripHtmlTags(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode common HTML entities
  const htmlEntities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#34;': '"',
  };
  
  text = text.replace(/&[a-z]+;/gi, (entity) => htmlEntities[entity] || entity);
  text = text.replace(/&#\d+;/g, (entity) => {
    const code = parseInt(entity.slice(2, -1));
    return String.fromCharCode(code);
  });
  
  // Clean up extra whitespace
  return text.replace(/\s+/g, ' ').trim();
}
