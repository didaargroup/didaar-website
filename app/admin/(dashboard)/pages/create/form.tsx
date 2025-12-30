"use client";

import { createPageAction } from "@/app/actions";

import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { useActionState, useEffect, useRef, useState } from "react";
import { FormSection, HeadingSection } from "@/components/admin/form-layout";
import { LucideType } from "lucide-react";
import { useFormRegistry } from "@/lib/form-actions";
import { useNotifications } from "@/contexts/notification-context";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

export function CreatePageForm() {
  const [state, formAction] = useActionState(createPageAction, {});
  const [isDirty, setIsDirty] = useState(false);
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

  // Reset dirty state after successful submission
  useEffect(() => {
    if (state.success) showSuccess(state.success);
    if (state?.errors && state.errors.formErrors)
      showError(state.errors.formErrors.join("\n"));
    setIsDirty(false);
    formRef.current?.reset();
  }, [state.errors]);

  return (
    <form
      action={formAction}
      ref={formRef}
      id="create-page-form"
      className=" @container"
      onChange={() => setIsDirty(true)}
    >
      <FormSection
        heading={
          <HeadingSection
            title="Primary Details"
            description="Fill in the details to create a new page"
          ></HeadingSection>
        }
      >
        <div className="space-y-6">
          <div className="">
            <Label htmlFor="title">
              <LucideType className="text-gray-400 w-4 h-4" />
              Title
            </Label>
            <Input
              placeholder="An Awesome Page"
              id="title"
              name="title"
              onChange={handleTitleChange}
            />
            {state?.errors && state.errors?.fieldErrors?.title && (
              <p className="text-xs text-destructive pt-2">
                {state.errors.fieldErrors.title.join("\n")}
              </p>
            )}
          </div>
          <div className="">
            <Label htmlFor="slug">
              <LucideType className="text-gray-400 w-4 h-4" />
              Slug
            </Label>
            <Input
              type="text"
              name="slug"
              placeholder="an-awesome-page"
              onInput={handleSlugInput}
            />
            {state?.errors && state.errors?.fieldErrors?.slug && (
              <p className="text-xs text-destructive pt-2">
                {state.errors.fieldErrors.slug.join("\n")}
              </p>
            )}
          </div>

          <div className="@sm:flex gap-4">
            <div className="flex gap-2">
              <Checkbox id="isDraft" name="isDraft" defaultChecked={true} />
              <Label htmlFor="isDraft">This is a draft</Label>
            </div>

            <div className="flex gap-2">
              <Checkbox
                id="showOnMenu"
                name="showOnMenu"
                defaultChecked={true}
              />
              <Label htmlFor="showOnMenu">Show on menu</Label>
            </div>
          </div>
        </div>
      </FormSection>
    </form>
  );
}
