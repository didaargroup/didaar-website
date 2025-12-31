"use client"

import { SortableTree } from "@/components/admin/sortable-tree"
import { usePageTree } from "@/contexts/page-tree-context"
import { Skeleton } from "@/components/ui/skeleton"
import type { PageTreeNode } from "@/types"

function PagesTreeSkeleton() {
  // Create skeleton items matching the tree structure
  const skeletonItems = Array.from({ length: 5 }, (_, i) => ({
    id: `skeleton-${i}`,
    depth: i < 3 ? 0 : 1, // Mix of root and child items
  }))

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <ul className="flex flex-col gap-2" role="tree">
          {skeletonItems.map(({ id, depth }) => (
            <li
              key={id}
              className="relative list-none"
              style={{ paddingLeft: `${24 * depth}px` }}
            >
              <div className="flex items-center gap-2 rounded-lg px-3 shadow-sm border border-border bg-card"
                style={{ padding: "10px 12px" }}
              >
                <Skeleton className="h-5 w-32" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function PagesTree() {
  const { pagesTree: items, setPagesTree, isRefreshing } = usePageTree()

  const handleChange = (newItems: PageTreeNode[]) => {
    setPagesTree(newItems)
  }

  if (isRefreshing) {
    return <PagesTreeSkeleton />
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <SortableTree items={items} onChange={handleChange} />
      </div>
    </div>
  )
}
