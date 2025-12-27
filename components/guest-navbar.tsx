"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./guest-language-switcher";
import { NestedMenu } from "./nested-menu";

interface MenuItem {
  id: number;
  title: string;
  slug: string;
  fullPath: string;
  children: any[];
}

interface GuestNavbarProps {
  menuItems: MenuItem[];
  siteName: { en: string; fa: string };
  logoUrl: string;
}

export function GuestNavbar({ menuItems, siteName, logoUrl }: GuestNavbarProps) {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = locale === "fa";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Site Name */}
          <Link
            href="/"
            className={`flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity`}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt={siteName[locale as keyof typeof siteName] || siteName.en}
                className="h-8 w-8"
              />
            )}
            <span className="text-xl font-bold">
              {siteName[locale as keyof typeof siteName] || siteName.en}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <NestedMenu items={menuItems} />
          </div>

          {/* Desktop Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden space-x-2 rtl:space-x-reverse">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("menu")}>
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-[300px] sm:w-[400px]"
              >
                <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
                <div className="flex flex-col space-y-4 mt-8">
                  <NestedMenu
                    items={menuItems}
                    isMobile={true}
                    onItemClick={() => setIsOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
