import type { ComponentConfig } from "@measured/puck";
import { getTextDirection } from "@/lib/text-direction";
import { RTLTextInput } from "@/components/admin/rtl-text-input";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { usePageTree } from "@/contexts/page-tree-context";
import type { PageTreeNode } from "@/lib/page";
import { memo, useCallback } from "react";

// Flatten pages tree into select options
function flattenPagesTree(nodes: PageTreeNode[], depth = 0): Array<{ label: string; value: string }> {
  const result: Array<{ label: string; value: string }> = [];

  for (const node of nodes) {
    const prefix = depth > 0 ? "  ".repeat(depth) + "└ " : "";
    result.push({
      label: `${prefix}${node.title} (${node.slug})`,
      value: node.slug,
    });

    if (node.children && node.children.length > 0) {
      result.push(...flattenPagesTree(node.children, depth + 1));
    }
  }

  return result;
}

// Page selector using PageTreeContext
const PageSelector = memo(function PageSelector({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const { pagesTree } = usePageTree();
  const pageOptions = flattenPagesTree(pagesTree);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
    >
      <option value="">Select a page</option>
      {pageOptions.map((page) => (
        <option key={page.value} value={page.value}>
          {page.label}
        </option>
      ))}
    </select>
  );
});

// Stable render functions to prevent re-renders
const renderLabelField = ({ name, value, onChange }: any) => {
  return (
    <RTLTextInput
      name={name}
      value={value || ""}
      onChange={onChange}
      label="Link Label"
      placeholder="Enter link label..."
    />
  );
};

const renderPageSelector = ({ name, value, onChange }: any) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Page
      </label>
      <PageSelector value={value || ""} onChange={onChange} />
    </div>
  );
};

export const LinkBlock: ComponentConfig<{
  linkType: "internal" | "external";
  href?: string;
  pageId?: string;
  label: string;
  openInNewTab?: boolean | string;
}> = {
  fields: {
    linkType: {
      type: "radio",
      options: [
        { label: "Internal Page", value: "internal" },
        { label: "External URL", value: "external" },
      ],
    },
    label: {
      type: "custom",
      render: renderLabelField,
    },
    openInNewTab: {
      type: "select",
      options: [
        { label: "No", value: "false" },
        { label: "Yes", value: "true" },
      ],
    },
  },
  defaultProps: {
    linkType: "external",
    href: "#",
    label: "Link",
    openInNewTab: false,
  },
  resolveFields: (data) => {
    const baseFields = {
      linkType: {
        type: "radio" as const,
        options: [
          { label: "Internal Page", value: "internal" },
          { label: "External URL", value: "external" },
        ],
      },
      label: {
        type: "custom" as const,
        render: renderLabelField,
      },
      openInNewTab: {
        type: "select" as const,
        options: [
          { label: "No", value: "false" },
          { label: "Yes", value: "true" },
        ],
      },
    };

    // Show different fields based on link type
    if (data.props.linkType === "internal") {
      return {
        ...baseFields,
        pageId: {
          type: "custom" as const,
          render: renderPageSelector,
        },
      };
    }

    // External link
    return {
      ...baseFields,
      href: {
        type: "text" as const,
        label: "URL",
      },
    };
  },
  render: ({ linkType, href, pageId, label, openInNewTab }) => {
    const dir = getTextDirection(label);
    // Handle both string (from select) and boolean types
    const shouldOpenInNewTab = openInNewTab === "true" || openInNewTab === true;

    // Use pageId for internal links, href for external
    const linkHref = linkType === "internal" ? `/${pageId || ""}` : (href || "#");

    return (
      <a
        href={linkHref}
        target={shouldOpenInNewTab ? "_blank" : undefined}
        rel={shouldOpenInNewTab ? "noopener noreferrer" : undefined}
        dir={dir}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md group"
      >
        <LinkIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
        <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {linkType === "external" && shouldOpenInNewTab && (
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
        )}
      </a>
    );
  },
};
