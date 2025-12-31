import type { Config } from "@measured/puck";
import type { ComponentProps, RootProps } from "@/types/puck";
import { HeadingBlock } from "./components/blocks/heading-block";
import { GridBlock } from "./components/blocks/grid-block";
import { LinkBlock } from "./components/blocks/link-block";
import { TipTapBlock } from "./components/admin/tip-tap-block";
import { SpacerBlock } from "./components/blocks/spacer-block";
import { ImageBlock } from "./components/blocks/image-block";

// Simple preview navbar (no intl context dependency)
function PreviewNavbar({ locale }: { locale: string }) {
  const isRTL = locale === "fa";
  const siteName = locale === "fa" ? "پاکد" : "Pucked";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="text-xl font-bold">{siteName}</span>
        </div>
        <nav className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            {locale === "fa" ? "خانه" : "Home"}
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            {locale === "fa" ? "درباره ما" : "About"}
          </a>
        </nav>
      </div>
    </header>
  );
}

// Simple preview footer (no intl context dependency)
function PreviewFooter({ locale }: { locale: string }) {
  const isRTL = locale === "fa";
  const currentYear = new Date().getFullYear();
  const siteName = locale === "fa" ? "پاکد" : "Pucked";
  const copyrightText = locale === "fa"
    ? `© ${currentYear} پاکد. تمامی حقوق محفوظ است.`
    : `© ${currentYear} Pucked. All rights reserved.`;

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-lg font-semibold mb-4">{siteName}</h3>
            <p className="text-sm text-muted-foreground">
              {copyrightText}
            </p>
          </div>

          {/* Quick Links */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h4 className="text-sm font-semibold mb-4">
              {locale === "fa" ? "لینک‌های سریع" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {locale === "fa" ? "خانه" : "Home"}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {locale === "fa" ? "درباره ما" : "About"}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {locale === "fa" ? "تماس" : "Contact"}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h4 className="text-sm font-semibold mb-4">
              {locale === "fa" ? "شبکه‌های اجتماعی" : "Social Links"}
            </h4>
            <div className={`flex gap-4 ${isRTL ? "justify-end" : "justify-start"}`}>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-center text-muted-foreground">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

// Create a config factory that accepts locale and preview mode
export function getConfig(locale: string = "en", isPreview: boolean = false): Config<ComponentProps, RootProps> {
  return {
  categories: {
    typography: {
      title: "Typography",
      components: ["HeadingBlock"],
    },
    layout: {
      title: "Layout",
      components: ["GridBlock", "SpacerBlock"],
    },
    content: {
      title: "Content",
      components: ["TipTapBlock", "ImageBlock"],
    },
    links: {
      title: "Links",
      components: ["LinkBlock"],
    },
  },
  components: {
    HeadingBlock,
    GridBlock,
    LinkBlock,
    TipTapBlock,
    SpacerBlock,
    ImageBlock,
  },
  root: {
    fields: {
      title: { type: "text" },
      published: {
        type: "radio",
        options: [
          { label: "Published", value: true },
          { label: "Draft", value: false },
        ]
      },
      showNavbar: {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
        label: "Show Navbar",

      },
      showFooter: {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
        label: "Show Footer",
      },
    },
    defaultProps: {
      published: false,
      showNavbar: true,
      showFooter: true,
    },
    render: ({ children }) => {
      const dir = locale === "fa" ? "rtl" : "ltr";

      // In preview mode (admin editor), show full layout with navbar/footer
      if (isPreview) {
        return (
          <div dir={dir} className="min-h-screen flex flex-col">
            <PreviewNavbar locale={locale} />
            <main className="flex-1 mx-auto prose md:prose-lg md:max-w-xl lg:max-w-2xl px-4 py-8 w-full">
              {children}
            </main>
            <PreviewFooter locale={locale} />
          </div>
        );
      }

      // For guest pages, just render content - no wrapper
      // Layout (navbar/footer, prose styling) is handled by Next.js layout
      return <>{children}</>;
    },
  }
};
}

// Export a default config for backwards compatibility
export const config = getConfig();

export default config;