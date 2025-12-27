import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleLayoutClient } from "@/components/locale-layout-client";
import { getMenuTree } from "@/lib/page-tree";
import { getSiteSettings } from "@/lib/site-settings";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "fa" ? "rtl" : "ltr";

  // Fetch menu data server-side
  const [menuItems, settings] = await Promise.all([
    getMenuTree(locale),
    getSiteSettings(),
  ]);

  return (
    <NextIntlClientProvider locale={locale}>
      {/* Wrapper div with lang and dir for proper RTL support */}
      <div lang={locale} dir={dir} className="min-h-screen">
        <LocaleLayoutClient 
          locale={locale}
          menuItems={menuItems}
          siteName={settings?.siteName || { en: "Pucked", fa: "پاکد" }}
          logoUrl={settings?.logoUrl || ""}
          settings={settings}
        >
          {children}
        </LocaleLayoutClient>
      </div>
    </NextIntlClientProvider>
  );
}