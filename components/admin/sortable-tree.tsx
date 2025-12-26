"use client";

import React, { useState, useMemo } from "react";
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
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { TreeItem, FlattenedItem } from "@/components/types";

export interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  children?: PageTreeNode[];
  collapsed?: boolean;
}

interface SortableTreeProps {
  items: PageTreeNode[];
  onChange?: (items: PageTreeNode[]) => void;
  collapsible?: boolean;
  removable?: boolean;
  indentationWidth?: number;
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
function toPageTreeNode(item: TreeItem, titleMap: Map<string, string>, slugMap: Map<string, string>): PageTreeNode {
  const id = String(item.id);
  return {
    id,
    title: titleMap.get(id) || '',
    slug: slugMap.get(id) || '',
    children: item.children.map(child => toPageTreeNode(child, titleMap, slugMap)),
    collapsed: item.collapsed,
  };
}

// Flatten tree items
function flattenTree(
  items: PageTreeNode[],
  parentId: UniqueIdentifier | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { id: item.id, parentId, depth, index, children: [], collapsed: item.collapsed },
      ...flattenTree(item.children || [], item.id, depth + 1),
    ];
  }, []);
}

// Build tree from flattened items
function buildTreeFromFlattened(flattenedItems: FlattenedItem[], titleMap: Map<string, string>, slugMap: Map<string, string>): PageTreeNode[] {
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

  return root.children.map(item => toPageTreeNode(item, titleMap, slugMap));
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
}: SortableTreeProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const [itemsState, setItemsState] = useState<PageTreeNode[]>(items);

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
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const adjustTranslate = ({
    transform
  }: {
    transform: { x: number; y: number };
  }) => {
    return {
      ...transform,
      y: transform.y - 25,
    };
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setOverId(active.id);
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setOffsetLeft(0);

    if (projected && over) {
      const flattenedItemsWithProjection = flattenedItems.map((item) => {
        if (item.id === active.id) {
          return {
            ...item,
            depth: projected.depth,
            parentId: projected.parentId,
          };
        }
        return item;
      });

      const sortedItems = arrayMove(
        flattenedItemsWithProjection,
        flattenedItemsWithProjection.findIndex(({ id }) => id === active.id),
        flattenedItemsWithProjection.findIndex(({ id }) => id === over.id)
      );

      const newItems = buildTreeFromFlattened(sortedItems, titleMap, slugMap);
      setItemsState(newItems);
      onChange?.(newItems);
    }

    setActiveId(null);
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
    setItemsState(toggleCollapse(itemsState));
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
    setItemsState(removeNode(itemsState));
  };

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

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
            ({ id, collapsed, depth }) => {
              const node = itemsState.find(n => n.id === id);
              if (!node) return null;

              return (
                <SortableTreeItem
                  key={id}
                  id={id}
                  value={node.title}
                  depth={depth}
                  indentationWidth={indentationWidth}
                  collapsed={collapsed}
                  onCollapse={
                    collapsible && collapsed !== undefined
                      ? () => handleCollapse(id)
                      : undefined
                  }
                  onRemove={removable ? () => handleRemove(id) : undefined}
                />
              );
            }
          )}
        </ul>
      </SortableContext>
      {typeof window !== "undefined" && activeItem && (
        <DragOverlay modifiers={isMobile ? undefined : adjustTranslate}>
          <SortableTreeItem
            id={activeItem.id}
            value={titleMap.get(String(activeItem.id)) || ''}
            depth={activeItem.depth}
            indentationWidth={indentationWidth}
            clone
            ghost
          />
        </DragOverlay>
      )}
    </DndContext>
  );
}
