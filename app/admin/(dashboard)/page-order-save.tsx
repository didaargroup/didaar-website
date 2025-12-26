"use client"

import { useActionState, useEffect, useRef } from "react"
import { savePageOrder } from "@/app/actions"
import { Button } from "@measured/puck"

type FormState = {
  errors?: {
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

interface SavePageOrderButtonProps {
  onSaveSuccess?: () => void
}

export function SavePageOrderButton({ onSaveSuccess }: SavePageOrderButtonProps) {
  const [state, formAction, isPending] = useActionState(savePageOrder, initialState)
  const hasCalledSuccess = useRef(false)

  const handleSubmit = (formData: FormData) => {
    // Get the current page order from the SortableTree component
    const treeElement = document.querySelector('[data-pages-order]')
    if (treeElement) {
      const orderData = treeElement.getAttribute('data-pages-order')
      if (orderData) {
        formData.append('order', orderData)
        hasCalledSuccess.current = false
        return formAction(formData)
      }
    }
    return formAction(formData)
  }

  // Call onSaveSuccess callback when save succeeds (using useEffect to avoid setState during render)
  useEffect(() => {
    if (state.success && !hasCalledSuccess.current && onSaveSuccess) {
      onSaveSuccess()
      hasCalledSuccess.current = true
    }
  }, [state.success, onSaveSuccess])

  return (
    <form action={handleSubmit} className="inline">
      <Button
        type="submit"
        disabled={isPending}
        variant="primary"
      >
        {isPending ? "Saving..." : "Save Order"}
      </Button>

      {state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600 dark:text-red-400">{state.errors._form[0]}</p>
        </div>
      )}
    </form>
  )
}