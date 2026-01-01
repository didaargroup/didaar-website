"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, X, Search } from "lucide-react";
import { LanguageSwitcher } from "./guest-language-switcher";
import { NestedMenu } from "./nested-menu";
import { searchPages, type SearchResult } from "@/app/_actions";
import { cn } from "@/lib/utils";

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
  const tSearch = useTranslations("Search");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const isRTL = locale === "fa";

  // Handle search input
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await searchPages(query, locale);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Hide search results when clicking outside
  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo, Site Name and Desktop Menu */}
          <div className="flex items-center gap-6 flex-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity`}
            >
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={siteName[locale as keyof typeof siteName] || siteName.en}
                  className="h-8 w-8 mr-2 rtl:mr-0 rtl:ml-2"
                />
              )}
              <span className="text-xl font-bold">
                {siteName[locale as keyof typeof siteName] || siteName.en}
              </span>
            </Link>
            <div className="hidden md:flex md:items-center">
              <NestedMenu items={menuItems} />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <InputGroup>
              <InputGroupInput
                placeholder={tSearch("placeholder")}
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
              />
              {isSearching && (
                <InputGroupAddon align="inline-end">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </InputGroupAddon>
              )}
              <InputGroupAddon className="px-2">
                <Search className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {tSearch("noResults", { query: searchQuery })}
                  </div>
                ) : (
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      {tSearch("resultsFound", { count: searchResults.length })}
                    </p>
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/${result.fullPath}`}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }}
                        className="flex flex-col items-start gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{result.title}</span>
                        </div>
                        {result.excerpt && (
                          <p className="line-clamp-2 text-xs text-muted-foreground pr-5">
                            {result.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: Language Switcher and Mobile Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("menu")} className="md:hidden">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-[300px] sm:w-[400px]"
              >
                <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search Input */}
                  <InputGroup>
                    <InputGroupInput
                      placeholder={tSearch("placeholder")}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <InputGroupAddon>
                      <Search className="h-4 w-4" />
                    </InputGroupAddon>
                  </InputGroup>

                  {/* Mobile Search Results */}
                  {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length > 0 && (
                    <div className="border rounded-lg p-2 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <Link
                          key={result.id}
                          href={`/${result.fullPath}`}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setShowSearchResults(false);
                            setIsOpen(false);
                          }}
                          className="flex flex-col items-start gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span className="font-medium">{result.title}</span>
                          {result.excerpt && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {result.excerpt}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}

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
