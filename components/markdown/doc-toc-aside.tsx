"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface HeadingGroup {
  heading: Heading;
  children: Heading[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function DocTocAside({ content }: { content: string }) {
  const [headings, setHeadings] = useState<HeadingGroup[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simple regex to extract headings (h2/h3)
    const lines = content.split("\n");
    const found: Heading[] = [];
    for (const line of lines) {
      const h2 = /^##\s+(.+)/.exec(line);
      if (h2) found.push({ id: slugify(h2[1]), text: h2[1], level: 2 });
      const h3 = /^###\s+(.+)/.exec(line);
      if (h3) found.push({ id: slugify(h3[1]), text: h3[1], level: 3 });
    }

    // Group headings: h2 as parent, h3 as children
    const grouped: HeadingGroup[] = [];
    let currentGroup: HeadingGroup | null = null;

    for (const heading of found) {
      if (heading.level === 2) {
        if (currentGroup) {
          grouped.push(currentGroup);
        }
        currentGroup = { heading, children: [] };
      } else if (heading.level === 3 && currentGroup) {
        currentGroup.children.push(heading);
      }
    }
    if (currentGroup) {
      grouped.push(currentGroup);
    }

    setHeadings(grouped);

    // Expand all sections by default
    setExpandedSections(new Set(grouped.map(g => g.heading.id)));
  }, [content]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!headings.length) {
    return (
      <div className="sticky top-32 p-4 rounded-lg border bg-muted/50 text-muted-foreground text-xs">
        No headings found in this document.
      </div>
    );
  }

  return (
    <nav className="sticky top-32 p-4 rounded-lg border bg-muted/50">
      <div className="text-muted-foreground text-sm font-semibold mb-3">On this page</div>
      <ul className="space-y-1">
        {headings.map((group) => (
          <li key={group.heading.id}>
            <div className="flex items-start">
              {group.children.length > 0 && (
                <button
                  onClick={() => toggleSection(group.heading.id)}
                  className="flex-none p-0.5 mr-1 rounded hover:bg-muted-foreground/10 transition-colors"
                  aria-label={expandedSections.has(group.heading.id) ? "Collapse" : "Expand"}
                >
                  {expandedSections.has(group.heading.id) ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <a
                href={`#${group.heading.id}`}
                className="block text-sm font-medium hover:text-primary transition-colors flex-1"
              >
                {group.heading.text}
              </a>
            </div>
            {group.children.length > 0 && expandedSections.has(group.heading.id) && (
              <ul className="mt-1 space-y-1 ml-4">
                {group.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}