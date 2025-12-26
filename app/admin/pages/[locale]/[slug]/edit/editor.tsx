"use client";

import { Puck, Config } from "@measured/puck";
import { useActionState, useTransition } from "react";
import { savePageContent } from "@/app/actions";

type EditorProps = {
  pageId: number;
  locale: string;
  initialTitle: string;
  initialContent: any;
};

type FormState = {
  errors?: {
    title?: string[];
    _form?: string[];
  };
  success: boolean;
};

const initialState: FormState = {
  success: false,
};

// Create Puck component config
const config: Config<any> = {
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: "text",
        },
      },
      render: ({ children }) => {
        return <h1>{children}</h1>;
      },
    },
  },
};

export default function Editor({
  pageId,
  locale,
  initialTitle,
  initialContent,
}: EditorProps) {
  const boundAction = savePageContent.bind(null, pageId, locale) as (prevState: FormState, formData: FormData) => Promise<FormState>;
  const [state, formAction] = useActionState(boundAction, initialState);
  const [isPending, startTransition] = useTransition();

  const handlePublish = (data: any) => {
    // Create form data with title and content
    const formData = new FormData();
    formData.append("title", initialTitle);
    formData.append("content", JSON.stringify(data));

    // Use startTransition to properly handle the async action
    startTransition(() => {
      (formAction as (formData: FormData) => void)(formData);
    });
  };

  return (
    <div className="h-screen">
      <Puck
        config={config}
        data={initialContent}
        onPublish={handlePublish}
      />
      {state.errors && "_form" in state.errors && (
        <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            {state.errors._form?.[0]}
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
  );
}