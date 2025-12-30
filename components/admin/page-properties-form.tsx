"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Button } from "@measured/puck";
import { Trash2 } from "lucide-react";
import { deletePageAction, updatePageAction } from "@/app/actions";
import { Page } from "@/db/schema";
import type { PageWithTranslations } from "@/types";
import { useNotifications } from "@/contexts/notification-context";
import { usePageTree } from "@/contexts/page-tree-context";
import { usePageSelection } from "@/components/admin/page-selection-context";
import { useFormRegistry } from "../../lib/form-actions";

interface PagePropertiesFormProps {
  page: Page;
}

const initialState = {
  success: undefined as string | undefined,
  errors: undefined as
    | {
        formErrors?: string[];
        fieldErrors?: {
          title?: string[];
          slug?: string[];
          isDraft?: string[];
          showOnMenu?: string[];
        };
      }
    | undefined,
  data: undefined as (Page & { fullPath?: string }) | undefined,
};

export function PagePropertiesForm({ page }: PagePropertiesFormProps) {
  const updatePageWithIdAction = updatePageAction.bind(null, page.id)
  const [state, formAction] = useActionState(
    updatePageWithIdAction,
    initialState
  );

  const deletePageWithIdAction = deletePageAction.bind(null, page.id);
  const [deleteState, deleteFormAction] = useActionState(
    deletePageWithIdAction,
    { }
  );

  const { showSuccess, showError } = useNotifications();
  const { updatePageInTree, removePageFromTree } = usePageTree();
  const { setSelectedPage, clearSelection } = usePageSelection();

  const [isDirty, setIsDirty] = useState(false);

  // Store original page values to revert tree on validation errors
  const originalPageRef = useRef(page);

  const formRef = useRef<HTMLFormElement>(null);

  const confirmDelete = async (e: Event) => {
    e.preventDefault();
    window.confirm("Are you sure you want to delete this page?") &&
      (await deletePageWithIdAction());
  };

  useFormRegistry<{
    title?: string;
    slug?: string;
    isDraft?: boolean;
    showOnMenu?: boolean;
  }>({
    formId: `page-properties-${page.id}`,
    isDirty,
    isValid:
      !state.errors || (!state.errors.formErrors && !state.errors.fieldErrors),
    errors: state.errors || {},
    submit: async () => {
      // Trigger native form submission
      formRef.current?.requestSubmit();
    },
  });

  // Reset dirty state after successful submission
  useEffect(() => {
    if (state.success) {
      setIsDirty(false);
    }
  }, [state.success]);

  // Reset dirty state when validation fails (form reverts to default)
  useEffect(() => {
    if (state.errors && (state.errors.formErrors || state.errors.fieldErrors)) {
      setIsDirty(false);
    }
  }, [state.errors]);

  // Handle successful update
  useEffect(() => {
    if (state.success && state.data) {
      showSuccess(state.success);
      updatePageInTree(state.data);
      // Update the selected page in context, preserving translations
      setSelectedPage((prev) => {
        const newPage: PageWithTranslations = {
          id: state.data!.id,
          title: state.data!.title,
          slug: state.data!.slug,
          fullPath: state.data!.fullPath,
          isDraft: state.data!.isDraft,
          showOnMenu: state.data!.showOnMenu,
          parentId: state.data!.parentId,
          sortOrder: state.data!.sortOrder,
          translations: prev?.translations,
        };
        return newPage;
      });
      // Update original page ref to the new values
      originalPageRef.current = state.data;
      // Reset form to new values
      formRef.current?.reset();
    }
  }, [
    state.success,
  ]);

  // Revert tree to original values when validation fails
  useEffect(() => {
    if (state.errors && (state.errors.formErrors || state.errors.fieldErrors)) {
      // Revert the tree to the original page values
      updatePageInTree(originalPageRef.current);
    }
  }, [state.errors, updatePageInTree]);

  // Handle successful delete
  useEffect(() => {
    if (deleteState.success) {
      showSuccess("Page deleted successfully!");
      removePageFromTree(page.id);
      clearSelection();
    }
  }, [
    deleteState.success,
    showSuccess,
    removePageFromTree,
    page.id,
    clearSelection,
  ]);

  // Handle form errors
  useEffect(() => {
    if (state.errors?.formErrors && state.errors.formErrors.length > 0) {
      showError(state.errors.formErrors[0]);
    }
  }, [state.errors?.formErrors, showError]);

  // Handle delete errors
  useEffect(() => {
    if (
      deleteState.errors?.formErrors &&
      deleteState.errors.formErrors.length > 0
    ) {
      showError(deleteState.errors.formErrors[0]);
    }
  }, [deleteState.errors?.formErrors, showError]);

  return (
    <div className="flex flex-col gap-4">

      {/* Title Form */}
      <form
        action={formAction}
        ref={formRef}
        onChange={() => setIsDirty(true)}
      >
        <input type="hidden" name="pageId" value={page.id} />

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium mb-1"
            style={{
              fontSize: "var(--puck-font-size-xs)",
              color: "var(--puck-color-grey-02)",
            }}
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={page.title}
            placeholder="Enter page title"
            onChange={(e) => {
              setIsDirty(true);
              // Update tree title in real-time for better UX
              updatePageInTree({ ...page, title: e.target.value });
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: state.errors?.fieldErrors?.title
                ? "1px solid var(--puck-color-red-09)"
                : "1px solid var(--puck-color-grey-09)",
              background: "var(--puck-color-white)",
              color: "var(--puck-color-grey-01)",
              fontSize: "var(--puck-font-size-xs)",
            }}
          />
          {state.errors?.fieldErrors?.title && (
            <p
              className="text-xs mt-1"
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-red-07)",
                marginTop: "4px",
              }}
            >
              {state.errors.fieldErrors.title[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-xs font-medium mb-1"
            style={{
              fontSize: "var(--puck-font-size-xs)",
              color: "var(--puck-color-grey-02)",
            }}
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={page.slug}
            placeholder="page-url-slug"
            required
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: state.errors?.fieldErrors?.slug
                ? "1px solid var(--puck-color-red-09)"
                : "1px solid var(--puck-color-grey-09)",
              background: "var(--puck-color-white)",
              color: "var(--puck-color-grey-01)",
              fontSize: "var(--puck-font-size-xs)",
            }}
          />
          {state.errors?.fieldErrors?.slug && (
            <p
              className="text-xs mt-1"
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-red-07)",
                marginTop: "4px",
              }}
            >
              {state.errors.fieldErrors.slug[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{
              fontSize: "11px",
              color: "var(--puck-color-grey-07)",
              marginTop: "4px",
            }}
          >
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Draft Status */}
        <div>
          <label
            className="flex items-center gap-2 cursor-pointer text-xs"
            style={{
              fontSize: "var(--puck-font-size-xs)",
              color: "var(--puck-color-grey-02)",
            }}
          >
            <input
              type="checkbox"
              name="isDraft"
              defaultChecked={page.isDraft}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                border: state.errors?.fieldErrors?.isDraft
                  ? "1px solid var(--puck-color-red-09)"
                  : "1px solid var(--puck-color-grey-09)",
              }}
            />
            <span>Draft (unpublished)</span>
          </label>
          {state.errors?.fieldErrors?.isDraft && (
            <p
              className="text-xs mt-1"
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-red-07)",
                marginTop: "4px",
                marginLeft: "24px",
              }}
            >
              {state.errors.fieldErrors.isDraft[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{
              fontSize: "11px",
              color: "var(--puck-color-grey-07)",
              marginTop: "4px",
              marginLeft: "24px",
            }}
          >
            Draft pages are not visible to visitors
          </p>
        </div>

        {/* Show on Menu */}
        <div>
          <label
            className="flex items-center gap-2 cursor-pointer text-xs"
            style={{
              fontSize: "var(--puck-font-size-xs)",
              color: "var(--puck-color-grey-02)",
            }}
          >
            <input
              type="checkbox"
              name="showOnMenu"
              defaultChecked={page.showOnMenu}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                border: state.errors?.fieldErrors?.showOnMenu
                  ? "1px solid var(--puck-color-red-09)"
                  : "1px solid var(--puck-color-grey-09)",
              }}
            />
            <span>Show in navigation menu</span>
          </label>
          {state.errors?.fieldErrors?.showOnMenu && (
            <p
              className="text-xs mt-1"
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-red-07)",
                marginTop: "4px",
                marginLeft: "24px",
              }}
            >
              {state.errors.fieldErrors.showOnMenu[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{
              fontSize: "11px",
              color: "var(--puck-color-grey-07)",
              marginTop: "4px",
              marginLeft: "24px",
            }}
          >
            Display this page in the site navigation
          </p>
        </div>

        {/* Form-level error */}
        {state.errors?.formErrors && state.errors.formErrors.length > 0 && (
          <div
            className="p-3 rounded-lg"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "var(--puck-color-red-01)",
              border: "1px solid var(--puck-color-red-04)",
            }}
          >
            <p
              className="text-xs"
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-red-07)",
              }}
            >
              {state.errors.formErrors[0]}
            </p>
          </div>
        )}
      </form>

      {/* Delete Form */}
      <form action={deleteFormAction} style={{ marginTop: "16px" }}>
        <input type="hidden" name="pageId" value={page.id} />

        <Button
          type="button"
          onClick={confirmDelete}
          variant="secondary"
          fullWidth
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Page
        </Button>
      </form>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid var(--puck-color-grey-09)",
          margin: "8px 0",
        }}
      />

      {/* SEO Metadata Section */}
      <div className="mb-16">
        <h3 className="text-xs font-semibold mb-3 text-gray-500">
          SEO Metadata
        </h3>
        <p className="text-xs mb-4">
          SEO settings are managed per locale in the page editor.
        </p>
      </div>
    </div>
  );
}
