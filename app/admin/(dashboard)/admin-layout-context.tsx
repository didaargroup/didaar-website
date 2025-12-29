"use client";

import { tryCatch } from "@/lib/utils";
import type {
  HeaderAction,
  AdminLayoutState,
  HeaderActionLink,
  HeaderActionButton,
  RegisteredForm,
} from "@/types/components";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export function isButtonAction(
  action: HeaderAction
): action is HeaderActionButton {
  return typeof action === "object" && action !== null && "onClick" in action;
}

export function isLinkAction(action: HeaderAction): action is HeaderActionLink {
  return typeof action === "object" && action !== null && "href" in action;
}

const AdminLayoutContext = createContext<AdminLayoutState | undefined>(
  undefined
);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarLeftVisible, setSidebarLeftVisible] = useState(true);
  const [sidebarRightVisible, setSidebarRightVisible] = useState(true);
  const [actions, setActions] = useState<HeaderAction[]>([]);

  const [forms, setForms] = useState<Map<string, RegisteredForm<unknown>>>(
    new Map()
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleSidebarLeft = () => {
    setSidebarLeftVisible((prev) => !prev);
  };

  const toggleSidebarRight = () => {
    setSidebarRightVisible((prev) => !prev);
  };

  const registerForm = useCallback(
    <T = Record<string, any>,>(form: RegisteredForm<T>) => {
      setForms((prev) =>
        new Map(prev).set(form.id, form as RegisteredForm<any>)
      );
      return () => {
        setForms((prev) => {
          const next = new Map(prev);
          next.delete(form.id);
          return next;
        });
      };
    },
    []
  );

  const updateForm = useCallback(
    <T = Record<string, any>>(id: string, updates: Partial<RegisteredForm<T>>) => {
      setForms((prev) => {
        const existingForm = prev.get(id);
        if (!existingForm) return prev;
        const next = new Map(prev);
        next.set(id, { ...existingForm, ...updates } as RegisteredForm<any>);
        return next;
      });
    },
    []
  );

  const submitAll = useCallback(async () => {
    const dirtyForms = Array.from(forms.values()).filter((f) => {
      const isDirty = typeof f.isDirty === 'function' ? f.isDirty() : f.isDirty;
      return isDirty;
    });

    if (dirtyForms.length === 0) return;

    setIsSubmitting(true);
    let allSucceeded = true;

    try {
      await Promise.allSettled(
        dirtyForms.map(async (form) => {
          const submitFn = typeof form.submit === 'function' ? form.submit : form.submit;
          const res = await tryCatch(async () => {
            await submitFn();
          });

          if (!res.success) {
            allSucceeded = false;
            updateForm(form.id, {
              errors: {
                formErrors: ["An unexpected error occurred. Please try again."],
              }
            })
          }
        })
      )

    } finally {
      setIsSubmitting(false);
    }

  }, [forms, updateForm]);


  const hasDirtyForm = useMemo(() => {
    const dirty = Array.from(forms.values()).some((f) => {
      const isDirty = typeof f.isDirty === 'function' ? f.isDirty() : f.isDirty;
      return isDirty;
    });
    console.log('[AdminLayout] hasDirtyForm:', dirty, 'forms:', forms.size, 'details:', Array.from(forms.entries()).map(([id, f]) => {
      const isDirty = typeof f.isDirty === 'function' ? f.isDirty() : f.isDirty;
      return [id, isDirty];
    }));
    return dirty;
  }, [forms]);

  const allErrors = useMemo(() => {
    const result: Record<string, any> = {}
    for (const [id, form] of forms.entries()) {
      const errors = typeof form.errors === 'function' ? form.errors() : form.errors;
      result[id] = errors;
    }
    return result;
  }, [forms])

  const hasErrors = useMemo(() => 
    Array.from(forms.values()).some((f) => {
      const isValid = typeof f.isValid === 'function' ? f.isValid() : f.isValid;
      const errors = typeof f.errors === 'function' ? f.errors() : f.errors;
      return !isValid || Object.keys(errors || {}).length > 0;
    }), [forms]);

  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarLeftVisible,
        setSidebarLeftVisible,
        toggleSidebarLeft,
        sidebarRightVisible,
        setSidebarRightVisible,
        toggleSidebarRight,
        forms,
        setForms,
        actions,
        setActions,
        isSubmitting,
        setIsSubmitting,
        registerForm,
        updateForm,
        submitAll,
        hasDirtyForm,
        allErrors,
        hasErrors,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}
