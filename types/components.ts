/**
 * Component Types
 *
 * Shared types for React components across the application.
 */

import type { HTMLAttributes, ReactNode } from "react";
import type { PageTranslationStatus } from "./database";
import { FormResults } from "./actions";

/**
 * Props for admin sidebar right panel
 */
export interface AdminSidebarRightProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Props for image block component
 */
export interface ImageBlockProps {
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * Props for TreeItem component
 */
export interface TreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  translations?: PageTranslationStatus[];
  pageSlug?: string;
  pageId?: string;
  isSelected?: boolean;
  onCollapse?(): void;
  onRemove?(): void;
  onClick?(): void;
}

/**
 * Props for sortable tree component
 */
export interface SortableTreeProps {
  items: import("./database").PageTreeNode[];
  onChange?: (items: import("./database").PageTreeNode[]) => void;
  collapsible?: boolean;
  removable?: boolean;
  indentationWidth?: number;
}


export type HeaderActionBase = {
label: string;
  icon?: ReactNode;
};
export type HeaderActionButton = HeaderActionBase & {
  onClick: () => void;
  variant?: "primary" | "secondary";
};
export type HeaderActionLink = HeaderActionBase & {
  label: string;
  href: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
};
export type HeaderActionDropdown = HeaderActionBase & {
  options: Array<HeaderActionButton | HeaderActionLink>;
};
export type HeaderAction = HeaderActionButton | HeaderActionLink | HeaderActionDropdown;
export type AdminLayoutState = {
  sidebarLeftVisible: boolean;
  setSidebarLeftVisible: (visible: boolean) => void;
  toggleSidebarLeft: () => void;
  sidebarRightVisible: boolean;
  setSidebarRightVisible: (visible: boolean) => void;
  toggleSidebarRight: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  toggleLoading?: () => void;

  actions: HeaderAction[];
  setActions: (actions: HeaderAction[]) => void;

  forms: Map<string, RegisteredForm<unknown>>;
  setForms: (forms: Map<string, RegisteredForm<unknown>>) => void;
  
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;

  registerForm: <T = Record<string, any>,>(form: RegisteredForm<T>) => () => void;
  updateForm: <T = Record<string, any>,>(id: string, updates: Partial<RegisteredForm<T>>) => void;
  submitAll: (e: any) => Promise<void>;
  hasDirtyForm: boolean;
  allErrors: Record<string, Record<string, string[]>>;
  hasErrors: boolean;
};

/**
 * Form registration for unified header save button
 * @template T Form Schema type
 */
export interface RegisteredForm<T = Record<string, any>> {
  id: string;
  isDirty: boolean;
  isValid: boolean;
  submit: () => Promise<void>;
  errors: FormResults<T>['errors'];
  successMessage?: string;
}


/**
 * Form registry state for unified header save button
 * 
 * SIMPLIFIED APPROACH: No complex generics. The registry stores forms with
 * different schema types, but each form is fully typed when you register it.
 * 
 * Type safety happens at registration time, not in the registry itself.
 * 
 * @example
 * ```ts
 * // Define your form schemas
 * type PageDetailsSchema = { title: string; slug: string };
 * type PageOrderSchema = { order: number[]; parentId: string };
 * 
 * // Register forms with full type safety
 * registerForm<PageDetailsSchema>({
 *   id: 'page-details',
 *   errors: { title: ['Required'] }, // Fully typed!
 *   // ...
 * });
 * 
 * registerForm<PageOrderSchema>({
 *   id: 'page-order',
 *   errors: { order: ['Invalid'] }, // Fully typed!
 *   // ...
 * });
 * 
 * // allErrors aggregates errors from all forms
 * allErrors: {
 *   'page-details': { title?: string[]; slug?: string[] },
 *   'page-order': { order?: string[]; parentId?: string[] }
 * }
 * ```
 */
export interface FormRegistryState {
  forms: Map<string, RegisteredForm<unknown>>;
  registerForm<T>(form: RegisteredForm<T>): () => void;
  updateForm<T>(id: string, updates: Partial<RegisteredForm<T>>): void;
  submitAll(): Promise<boolean>;
  hasDirtyForms: boolean;
  hasErrors: boolean;
  allErrors: Record<string, Record<string, string[]>>;
  isSubmitting: boolean;
}

