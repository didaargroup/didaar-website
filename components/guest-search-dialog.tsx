"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { searchPages, type SearchResult } from "@/app/_actions";
import { useKeyboardShortcut } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestSearchDialogProps {
  locale: string;
}

export function GuestSearchDialog({ locale }: GuestSearchDialogProps) {
  const t = useTranslations("Search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Open dialog with Cmd+K / Ctrl+K shortcut
  useKeyboardShortcut("k", () => {
    setOpen((prev) => !prev);
  }, { ctrlKey: true, metaKey: true });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // Return focus to trigger button
      triggerRef.current?.focus();
    }
  }, [open]);

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setSelectedIndex(0);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchPages(query, locale);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [query, locale]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [results, selectedIndex]
  );

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the page
    router.push(`/${result.fullPath}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          aria-label={t("title")}
          className="relative"
        >
          <Search className="h-5 w-5" />
          <kbd
            className={cn(
              "pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex",
              locale === "fa" ? "left-1 right-auto" : "right-1"
            )}
          >
            <span className={locale === "fa" ? "text-[9px]" : "text-xs"}>⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={t("placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-14 w-full rounded-none border-0 bg-transparent px-3 py-5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {query.trim().length < 2 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t("minChars")}
                </p>
              </div>
            )}

            {!isSearching && query.trim().length >= 2 && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t("noResults", { query })}
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {t("resultsFound", { count: results.length })}
                </p>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-2 py-3 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{result.title}</span>
                    </div>
                    {result.excerpt && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {result.excerpt}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          {results.length > 0 && (
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <kbd className="rounded border bg-muted px-1.5 py-0.5">
                  ↑↓
                </kbd>
                <span>{t("keyboardHints.navigate")}</span>
              </div>
              <div className="flex items-center gap-4">
                <kbd className="rounded border bg-muted px-1.5 py-0.5">
                  ↵
                </kbd>
                <span>{t("keyboardHints.select")}</span>
              </div>
              <div className="flex items-center gap-4">
                <kbd className="rounded border bg-muted px-1.5 py-0.5">
                  esc
                </kbd>
                <span>{t("keyboardHints.close")}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
