"use client"

import { useState, useEffect, useRef } from "react"
import { SortableTree, PageTreeNode } from "@/components/admin/sortable-tree"
import { SavePageOrderButton } from "./page-order-save"

interface PagesTreeProps {
  initialItems: PageTreeNode[]
}

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

export function PagesTree({ initialItems }: PagesTreeProps) {
  const [items, setItems] = useState<PageTreeNode[]>(initialItems)
  const [isTainted, setIsTainted] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const lastSavedItems = useRef<PageTreeNode[]>(initialItems)

  const handleChange = (newItems: PageTreeNode[]) => {
    setItems(newItems)
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
    // Clear success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Get flattened order data for saving
  const orderData = flattenTreeWithOrder(items)

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Section header with separator */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Page Structure
          </h2>
        
        </div>

        {/* Tree container with subtle border and shadow */}
        <div 
          className="relative rounded-lg border bg-card p-6 shadow-sm"
          data-pages-order={JSON.stringify(orderData)}
        >
          <SortableTree items={items} onChange={handleChange} />
          
          {/* Success message */}
          {saveSuccess && (
            <div className="mt-4 p-3 rounded-md bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-600 dark:text-green-400">Page order saved successfully!</p>
            </div>
          )}
          
          {/* Save button */}
          {isTainted && (
            <div className="mt-6 pt-4 border-t flex justify-end">
              <SavePageOrderButton onSaveSuccess={handleSaveSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
