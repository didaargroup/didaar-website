import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/route-guard";
import { getDb } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { user } = await requireAuth();
    const db = getDb();

    const allPages = await db.query.pages.findMany({
      with: {
        translations: {
          where: eq(pageTranslations.locale, "en"),
        },
      },
      orderBy: (pages, { asc }) => [asc(pages.sortOrder)],
    });

    // Transform into options for select field
    const pageOptions = allPages
      .filter((page) => page.translations.length > 0)
      .map((page) => {
        const translation = page.translations[0];
        return {
          label: translation.title || page.slug,
          value: page.fullPath || `/${page.slug}`,
        };
      });

    // Add home page if not present
    if (!pageOptions.some((opt) => opt.value === "/")) {
      pageOptions.unshift({ label: "Home", value: "/" });
    }

    return NextResponse.json(pageOptions);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
