"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Page } from "@/db/schema";
import type { PageTreeNode } from "@/types";

interface FlatPageOrder {
  id: string;
  parentId: string | null;
  sortOrder: number;
}

type PageTreeContextType = {
  pagesTree: PageTreeNode[];
  setPagesTree: (tree: PageTreeNode[]) => void;
  refreshPagesTree: () => Promise<void>;
  isRefreshing: boolean;
  updatePageInTree: (page: Page) => void;
  removePageFromTree: (pageId: number) => void;
  getFlattenedOrder: () => FlatPageOrder[];
  isDirty: boolean;
};

/**
 * Flatten the tree structure into an array with parent references
 * Used for saving page order to the database
 */
function flattenTreeWithOrder(
  items: PageTreeNode[],
  parentId: string | null = null,
  sortOrder: number = 0
): FlatPageOrder[] {
  const result: FlatPageOrder[] = [];

  for (const item of items) {
    result.push({
      id: item.id,
      parentId,
      sortOrder: sortOrder++,
    });

    if (item.children && item.children.length > 0) {
      result.push(...flattenTreeWithOrder(item.children, item.id, 0));
    }
  }

  return result;
}

const PageTreeContext = createContext<PageTreeContextType | undefined>(undefined);

export function PageTreeProvider({ children, initialTree }: { children: ReactNode; initialTree: PageTreeNode[] }) {
  const [pagesTree, setPagesTree] = useState<PageTreeNode[]>(initialTree);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Update initial tree when it changes from server
  useEffect(() => {
    setPagesTree(initialTree);
    setIsDirty(false); // Reset dirty state when tree is refreshed
  }, [initialTree]);

  const getFlattenedOrder = useCallback(() => {
    return flattenTreeWithOrder(pagesTree);
  }, [pagesTree]);

  const refreshPagesTree = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/pages/tree');
      if (!response.ok) throw new Error('Failed to refresh pages tree');
      const newTree = await response.json();
      setPagesTree(newTree);
      setIsDirty(false); // Reset dirty state after refresh
    } catch (error) {
      console.error('Failed to refresh pages tree:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Wrapper to mark tree as dirty when it changes
  const setPagesTreeWithDirty = useCallback((newTree: PageTreeNode[] | ((prev: PageTreeNode[]) => PageTreeNode[])) => {
    setPagesTree(newTree);
    setIsDirty(true);
  }, []);

  const updatePageInTree = useCallback((page: Page) => {
    setPagesTreeWithDirty((prevTree) => {
      const updateNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
        return nodes.map((node) => {
          if (node.id === String(page.id)) {
            return {
              ...node,
              title: page.title,
              slug: page.slug,
              isDraft: page.isDraft,
              showOnMenu: page.showOnMenu,
              // Preserve translations if they exist
              ...(node.translations && { translations: node.translations }),
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateNode(node.children),
            };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  }, []);

  const removePageFromTree = useCallback((pageId: number) => {
    setPagesTreeWithDirty((prevTree) => {
      const removeNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
        return nodes
          .filter((node) => node.id !== String(pageId))
          .map((node) => ({
            ...node,
            children: node.children ? removeNode(node.children) : undefined,
          }));
      };
      return removeNode(prevTree);
    });
  }, []);

  return (
    <PageTreeContext.Provider
      value={{
        pagesTree,
        setPagesTree: setPagesTreeWithDirty,
        refreshPagesTree,
        isRefreshing,
        updatePageInTree,
        removePageFromTree,
        getFlattenedOrder,
        isDirty,
      }}
    >
      {children}
    </PageTreeContext.Provider>
  );
}

export function usePageTree() {
  const context = useContext(PageTreeContext);
  if (!context) {
    throw new Error("usePageTree must be used within PageTreeProvider");
  }
  return context;
}
