"use client"

import { useCallback, ReactNode } from "react"
import { savePageOrder } from "@/app/_actions"
import { usePageTree } from "@/contexts/page-tree-context"
import { useFormRegistry } from "@/lib/form-actions"

interface PageOrderFormProps {
  children: ReactNode
}

export function PageOrderForm({ children }: PageOrderFormProps) {
  const { getFlattenedOrder, refreshPagesTree, isDirty } = usePageTree()

  const submit = useCallback(async () => {
    const orderData = JSON.stringify(getFlattenedOrder())
    const formData = new FormData()
    formData.append("order", orderData)

    const result = await savePageOrder({} as any, formData)

    if (result.errors) {
      throw new Error("Failed to save page order")
    }

    if (result.success) {
      await refreshPagesTree()
    }
  }, [getFlattenedOrder, refreshPagesTree])

  // Register this form with the admin layout context
  useFormRegistry({
    formId: "page-order",
    isDirty,
    isValid: true,
    errors: {},
    submit,
  })

  // Render children (the tree)
  return <>{children}</>
}
