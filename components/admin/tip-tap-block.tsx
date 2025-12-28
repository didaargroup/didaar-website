"use client";

import type { ComponentConfig } from "@measured/puck";
import TipTapEditor from "./tiptap-editor";

export const TipTapBlock: ComponentConfig<{
  content: string;
}> = {
  fields: {
    content: {
      type: "custom",
      render: ({ name, value, onChange, readOnly }) => {
        // Get locale from URL or context
        // In Puck editor, we can get it from window.location
        const getLocale = () => {
          if (typeof window !== "undefined") {
            const pathParts = window.location.pathname.split("/");
            const localeIndex = pathParts.findIndex((part) => part === "admin");
            if (localeIndex >= 0 && pathParts[localeIndex + 1]) {
              return pathParts[localeIndex + 1];
            }
          }
          return "en";
        };

        const locale = getLocale();

        if (readOnly) {
          return (
            <div
              className="prose prose-sm max-w-none p-4 border rounded-md bg-muted/20"
              dangerouslySetInnerHTML={{ __html: value || "" }}
            />
          );
        }

        return (
          <TipTapEditor
            content={value || ""}
            onChange={(html) => onChange(html)}
            locale={locale}
          />
        );
      },
    },
  },
  defaultProps: {
    content: "",
  },
  render: ({ content }) => {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  },
};
