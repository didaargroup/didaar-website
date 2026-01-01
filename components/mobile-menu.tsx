"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  title: string;
  slug: string;
  fullPath: string;
  children: MenuItem[];
}

interface MobileMenuProps {
  items: MenuItem[];
  onItemClick?: () => void;
}

// Normalize slug: convert "home" to "/"
const normalizeSlug = (slug: string) => {
  return slug.startsWith("home") ? slug.replace("home", "/") : slug;
};

export function MobileMenu({ items, onItemClick }: MobileMenuProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}

function MenuItem({ item, onItemClick, level = 0 }: { item: MenuItem; onItemClick?: () => void; level?: number }) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={normalizeSlug(item.fullPath || `/${item.slug}`)}
        onClick={onItemClick}
        className={cn(
          "block px-3 py-2.5 rounded-md text-sm font-medium",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          level > 0 && "text-muted-foreground"
        )}
        style={{ paddingLeft: `${0.75 + level * 1}rem`, paddingRight: `0.75rem` }}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <Accordion type="single" collapsible className="border-none">
      <AccordionItem value={item.id.toString()} className="border-none">
        <div className="group flex items-center gap-1">
          <Link
            href={normalizeSlug(item.fullPath || `/${item.slug}`)}
            onClick={onItemClick}
            className={cn(
              "flex-1 px-3 py-2.5 rounded-md text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              level > 0 && "text-muted-foreground"
            )}
            style={{ paddingLeft: `${0.75 + level * 1}rem` }}
          >
            {item.title}
          </Link>
          <AccordionTrigger className="h-auto px-3 py-2.5 hover:no-underline hover:bg-accent rounded-md transition-colors [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
          </AccordionTrigger>
        </div>
        <AccordionContent className="pb-1 pt-1">
          <div className="space-y-1">
            {item.children?.map((child) => (
              <MenuItem
                key={child.id}
                item={child}
                onItemClick={onItemClick}
                level={level + 1}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
