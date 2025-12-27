"use client";

import { usePageSelection } from "@/components/admin/page-selection-context";
import { Button } from "@measured/puck";
import { Plus, Globe } from "lucide-react";
import Link from "next/link";

interface TranslationStatus {
  locale: string;
  published: boolean;
  hasContent: boolean;
}

interface SidebarTranslationsProps {
  translations?: TranslationStatus[];
}

export function SidebarTranslations({ translations = [] }: SidebarTranslationsProps) {
  const { selectedPage } = usePageSelection();

  if (!selectedPage) {
    return null;
  }

  const pageSlug = selectedPage.slug || selectedPage.id;
  const availableLocales = ["en", "fa"];
  const existingLocales = new Set(translations.map((t) => t.locale));
  const missingLocales = availableLocales.filter((locale) => !existingLocales.has(locale));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ paddingBottom: "8px", borderBottom: "1px solid var(--puck-color-grey-09)" }}
      >
        <Globe className="w-4 h-4" />
        <h3
          className="text-sm font-semibold"
          style={{ fontSize: "var(--puck-font-size-s)", fontWeight: 500 }}
        >
          Translations
        </h3>
      </div>

      {/* Existing translations */}
      {translations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p
            className="text-xs"
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
          >
            Existing translations
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {translations.map((translation) => (
              <div
                key={translation.locale}
                className="flex items-center justify-between"
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  background: "var(--puck-color-white)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ fontSize: "var(--puck-font-size-s)", fontWeight: 500, color: "var(--puck-color-grey-01)" }}
                  >
                    {translation.locale === "en" ? "English" : "Farsi"}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontSize: "var(--puck-font-size-xs)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: translation.published
                        ? "var(--puck-color-azure-01)"
                        : "var(--puck-color-grey-08)",
                      color: translation.published
                        ? "var(--puck-color-azure-11)"
                        : "var(--puck-color-grey-12)",
                    }}
                  >
                    {translation.published ? "Published" : "Draft"}
                  </span>
                </div>
                <Link href={`/admin/pages/${translation.locale}/${pageSlug}/edit`}>
                  <Button variant="secondary" size="small">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing translations */}
      {missingLocales.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p
            className="text-xs"
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
          >
            Create translation
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {missingLocales.map((locale) => (
              <Link
                key={locale}
                href={`/admin/pages/${locale}/${pageSlug}/edit`}
                style={{ display: "block", width: "100%" }}
              >
                <Button variant="secondary" size="small" fullWidth>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {locale === "en" ? "English" : "Farsi"}
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No translations message */}
      {translations.length === 0 && missingLocales.length === 0 && (
        <p
          className="text-xs text-center"
          style={{
            fontSize: "var(--puck-font-size-xs)",
            color: "var(--puck-color-grey-07)",
            padding: "16px 0",
            textAlign: "center",
          }}
        >
          No translations available
        </p>
      )}
    </div>
  );
}
