"use client";

import { useAdminLayout } from "@/contexts/admin-layout-context";
import { RegisteredForm } from "@/types";
import { useEffect, useRef } from "react";

interface UseFormRegistryOptions<T> {
  formId: string;
  isDirty: boolean;
  isValid: boolean;
  errors: RegisteredForm<T>["errors"];
  submit: () => Promise<void>;
}

// Helper to deep compare errors
function errorsEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return a === b;
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  return aStr === bStr;
}

export function useFormRegistry<T>({
  formId,
  isDirty,
  isValid,
  errors,
  submit,
}: UseFormRegistryOptions<T>) {
  const { registerForm, updateForm } = useAdminLayout();
  const isRegistered = useRef(false);

  // Store submit in a ref to maintain stable reference
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Track previous values to detect changes
  const prevValuesRef = useRef({ isDirty, isValid, errors });

  useEffect(() => {
    if (!isRegistered.current) {
      // Register with initial values
      const cleanup = registerForm<T>({
        id: formId,
        isDirty,
        isValid,
        errors,
        submit: () => submitRef.current(),
      });
      isRegistered.current = true;
      prevValuesRef.current = { isDirty, isValid, errors };

      return () => {
        cleanup();
        isRegistered.current = false;
      };
    }
  }, [formId, registerForm]);

  // Update form when values change
  useEffect(() => {
    if (isRegistered.current) {
      const prev = prevValuesRef.current;

      // Check if values actually changed (using deep comparison for errors)
      const dirtyChanged = prev.isDirty !== isDirty;
      const validChanged = prev.isValid !== isValid;
      const errorsChanged = !errorsEqual(prev.errors, errors);

      if (dirtyChanged || validChanged || errorsChanged) {
        updateForm<T>(formId, {
          isDirty,
          isValid,
          errors,
          submit: () => submitRef.current(),
        });
        prevValuesRef.current = { isDirty, isValid, errors };
      }
    }
  }, [formId, isDirty, isValid, errors, updateForm]);
}
