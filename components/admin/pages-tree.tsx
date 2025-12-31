"use client"

import { useState, useEffect, useRef } from "react"
import { SortableTree, PageTreeNode } from "@/components/admin/sortable-tree"
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

  const handleChange = (newItems: PageTreeNode[]) => {
    setPagesTree(newItems)
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


        {/* Tree container with subtle border and shadow */}
        <div
          data-pages-order={JSON.stringify(orderData)}
        >
          <SortableTree items={items} onChange={handleChange} />
        </div>
      </div>
    </div>
  )
}
