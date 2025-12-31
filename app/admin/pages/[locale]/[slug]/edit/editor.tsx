"use client";

import { Puck, Config, Button } from "@measured/puck";
import { useActionState, useTransition } from "react";
import { savePageContent } from "@/app/_actions";
import { logout } from "@/app/_actions/auth";
import { getConfig } from "@/puck.config";
import { LogOut, Wand } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { ComponentProps, RootProps } from "@/types/puck";
import type { PageTreeNode } from "@/lib/page";
import { PageTreeProvider } from "@/contexts/page-tree-context";

type EditorProps = {
  pageId: number;
  locale: string;
  initialTitle: string;
  initialContent: any;
  initialPublished: boolean;
  initialIsDraft: boolean;
  pagesTree: PageTreeNode[];
};

type FormState = {
  errors?: {
    title?: string[];
    _form?: string[];
  };
  success: boolean;
  published?: boolean;
  deleted?: boolean;
};

const initialState: FormState = {
  success: false,
};

export default function Editor({
  pageId,
  locale,
  initialTitle,
  initialContent,
  initialPublished,
  initialIsDraft,
  pagesTree,
}: EditorProps) {
  const boundAction = savePageContent.bind(null, pageId, locale) as (prevState: FormState, formData: FormData) => Promise<FormState>;
  const [state, formAction] = useActionState(boundAction, initialState);
  const [isPending, startTransition] = useTransition();
  const [published, setPublished] = React.useState(initialPublished);
  const [data, setData] = React.useState({
    ...initialContent,
    root: {
      ...initialContent.root,
      props: {
        ...initialContent.root?.props,
        title: initialTitle,
        published: initialPublished,
      },
    },
  });
  const router = useRouter();

  const handlePublish = (newData: any) => {
    // Update local data state
    setData(newData);

    // Read published status and title from the data structure (synced with root fields)
    const currentPublished = newData.root?.props?.published ?? published;
    const currentTitle = newData.root?.props?.title ?? initialTitle;

    // Create form data with title, content, and published status
    const formData = new FormData();
    formData.append("title", currentTitle);
    formData.append("content", JSON.stringify(newData));
    formData.append("published", currentPublished.toString());

    // Use startTransition to properly handle the async action
    startTransition(() => {
      (formAction as (formData: FormData) => void)(formData);
    });
  };

  const handleTogglePublish = async () => {
    const newPublished = !published;
    const currentTitle = data.root?.props?.title ?? initialTitle;
    const formData = new FormData();
    formData.append("title", currentTitle);
    formData.append("content", JSON.stringify(data));
    formData.append("published", newPublished.toString());
    formData.append("action", "toggle-publish");

    startTransition(() => {
      (formAction as (formData: FormData) => void)(formData);
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this translation? This action cannot be undone.")) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "delete");

    startTransition(() => {
      (formAction as (formData: FormData) => void)(formData);
    });
  };

  // Update published state when action completes
  React.useEffect(() => {
    if (state.published !== undefined) {
      setPublished(state.published);
    }
    if (state.deleted) {
      router.push("/admin");
    }
  }, [state.published, state.deleted, router]);

  // Get config with locale and preview mode
  const config = getConfig(locale, true);

  return (
    <PageTreeProvider initialTree={pagesTree}>
      <div className="h-screen" suppressHydrationWarning>
        <Puck
          config={config}
          data={data}
          onPublish={handlePublish}
          onChange={(newData) => setData(newData)}
          overrides={{
            headerActions: ({ children }) =>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="flex items-center text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                {children}
                <Button
                  variant="secondary"
                  icon={<LogOut style={{ width: "14px", height: "14px" }} />}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>,
          }}
        />
        {state.errors && ("_form" in state.errors || "title" in state.errors) && (
          <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              {state.errors._form?.[0] || state.errors.title?.[0] || "Validation failed"}
            </p>
          </div>
        )}
        {state.success && (
          <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              Page saved successfully!
            </p>
          </div>
        )}
      </div>
    </PageTreeProvider>
  );
}