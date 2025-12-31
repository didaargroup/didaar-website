"use client"

import { useCallback, useState } from "react"
import { SortableTree } from "@/components/admin/sortable-tree"
import { usePageTree } from "@/contexts/page-tree-context"
import { useFormRegistry } from "@/lib/form-actions"
import { savePageOrder } from "@/app/_actions"
import type { PageTreeNode } from "@/types"

export function PagesTreeForm() {
  const { pagesTree: items, setPagesTree, getFlattenedOrder, isDirty } = usePageTree()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (newItems: PageTreeNode[]) => {
    setPagesTree(newItems)
  }

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const orderData = JSON.stringify(getFlattenedOrder())

      const formData = new FormData()
      formData.append("order", orderData)

      const result = await savePageOrder({} as any, formData)

      if (result.errors) {
        throw new Error("Failed to save page order")
      }

      // No need to refresh - the tree is already updated locally via setPagesTree
      // and the database is updated by the server action
    } finally {
      setIsSubmitting(false)
    }
  }, [getFlattenedOrder])

  // Register this form with the admin layout context
  useFormRegistry({
    formId: "page-order",
    isDirty,
    isValid: true,
    errors: {},
    submit,
  })

  return (
    <div className="flex justify-center">
      <div className={`w-full max-w-2xl transition-all duration-300 ${isSubmitting ? "opacity-80 pointer-events-none loading-overlay" : ""}`}>
        <SortableTree 
          items={items} 
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
    </div>
  )
}
