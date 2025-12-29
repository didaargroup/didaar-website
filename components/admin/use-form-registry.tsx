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
    
    // Store all values in refs - these will always have the latest values
    const valuesRef = useRef({ isDirty, isValid, errors, submit });
    valuesRef.current = { isDirty, isValid, errors, submit };

    useEffect(() => {
        if (!isRegitered.current) {
            // Register once with getter functions that read from refs
            const cleanup = registerForm<T>({
                id: formId,
                get isDirty() { return valuesRef.current.isDirty; },
                get isValid() { return valuesRef.current.isValid; },
                get errors() { return valuesRef.current.errors; },
                get submit() { return () => valuesRef.current.submit(); },
            });
            isRegitered.current = true;
            
            return () => {
                cleanup();
                isRegitered.current = false;
            };
        }
    }, [formId, registerForm]);
}