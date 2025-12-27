"use client"

import { useState, useEffect, useRef } from "react"
import { SortableTree, PageTreeNode } from "@/components/admin/sortable-tree"
import { SavePageOrderButton } from "./page-order-save"
import { usePageTree } from "@/contexts/page-tree-context"
import { useNotifications } from "@/contexts/notification-context"

interface FlatPageOrder {
  id: string
  parentId: string | null
  sortOrder: number
}

/**
 * Flatten the tree structure into an array with parent references
 */
function flattenTreeWithOrder(
  items: PageTreeNode[],
  parentId: string | null = null,
  sortOrder: number = 0
): FlatPageOrder[] {
  const result: FlatPageOrder[] = []
  
  for (const item of items) {
    result.push({
      id: item.id,
      parentId,
      sortOrder: sortOrder++
    })
    
    if (item.children && item.children.length > 0) {
      result.push(...flattenTreeWithOrder(item.children, item.id, 0))
    }
  }
  
  return result
}

export function PagesTree() {
  const { pagesTree: items, setPagesTree, isRefreshing } = usePageTree()
  const { showSuccess, showError } = useNotifications()
  const [isTainted, setIsTainted] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const lastSavedItems = useRef<PageTreeNode[]>(items)

  const handleChange = (newItems: PageTreeNode[]) => {
    setPagesTree(newItems)
    setIsTainted(true)
    setSaveSuccess(false)
  }

  // Reset tainted state when items match last saved items
  useEffect(() => {
    const itemsMatch = JSON.stringify(items) === JSON.stringify(lastSavedItems.current)
    if (itemsMatch && isTainted) {
      setIsTainted(false)
    }
  }, [items, isTainted])

  // Handle successful save
  const handleSaveSuccess = () => {
    lastSavedItems.current = items
    setIsTainted(false)
    setSaveSuccess(true)
    showSuccess("Page order saved successfully!")
    // Clear success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Get flattened order data for saving
  const orderData = flattenTreeWithOrder(items)

  if (isRefreshing) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-muted-foreground">Loading pages...</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Section header with separator */}
        <div className="flex items-center gap-4 mb-6">
          <h2
            className="uppercase tracking-wider"
            style={{
              fontSize: "var(--puck-font-size-xs)",
              fontWeight: 500,
              color: "var(--puck-color-grey-07)"
            }}
          >
            Page Structure
          </h2>
        
        </div>

        {/* Tree container with subtle border and shadow */}
        <div
          data-pages-order={JSON.stringify(orderData)}
        >
          <SortableTree items={items} onChange={handleChange} />
          
          {/* Save button */}
          {isTainted && (
            <div
              className="mt-6 flex justify-end"
              style={{
                paddingTop: "var(--puck-space-16)",
                borderTop: "1px solid var(--puck-color-grey-09)"
              }}
            >
              <SavePageOrderButton onSaveSuccess={handleSaveSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
