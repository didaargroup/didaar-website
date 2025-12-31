"use client";

import  { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  Modifiers,
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableTreeItem } from "@/components/TreeItem";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { TreeItem, FlattenedItem } from "@/types/navigation";
import { Badge } from "../ui/badge";
import type { PageTreeNode } from "@/types/database";
import { usePageSelection } from "@/components/admin/page-selection-context";
import { usePageTree } from "@/contexts/page-tree-context";
import { Page } from "@/db/schema";

interface SortableTreeProps {
  items: PageTreeNode[];
  onChange?: (items: PageTreeNode[]) => void;
  collapsible?: boolean;
  removable?: boolean;
  indentationWidth?: number;
  disabled?: boolean;
}

// Helper to convert PageTreeNode to TreeItem
function toTreeItem(node: PageTreeNode): TreeItem {
  return {
    id: node.id,
    children: (node.children || []).map(toTreeItem),
    collapsed: node.collapsed,
  };
}

// Helper to convert TreeItem to PageTreeNode
function toPageTreeNode(
  item: TreeItem,
  titleMap: Map<string, string>,
  slugMap: Map<string, string>,
  translationsMap: Map<string, PageTranslationStatus[]>,
  isDraftMap: Map<string, boolean>,
  showOnMenuMap: Map<string, boolean>
): PageTreeNode {
  const id = String(item.id);
  return {
    id,
    title: titleMap.get(id) || '',
    slug: slugMap.get(id) || '',
    isDraft: isDraftMap.get(id) || false,
    showOnMenu: showOnMenuMap.get(id) || true,
    translations: translationsMap.get(id) || [],
    children: item.children.map(child => toPageTreeNode(child, titleMap, slugMap, translationsMap, isDraftMap, showOnMenuMap)),
    collapsed: item.collapsed,
  };
}

// Flatten tree items - only include visible items (respect collapsed state)
function flattenTree(
  items: PageTreeNode[],
  parentId: UniqueIdentifier | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    const flattenedItem: FlattenedItem = {
      id: item.id,
      parentId,
      depth,
      index,
      children: [],
      collapsed: item.collapsed
    };
    
    // Only include children if not collapsed
    if (!item.collapsed && item.children && item.children.length > 0) {
      return [
        ...acc,
        flattenedItem,
        ...flattenTree(item.children, item.id, depth + 1),
      ];
    }
    
    return [...acc, flattenedItem];
  }, []);
}

// Helper to find a node by ID in nested structure
function findNode(items: PageTreeNode[], id: string): PageTreeNode | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNode(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// Helper to check if targetId is a descendant of ancestorId
function isDescendant(items: PageTreeNode[], ancestorId: string, targetId: string): boolean {
  const ancestor = findNode(items, ancestorId);
  if (!ancestor || !ancestor.children) return false;
  
  const checkChildren = (nodes: PageTreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) return true;
      if (node.children && checkChildren(node.children)) return true;
    }
    return false;
  };
  
  return checkChildren(ancestor.children);
}

// Build tree from flattened items
function buildTreeFromFlattened(
  flattenedItems: FlattenedItem[],
  titleMap: Map<string, string>,
  slugMap: Map<string, string>,
  translationsMap: Map<string, PageTranslationStatus[]>,
  isDraftMap: Map<string, boolean>,
  showOnMenuMap: Map<string, boolean>
): PageTreeNode[] {
  const root: TreeItem = { id: 'root', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({
    ...item,
    children: [],
  }));

  for (const item of items) {
    nodes[item.id] = { id: item.id, children: [], collapsed: item.collapsed };
  }

  for (const item of items) {
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId];
    parent.children.push(nodes[item.id]);
  }

  return root.children.map(item => toPageTreeNode(item, titleMap, slugMap, translationsMap, isDraftMap, showOnMenuMap));
}

// Get projection for drag
function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = Math.round(dragOffset / indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = previousItem ? previousItem.depth + 1 : 0;
  const minDepth = nextItem ? nextItem.depth : 0;
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

export function SortableTree({
  items,
  onChange,
  collapsible = true,
  removable = false,
  indentationWidth = 24,
  disabled = false,
}: SortableTreeProps) {
  const { setSelectedPage, selectedPage } = usePageSelection();
  const { pagesTree, setPagesTree } = usePageTree();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [isInvalidNesting, setIsInvalidNesting] = useState(false);

  // Use pagesTree from context instead of local state
  const itemsState = pagesTree.length > 0 ? pagesTree : items;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create maps to preserve titles and slugs
  const titleMap = useMemo(() => {
    const map = new Map<string, string>();
    const collectTitles = (nodes: PageTreeNode[]) => {
      nodes.forEach(node => {
        map.set(node.id, node.title);
        if (node.children) collectTitles(node.children);
      });
    };
    collectTitles(itemsState);
    return map;
  }, [itemsState]);

  const slugMap = useMemo(() => {
    const map = new Map<string, string>();
    const collectSlugs = (nodes: PageTreeNode[]) => {
      nodes.forEach(node => {
        map.set(node.id, node.slug);
        if (node.children) collectSlugs(node.children);
      });
    };
    collectSlugs(itemsState);
    return map;
  }, [itemsState]);

  const isDraftMap = useMemo(() => {
    const map = new Map<string, boolean>();
    const collectDrafts = (nodes: PageTreeNode[]) => {
      nodes.forEach(node => {
        map.set(node.id, node.isDraft);
        if (node.children) collectDrafts(node.children);
      });
    };
    collectDrafts(itemsState);
    return map;
  }, [itemsState]);

  const showOnMenuMap = useMemo(() => {
    const map = new Map<string, boolean>();
    const collectShowOnMenu = (nodes: PageTreeNode[]) => {
      nodes.forEach(node => {
        map.set(node.id, node.showOnMenu);
        if (node.children) collectShowOnMenu(node.children);
      });
    };
    collectShowOnMenu(itemsState);
    return map;
  }, [itemsState]);

  const translationsMap = useMemo(() => {
    const map = new Map<string, PageTranslationStatus[]>();
    const collectTranslations = (nodes: PageTreeNode[]) => {
      nodes.forEach(node => {
        if (node.translations) {
          map.set(node.id, node.translations);
        }
        if (node.children) collectTranslations(node.children);
      });
    };
    collectTranslations(itemsState);
    return map;
  }, [itemsState]);

  const flattenedItems = useMemo(() => flattenTree(itemsState), [itemsState]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 },
      disabled: disabled 
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates,
      disabled: disabled 
    })
  );

  const adjustTranslate: Modifiers = [
    ({ transform }) => ({ ...transform, y: transform.y - 25 })
  ];

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setOverId(active.id);
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
    
    // Check if this would be an invalid nesting
    if (over?.id && activeId && projected) {
      const wouldBeInvalid = 
        (projected.parentId && isDescendant(itemsState, String(activeId), String(projected.parentId))) ||
        isDescendant(itemsState, String(activeId), String(over.id));
      setIsInvalidNesting(wouldBeInvalid);
    } else {
      setIsInvalidNesting(false);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setOffsetLeft(0);
    setOverId(null);
    setIsInvalidNesting(false);

    if (projected && over) {
      // Prevent parent from becoming child of its own descendants
      const isInvalidDrop = 
        (projected.parentId && isDescendant(itemsState, String(active.id), String(projected.parentId))) ||
        isDescendant(itemsState, String(active.id), String(over.id));
      
      if (isInvalidDrop) {
        setTimeout(() => setActiveId(null), 200);
        return;
      }

      const flattenedItemsWithProjection = flattenedItems.map((item) =>
        item.id === active.id
          ? { ...item, depth: projected.depth, parentId: projected.parentId }
          : item
      );

      const activeIndex = flattenedItemsWithProjection.findIndex(({ id }) => id === active.id);
      const overIndex = flattenedItemsWithProjection.findIndex(({ id }) => id === over.id);
      const sortedItems = arrayMove(flattenedItemsWithProjection, activeIndex, overIndex);

      const newItems = buildTreeFromFlattened(sortedItems, titleMap, slugMap, translationsMap, isDraftMap, showOnMenuMap);
      setPagesTree(newItems);
      onChange?.(newItems);
    }

    setTimeout(() => setActiveId(null), 200);
  };

  const handleCollapse = (id: UniqueIdentifier) => {
    const toggleCollapse = (nodes: PageTreeNode[]): PageTreeNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, collapsed: !node.collapsed };
        }
        if (node.children) {
          return { ...node, children: toggleCollapse(node.children) };
        }
        return node;
      });
    };
    setPagesTree(toggleCollapse(itemsState));
  };

  const handleRemove = (id: UniqueIdentifier) => {
    const removeNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
      return nodes
        .filter(node => node.id !== id)
        .map(node => ({
          ...node,
          children: node.children ? removeNode(node.children) : undefined,
        }));
    };
    setPagesTree(removeNode(itemsState));
  };

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  if (!mounted) {
    return (
      <ul className="flex flex-col gap-2" role="tree">
        {flattenedItems.map(({ id, depth }) => {
          const node = findNode(itemsState, String(id));
          if (!node) return null;
          return (
            <li
              key={id}
              className="relative list-none"
              style={{ paddingLeft: `${indentationWidth * depth}px` }}
            >
              <div
                className="flex items-center gap-2 rounded-lg px-3 shadow-sm"
                style={{
                  border: "1px solid var(--puck-color-grey-09)",
                  background: "var(--puck-color-white)",
                  padding: "10px 12px"
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--puck-color-black)"
                  }}
                >
                  {node.title}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={flattenedItems}>
        <ul className="flex flex-col gap-2" role="tree">
          {flattenedItems.map(
            ({ id, collapsed, depth, children }) => {
              const node = findNode(itemsState, String(id));
              if (!node) return null;

              const hasChildren = (node.children?.length ?? 0) > 0;

              return (
                <SortableTreeItem
                  key={id}
                  id={id}
                  value={node.title}
                  depth={depth}
                  indentationWidth={indentationWidth}
                  collapsed={collapsed}
                  childCount={hasChildren ? node.children!.length : undefined}
                  indicator={overId === id && activeId !== id}
                  translations={node.translations}
                  pageSlug={node.slug}
                  pageId={node.id}
                  isSelected={selectedPage?.id === parseInt(node.id, 10)}
                  onCollapse={
                    collapsible && hasChildren
                      ? () => handleCollapse(id)
                      : undefined
                  }
                  onRemove={removable ? () => handleRemove(id) : undefined}
                  onClick={() => {
                    // Create a Page object from the node data
                    const page: Page & { translations?: typeof node.translations } = {
                      id: parseInt(node.id, 10),
                      title: node.title,
                      slug: node.slug,
                      isDraft: node.isDraft,
                      showOnMenu: node.showOnMenu,
                      sortOrder: 0,
                      parentId: null,
                      translations: node.translations,
                    };
                    setSelectedPage(page as any);
                  }}
                />
              );
            }
          )}
        </ul>
      </SortableContext>
      {activeItem && (
        <DragOverlay modifiers={adjustTranslate}>
          <div className="relative">
            <SortableTreeItem
              id={activeItem.id}
              value={titleMap.get(String(activeItem.id)) || ''}
              depth={projected?.depth ?? activeItem.depth}
              indentationWidth={indentationWidth}
              clone
            />
            {projected && (projected.depth !== activeItem.depth || isInvalidNesting) && (
              <Badge 
                variant={isInvalidNesting ? "destructive" : "default"}
                className="absolute -left-10 top-1/2 -translate-y-1/2 shadow-lg"
              >
                {isInvalidNesting ? (
                  <X className="h-3 w-3" />
                ) : projected.depth > activeItem.depth ? (
                  <ArrowRight className="h-3 w-3" />
                ) : (
                  <ArrowLeft className="h-3 w-3" />
                )}
              </Badge>
            )}
          </div>
        </DragOverlay>
      )}
    </DndContext>
  );
}
