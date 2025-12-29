"use client";

import { useAdminLayout } from "@/app/admin/(dashboard)/admin-layout-context";
import { RegisteredForm } from "@/types";
import { useEffect, useRef } from "react";


interface UseFormRegistryOptions<T> {
    formId: string;
    isDirty: boolean;
    isValid: boolean;
    errors: RegisteredForm<T>['errors'];
    submit: () => Promise<void>;
}

export function useFormRegistry<T>({
    formId,
    isDirty,
    isValid,
    errors,
    submit,
}: UseFormRegistryOptions<T>) {
    const { registerForm, updateForm } = useAdminLayout();  
    const isRegitered = useRef(false);
    
    // Track previous values to detect changes
    const prevValuesRef = useRef({ isDirty, isValid, errors });
    
    useEffect(() => {
        if (!isRegitered.current) {
            // Register with initial values
            const cleanup = registerForm<T>({
                id: formId,
                isDirty,
                isValid,
                errors,
                submit,
            });
            isRegitered.current = true;
            prevValuesRef.current = { isDirty, isValid, errors };
            
            return () => {
                cleanup();
                isRegitered.current = false;
            };
        }
    }, [formId, registerForm]);

    // Update form when values change
    useEffect(() => {
        if (isRegitered.current) {
            const prev = prevValuesRef.current;
            
            // Check if values actually changed
            if (prev.isDirty !== isDirty || prev.isValid !== isValid || prev.errors !== errors) {
                console.log('[useFormRegistry] Updating form:', formId, { isDirty, isValid });
                updateForm<T>(formId, {
                    isDirty,
                    isValid,
                    errors,
                    submit,
                });
                prevValuesRef.current = { isDirty, isValid, errors };
            }
        }
    }, [formId, isDirty, isValid, errors, submit, updateForm]);
}