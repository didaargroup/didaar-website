"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Globe, Eye } from "lucide-react";
import Link from "next/link";
import { deletePageAction, updatePageAction } from "@/app/_actions";
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
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const confirmDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this page?")) {
      deleteFormRef.current?.requestSubmit();
    }
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
    <div className="admin-area flex flex-col gap-4">
      {/* Title Form */}
      <form
        action={formAction}
        ref={formRef}
        onChange={() => setIsDirty(true)}
        className="space-y-4"
      >
        <input type="hidden" name="pageId" value={page.id} />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
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
            className={state.errors?.fieldErrors?.title ? "border-destructive" : ""}
          />
          {state.errors?.fieldErrors?.title && (
            <p className="text-xs text-destructive">
              {state.errors.fieldErrors.title[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            type="text"
            defaultValue={page.slug}
            placeholder="page-url-slug"
            required
            className={state.errors?.fieldErrors?.slug ? "border-destructive" : ""}
          />
          {state.errors?.fieldErrors?.slug && (
            <p className="text-xs text-destructive">
              {state.errors.fieldErrors.slug[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Translations Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Globe className="w-4 h-4" />
            <h3 className="text-sm font-semibold">
              Translations
            </h3>
          </div>

          {page.translations && page.translations.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Existing translations
              </p>
              <div className="space-y-2">
                {page.translations.map((translation) => (
                  <div
                    key={translation.locale}
                    className="flex items-center justify-between p-2 rounded-md border bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {translation.locale === "en" ? "English" : "Farsi"}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: translation.published
                            ? "var(--puck-color-azure-01)"
                            : "var(--puck-color-grey-08)",
                          color: translation.published
                            ? "var(--puck-color-azure-11)"
                            : "var(--puck-color-grey-12)",
                        }}
                      >
                        {translation.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <Link href={`/admin/pages/${translation.locale}/${page.slug}/edit`}>
                      <Button variant="secondary" size="small">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No translations yet
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Draft Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDraft"
              name="isDraft"
              defaultChecked={page.isDraft}
              className={state.errors?.fieldErrors?.isDraft ? "border-destructive" : ""}
            />
            <Label htmlFor="isDraft" className="cursor-pointer">
              Draft (unpublished)
            </Label>
          </div>
          {state.errors?.fieldErrors?.isDraft && (
            <p className="text-xs text-destructive ml-6">
              {state.errors.fieldErrors.isDraft[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground ml-6">
            Draft pages are not visible to visitors
          </p>
        </div>

        {/* Show on Menu */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="showOnMenu"
              name="showOnMenu"
              defaultChecked={page.showOnMenu}
              className={state.errors?.fieldErrors?.showOnMenu ? "border-destructive" : ""}
            />
            <Label htmlFor="showOnMenu" className="cursor-pointer">
              Show in navigation menu
            </Label>
          </div>
          {state.errors?.fieldErrors?.showOnMenu && (
            <p className="text-xs text-destructive ml-6">
              {state.errors.fieldErrors.showOnMenu[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground ml-6">
            Display this page in the site navigation
          </p>
        </div>

        {/* Form-level error */}
        {state.errors?.formErrors && state.errors.formErrors.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">
              {state.errors.formErrors[0]}
            </p>
          </div>
        )}
      </form>

{/* View Page Todo */}
        {/* <Button asChild>
          <Link href={page.fullPath || '/'} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              View Page
            </Link>          
          </Button> */}

      {/* Delete Form */}
      <form action={deleteFormAction} ref={deleteFormRef} className="mt-4">
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
      <div className="border-t border-border my-2" />

      {/* SEO Metadata Section */}
      <div className="mb-16">
        <h3 className="text-xs font-semibold mb-3 text-muted-foreground">
          SEO Metadata
        </h3>
        <p className="text-xs mb-4 text-muted-foreground">
          SEO settings are managed per locale in the page editor.
        </p>
      </div>
    </div>
  );
}
