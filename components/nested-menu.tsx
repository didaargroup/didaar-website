"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  title: string;
  slug: string;
  fullPath: string;
  children: MenuItem[];
}

interface NestedMenuProps {
  items: MenuItem[];
  isMobile?: boolean;
  onItemClick?: () => void;
}

// Normalize slug: convert "home" to "/"
const normalizeSlug = (slug: string) => {
  return slug.startsWith("home") ? slug.replace("home", "/") : slug;
};

export function NestedMenu({ items, isMobile = false, onItemClick }: NestedMenuProps) {
  const locale = useLocale();
  const isRTL = locale === "fa";

  if (isMobile) {
    return <MobileMenuItems items={items} onItemClick={onItemClick} />;
  }

  return (
    <div className="flex items-center gap-2 rtl:space-x-reverse">
      {items.map((item) => (
        <MenuItemDesktop
          key={item.id}
          item={item}
          isRTL={isRTL}
        />
      ))}
    </div>
  );
}

function MenuItemDesktop({ item, isRTL }: { item: MenuItem; isRTL: boolean }) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={normalizeSlug(item.fullPath || `/${item.slug}`)}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 text-sm font-medium text-muted-foreground",
          "hover:text-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "rounded-md px-2 py-1"
        )}
      >
        <span>{item.title}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        className="min-w-50"
      >
        {item.children?.map((child, index) => (
          <React.Fragment key={child.id}>
            <DropdownMenuItem asChild>
              <Link
                href={normalizeSlug(child.fullPath || `/${child.slug}`)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center",
                  "rounded-sm px-2 py-1.5 text-sm outline-none",
                  "focus:bg-accent focus:text-accent-foreground",
                  "data-disabled:pointer-events-none data-disabled:opacity-50"
                )}
              >
                <span className="flex-1">{child.title}</span>
                {child.children && child.children.length > 0 && (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
              </Link>
            </DropdownMenuItem>
            {child.children && child.children.length > 0 && (
              <NestedSubmenuItems items={child.children} parentPath={child.fullPath || `/${child.slug}`} />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NestedSubmenuItems({ items, parentPath }: { items: MenuItem[]; parentPath: string }) {
  return (
    <>
      {items.map((child) => (
        <React.Fragment key={child.id}>
          <DropdownMenuItem asChild>
            <Link
              href={child.fullPath || `${parentPath}/${child.slug}`}
              className={cn(
                "relative flex cursor-pointer select-none items-center",
                "rounded-sm px-2 py-1.5 text-sm outline-none",
                "focus:bg-accent focus:text-accent-foreground",
                "data-disabled:pointer-events-none data-disabled:opacity-50",
                "pl-6"
              )}
            >
              <span className="flex-1">{child.title}</span>
              {child.children && child.children.length > 0 && (
                <ChevronRight className="h-4 w-4 opacity-50" />
              )}
            </Link>
          </DropdownMenuItem>
          {child.children && child.children.length > 0 && (
            <NestedSubmenuItems
              items={child.children}
              parentPath={child.fullPath || `${parentPath}/${child.slug}`}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function MobileMenuItems({ items, onItemClick }: { items: MenuItem[]; onItemClick?: () => void }) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col space-y-1">
      {items.map((item) => (
        <MobileMenuItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

function MobileMenuItem({
  item,
  isOpen,
  onToggle,
  onItemClick,
}: {
  item: MenuItem;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const locale = useLocale();
  const isRTL = locale === "fa";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Link
          href={item.fullPath || `/${item.slug}`}
          onClick={() => {
            onItemClick?.();
          }}
          className="flex-1 text-base font-medium hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-accent"
        >
          {item.title}
        </Link>
        {hasChildren && (
          <button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 border-l-2 rtl:border-l-0 rtl:border-r-2 border-muted ml-2 rtl:ml-0 rtl:mr-2">
          {item.children?.map((child) => (
            <MobileMenuItem
              key={child.id}
              item={child}
              isOpen={false}
              onToggle={() => {}}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
