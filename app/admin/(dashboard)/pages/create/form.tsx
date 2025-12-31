"use client";

import { createPageAction } from "@/app/_actions";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useRef, useState } from "react";
import { FormSection, HeadingSection } from "@/components/admin/form-layout";
import { Type, Link2, FileText, Eye } from "lucide-react";
import { useFormRegistry } from "@/lib/form-actions";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

export function CreatePageForm() {
  const router = useRouter()

  const [state, formAction] = useActionState(createPageAction, {});
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const slugManuallyEdited = useRef(false);

  const { showSuccess, showError } = useNotifications();


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setIsDirty(true);

    if (!slugManuallyEdited.current && title.length > 3 && formRef.current) {
      const slugInput = formRef.current.elements.namedItem(
        "slug"
      ) as HTMLInputElement;
      if (slugInput) {
        slugInput.value = slugify(title);
      }
    }
  };

  const handleSlugInput = () => {
    slugManuallyEdited.current = true;
    setIsDirty(true);
  };

  useFormRegistry({
    formId: "create-page-form",
    isDirty,
    isValid:
      !state.errors || (!state.errors.formErrors && !state.errors.fieldErrors),
    errors: state.errors || {},
    submit: async () => formRef.current?.requestSubmit(),
  });

  // Handle form submission state
  useEffect(() => {
    if (state.success) {
      showSuccess(state.success);
      setIsDirty(false);
      formRef.current?.reset();
      slugManuallyEdited.current = false;
      router.replace('/admin')
    }
    if (state?.errors?.formErrors) {
      showError(state.errors.formErrors.join("\n"));
    }
  }, [state]);

  const handleSubmit = () => {
    setIsPending(true);
  };

  return (
    <form
      action={formAction}
      ref={formRef}
      id="create-page-form"
      className="admin-area @container"
      onChange={() => setIsDirty(true)}
    >
      <FormSection
        heading={
          <HeadingSection
            title="Primary Details"
            description="Fill in the details to create a new page"
          />
        }
      >
        <div className="space-y-5">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              <Type className="w-4 h-4" />
              Title
            </Label>
            <Input
              placeholder="An Awesome Page"
              id="title"
              name="title"
              onChange={handleTitleChange}
              className={cn(
                state?.errors?.fieldErrors?.title && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!state?.errors?.fieldErrors?.title}
              aria-describedby={
                state?.errors?.fieldErrors?.title ? "title-error" : undefined
              }
            />
            {state?.errors?.fieldErrors?.title && (
              <p id="title-error" className="text-xs text-destructive">
                {state.errors.fieldErrors.title.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a descriptive title for your page (4-100 characters)
            </p>
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              <Link2 className="w-4 h-4" />
              Slug
            </Label>
            <Input
              type="text"
              name="slug"
              placeholder="an-awesome-page"
              onInput={handleSlugInput}
              className={cn(
                state?.errors?.fieldErrors?.slug && "border-destructive focus-visible:ring-destructive/20"
              )}
              aria-invalid={!!state?.errors?.fieldErrors?.slug}
              aria-describedby={
                state?.errors?.fieldErrors?.slug ? "slug-error" : "slug-hint"
              }
            />
            {state?.errors?.fieldErrors?.slug ? (
              <p id="slug-error" className="text-xs text-destructive">
                {state.errors.fieldErrors.slug.join(", ")}
              </p>
            ) : (
              <p id="slug-hint" className="text-xs text-muted-foreground">
                URL-friendly version of the title (auto-generated from title)
              </p>
            )}
          </div>

          {/* Options Section */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-foreground">Page Options</p>
            
            <div className="space-y-3">
              {/* Draft Checkbox */}
              <div className="flex items-start gap-3 group">
                <Checkbox
                  id="isDraft"
                  name="isDraft"
                  defaultChecked={true}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="isDraft"
                    className="cursor-pointer font-normal text-sm"
                  >
                    <FileText className="w-4 h-4 inline mr-1" />
                    Save as draft
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Page will not be visible to visitors until published
                  </p>
                </div>
              </div>

              {/* Show on Menu Checkbox */}
              <div className="flex items-start gap-3 group">
                <Checkbox
                  id="showOnMenu"
                  name="showOnMenu"
                  defaultChecked={true}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="showOnMenu"
                    className="cursor-pointer font-normal text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Show on menu
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include this page in the site navigation menu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    </form>
  );
}
