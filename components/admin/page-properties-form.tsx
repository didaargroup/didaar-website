"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Button } from "@measured/puck";
import { Trash2 } from "lucide-react";
import { updatePageAction, deletePageAction } from "@/app/actions";
import { Page } from "@/db/schema";
import { useNotifications } from "@/contexts/notification-context";
import { usePageTree } from "@/contexts/page-tree-context";
import { usePageSelection } from "@/components/admin/page-selection-context";
import { useFormRegistry } from "./use-form-registry";

interface PagePropertiesFormProps {
  page: Page;
}


const initialState = {
  success: undefined as string | undefined,
  errors: undefined as {
    formErrors?: string[];
    fieldErrors?: {
      title?: string[];
      slug?: string[];
      isDraft?: string[];
      showOnMenu?: string[];
    };
  } | undefined
};

export function PagePropertiesForm({ page }: PagePropertiesFormProps) {
  const [state, formAction] = useActionState(updatePageAction as any, initialState);
  const [deleteState, deleteFormAction] = useActionState(deletePageAction as any, initialState);
  const { showSuccess, showError } = useNotifications();
  const { updatePageInTree, removePageFromTree } = usePageTree();
  const { setSelectedPage, clearSelection } = usePageSelection();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  
  useFormRegistry<{
    title?: string;
    slug?: string;
    isDraft?: boolean;
    showOnMenu?: boolean;
  }>({
    formId: `page-properties-${page.id}`,
    isDirty,
    isValid: !state.errors?.formErrors && !state.errors?.fieldErrors,
    errors: state.errors || {},
    submit: async () => {
      // Trigger native form submission
      formRef.current?.requestSubmit();
    },
  })

  // Reset dirty state after successful submission
  useEffect(() => {
    if (state.success) {
      setIsDirty(false);
    }
  }, [state.success]);



  // Handle successful update
  useEffect(() => {
    if (state.success && state.updatedPage) {
      showSuccess("Page updated successfully!");
      updatePageInTree(state.updatedPage);
      // Update the selected page in context
      setSelectedPage(state.updatedPage);
    }
  }, [state.success, state.updatedPage, showSuccess, updatePageInTree, setSelectedPage]);

  // Handle successful delete
  useEffect(() => {
    if (deleteState.success) {
      showSuccess("Page deleted successfully!");
      removePageFromTree(page.id);
      clearSelection();
    }
  }, [deleteState.success, showSuccess, removePageFromTree, page.id, clearSelection]);

  // Handle form errors
  useEffect(() => {
    if (state.errors?.formErrors && state.errors.formErrors.length > 0) {
      showError(state.errors.formErrors[0]);
    }
  }, [state.errors?.formErrors, showError]);

  // Handle delete errors
  useEffect(() => {
    if (deleteState.errors?.formErrors && deleteState.errors.formErrors.length > 0) {
      showError(deleteState.errors.formErrors[0]);
    }
  }, [deleteState.errors?.formErrors, showError]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Page ID */}
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-07)" }}
        >
          Page ID
        </label>
        <input
          type="text"
          value={page.id}
          disabled
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid var(--puck-color-grey-09)",
            background: "var(--puck-color-grey-08)",
            color: "var(--puck-color-grey-07)",
            fontSize: "var(--puck-font-size-xs)",
            cursor: "not-allowed",
          }}
        />
      </div>

      {/* Title Form */}
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }} ref={formRef}
        onChange={() => setIsDirty(true)}
      >
        <input type="hidden" name="pageId" value={page.id} />

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium mb-1"
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={page.title}
            placeholder="Enter page title"
            required
            onChange={(e) => {
              setIsDirty(true);
              // Update tree title in real-time
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
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)", marginTop: "4px" }}
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
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
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
            pattern="[a-z0-9-]+"
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
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)", marginTop: "4px" }}
            >
              {state.errors.fieldErrors.slug[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{ fontSize: "11px", color: "var(--puck-color-grey-07)", marginTop: "4px" }}
          >
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Draft Status */}
        <div>
          <label
            className="flex items-center gap-2 cursor-pointer text-xs"
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
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
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)", marginTop: "4px", marginLeft: "24px" }}
            >
              {state.errors.fieldErrors.isDraft[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{ fontSize: "11px", color: "var(--puck-color-grey-07)", marginTop: "4px", marginLeft: "24px" }}
          >
            Draft pages are not visible to visitors
          </p>
        </div>

        {/* Show on Menu */}
        <div>
          <label
            className="flex items-center gap-2 cursor-pointer text-xs"
            style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-grey-02)" }}
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
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)", marginTop: "4px", marginLeft: "24px" }}
            >
              {state.errors.fieldErrors.showOnMenu[0]}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{ fontSize: "11px", color: "var(--puck-color-grey-07)", marginTop: "4px", marginLeft: "24px" }}
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
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)" }}
            >
              {state.errors.formErrors[0]}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
          <Button type="submit" variant="primary" fullWidth>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Delete Form */}
      <form action={deleteFormAction} style={{ marginTop: "16px" }}>
        <input type="hidden" name="pageId" value={page.id} />

        {deleteState.errors?.formErrors && deleteState.errors.formErrors.length > 0 && (
          <div
            className="p-3 rounded-lg mb-2"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "var(--puck-color-red-01)",
              border: "1px solid var(--puck-color-red-04)",
              marginBottom: "8px",
            }}
          >
            <p
              className="text-xs"
              style={{ fontSize: "var(--puck-font-size-xs)", color: "var(--puck-color-red-07)" }}
            >
              {deleteState.errors.formErrors[0]}
            </p>
          </div>
        )}

        <Button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          variant="secondary"
          fullWidth
          style={{
            background: "var(--puck-color-red-09)",
            color: "var(--puck-color-white)",
            border: "1px solid var(--puck-color-red-09)",
          }}
          hoverStyle={{
            background: "var(--puck-color-red-10)",
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Page
        </Button>
      </form>

      {/* Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: "var(--puck-color-white)",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid var(--puck-color-grey-09)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "var(--puck-font-size-sm)",
                fontWeight: 600,
                color: "var(--puck-color-grey-01)",
                marginBottom: "12px",
              }}
            >
              Delete Page
            </h3>
            <p
              style={{
                fontSize: "var(--puck-font-size-xs)",
                color: "var(--puck-color-grey-02)",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete "{page.title}"? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
      
              >
                Cancel
              </Button>
              <form action={deleteFormAction} style={{ flex: 1 }}>
                <input type="hidden" name="pageId" value={page.id} />
                <Button
                  type="submit"
                  variant="secondary"
                  fullWidth
          
                >
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--puck-color-grey-09)", margin: "8px 0" }} />

      {/* SEO Metadata Section */}
      <div className="mb-16">
        <h3
          className="text-xs font-semibold mb-3"
          style={{ fontSize: "var(--puck-font-size-xs)", fontWeight: 500, color: "var(--puck-color-grey-02)", marginBottom: "12px" }}
        >
          SEO Metadata
        </h3>
        <p
          className="text-xs mb-4"
          style={{ fontSize: "11px", color: "var(--puck-color-grey-07)", marginBottom: "16px" }}
        >
          SEO settings are managed per locale in the page editor.
        </p>
        <Button
          href={`/admin/pages/${page.id}`}
          variant="secondary"
          fullWidth
          disabled
        >
          Edit Content & SEO 
        </Button>
      </div>
    </div>
  );
}
