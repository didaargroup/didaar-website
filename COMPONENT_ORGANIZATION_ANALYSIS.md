# Component & Form Organization Analysis

## Executive Summary

This document analyzes the current organization patterns of client-side components and forms in the Pucked codebase, identifies inconsistencies, and proposes a standardized best practice for future development.

**Current State**: Inconsistent organization with forms and client components split between `app/` and `components/` directories without clear principles.

**Impact**: Medium - Code is functional but creates confusion about where to place new components, leading to inconsistent patterns.

**Recommendation**: Adopt a clear, route-based organization principle with specific rules for what goes where.

---

## Current Organization Patterns

### Pattern 1: Forms Co-located with Routes (In `app/`)

**Location**: Forms placed in the same directory as their route page

**Examples**:
- `app/admin/(dashboard)/pages/create/form.tsx` → `CreatePageForm`
- `app/admin/(dashboard)/settings/settings-form.tsx` → `SettingsForm`
- `app/[locale]/login/login-form.tsx` → `LoginForm`
- `app/[locale]/invitation/validate/form.tsx` → `InvitationValidateForm`

**Pattern**:
```
app/
  route-group/
    route-name/
      page.tsx         # Server Component (route handler)
      form.tsx         # Client Component (form)
      layout.tsx       # Layout (if needed)
```

**Characteristics**:
- Form is named `form.tsx` or `{route}-form.tsx`
- Page imports and renders the form
- Form is tightly coupled to that specific route
- Form uses `useActionState` with server actions
- Form is NOT reused elsewhere

### Pattern 2: Reusable Components (In `components/`)

**Location**: Shared/reusable components in the `components/` directory

**Examples**:
- `components/admin/page-properties-form.tsx` → `PagePropertiesForm`
- `components/admin/admin-header.tsx` → `AdminHeader`
- `components/admin/admin-sidebar-left.tsx` → `AdminSidebar`
- `components/admin/admin-sidebar-right.tsx` → `AdminSidebarRight`
- `components/admin/sidebar-translations.tsx` → `SidebarTranslations`
- `components/admin/sortable-tree.tsx` → `SortableTree`
- `components/admin/translation-manager.tsx` → `TranslationManager`
- `components/admin/tiptap-editor.tsx` → `TipTapEditor`

**Pattern**:
```
components/
  admin/           # Admin-specific reusable components
    feature-name/
      component.tsx
  ui/              # Shadcn UI components
  guest-*.tsx      # Guest/public area components
```

**Characteristics**:
- Components are reused across multiple routes
- Components have generic, reusable names
- Components are feature-based, not route-based
- Can be used in multiple places in the application

### Pattern 3: Complex Client Components (In `app/`)

**Location**: Large, complex client components that are route-specific

**Examples**:
- `app/admin/(dashboard)/dashboard-content.tsx` → `DashboardContent`
- `app/admin/(dashboard)/pages-tree.tsx` → `PagesTree`
- `app/admin/(dashboard)/page-order-save.tsx` → `SavePageOrderButton`
- `app/admin/(dashboard)/admin-layout-context.tsx` → `AdminLayoutProvider`
- `app/admin/pages/[locale]/[slug]/edit/editor.tsx` → `Editor`

**Pattern**:
```
app/
  route-group/
    complex-component.tsx    # Large client component
    page.tsx                 # Route that uses it
```

**Characteristics**:
- Large, complex components (100+ lines)
- Tightly coupled to specific route context
- May include context providers
- May include complex state management
- Not reused elsewhere

---

## Inconsistencies Identified

### Issue 1: Similar Components in Different Locations

**Problem**: Components that serve similar purposes are organized differently.

**Examples**:
- `CreatePageForm` is in `app/admin/(dashboard)/pages/create/form.tsx`
- `PagePropertiesForm` is in `components/admin/page-properties-form.tsx`
- Both are forms, both are used in admin area
- But `CreatePageForm` is route-specific while `PagePropertiesForm` is reusable (used in sidebar)

**Impact**: Creates confusion about where to place new forms.

### Issue 2: Form Naming Inconsistency

**Problem**: Forms have different naming conventions.

**Examples**:
- `form.tsx` (generic) - `app/admin/(dashboard)/pages/create/form.tsx`
- `settings-form.tsx` (descriptive) - `app/admin/(dashboard)/settings/settings-form.tsx`
- `login-form.tsx` (descriptive) - `app/[locale]/login/login-form.tsx`
- `InvitationValidateForm` (component name) - `app/[locale]/invitation/validate/form.tsx`

**Impact**: Inconsistent import patterns and file discovery.

### Issue 3: Component Size vs. Location

**Problem**: Some large components are in `app/`, others in `components/`.

**Examples**:
- `DashboardContent` (in `app/`) - Large layout component
- `PagePropertiesForm` (in `components/`) - Large form (438 lines)
- `Editor` (in `app/`) - Large editor component (171 lines)

**Impact**: Unclear whether size should determine location.

### Issue 4: Context Providers in `app/`

**Problem**: Context providers are mixed with route components.

**Examples**:
- `AdminLayoutProvider` in `app/admin/(dashboard)/admin-layout-context.tsx`
- `PageSelectionProvider` in `components/admin/page-selection-context.tsx`

**Impact**: Inconsistent organization of shared state.

### Issue 5: Import Path Inconsistency

**Problem**: Different import patterns depending on location.

**Examples**:
```typescript
// From app/ importing components/
import { PagePropertiesForm } from "@/components/admin/page-properties-form";

// From app/ importing app/
import { CreatePageForm } from "./form";

// From components/ importing app/
import { savePageContent } from "@/app/actions";
```

**Impact**: Creates circular dependency risks and unclear import direction.

---

## Root Cause Analysis

### Why Did This Happen?

1. **Evolutionary Development**: Codebase evolved over time without clear initial guidelines
2. **Route-Group Specificity**: Some components started as route-specific but became reusable
3. **Component Growth**: Small components grew into large ones but weren't moved
4. **Multiple Developers**: Different developers made different choices
5. **Unclear Boundaries**: No clear definition of "route-specific" vs "reusable"

### What Makes It Confusing?

1. **No Clear Decision Tree**: Developers don't know where to place new components
2. **Similar Components, Different Locations**: Forms are split between `app/` and `components/`
3. **Size vs. Reusability**: Unclear if size or reusability determines location
4. **Context Providers**: Mixed organization of shared state
5. **Naming Inconsistency**: Different naming patterns for similar components

---

## Naming Convention: **kebab-case for File Names**

**CRITICAL**: All component file names must use **kebab-case** (e.g., `admin-header.tsx`), while component names use **PascalCase** (e.g., `AdminHeader`).

**Rationale**:
- ✅ Consistency with Shadcn UI
- ✅ Cross-platform safety (no case-sensitivity issues)
- ✅ URL-friendly
- ✅ Modern React/Next.js standard

**Example**:
```typescript
// File: admin-header.tsx (kebab-case)
export function AdminHeader() { }  // PascalCase

// Import:
import { AdminHeader } from "@/components/admin/admin-header";
```

**See Also**: `NAMING_CONVENTION_ANALYSIS.md` for detailed comparison.

---

## Proposed Best Practice

### Core Principle: **Route Co-location for Route-Specific, Shared for Reusable**

#### Decision Tree

```
Is the component a form?
├─ Yes → Is it ONLY used for one route?
│   ├─ Yes → Place in app/route-group/route/form.tsx
│   └─ No → Place in components/feature/component-name.tsx
└─ No → Is it a reusable UI component?
    ├─ Yes → Place in components/ (admin/, ui/, or guest-*)
    └─ No → Is it a layout/route wrapper?
        ├─ Yes → Place in app/route-group/wrapper-name.tsx
        └─ No → Is it a context provider?
            ├─ Yes → Place in contexts/ or components/contexts/
            └─ No → Place in components/feature/
```

### Detailed Rules

#### Rule 1: Route-Specific Forms → `app/route/form.tsx`

**Use when**:
- Form is ONLY used for one specific route
- Form is tightly coupled to route logic
- Form will NOT be reused elsewhere
- Form is the main content of the route

**File structure**:
```
app/
  admin/(dashboard)/pages/create/
    page.tsx         # Server Component
    form.tsx         # Client Component (form)
```

**Naming convention**:
- File: `form.tsx` (if only one form)
- File: `{action}-form.tsx` (if multiple forms)
- Component: `{RouteName}Form` or `{Action}Form` (PascalCase)

**Examples**:
- ✅ `app/admin/(dashboard)/pages/create/form.tsx` → `CreatePageForm`
- ✅ `app/[locale]/login/form.tsx` → `LoginForm`
- ✅ `app/[locale]/invitation/validate/form.tsx` → `InvitationValidateForm`

#### Rule 2: Reusable Forms → `components/feature/`

**Use when**:
- Form is used in multiple routes
- Form is used in shared UI (sidebars, modals, etc.)
- Form can be independently tested
- Form has generic, reusable purpose

**File structure**:
```
components/
  admin/
    page-properties-form.tsx    # Reusable form
  ui/
    form.tsx                    # Generic form wrapper (if needed)
```

**Naming convention**:
- File: `{feature}-form.tsx` or `{purpose}-form.tsx` (kebab-case)
- Component: `{Feature}Form` or `{Purpose}Form` (PascalCase)

**Examples**:
- ✅ `components/admin/page-properties-form.tsx` → `PagePropertiesForm` (used in sidebar)
- ✅ `components/admin/translation-manager.tsx` → `TranslationManager` (reusable)

#### Rule 3: Route Layout Components → `app/route-group/`

**Use when**:
- Component defines the layout structure for a route group
- Component wraps all pages in a route group
- Component provides context for the route group
- Component is tightly coupled to route group structure

**File structure**:
```
app/
  admin/(dashboard)/
    layout.tsx              # Next.js layout
    dashboard-content.tsx   # Layout wrapper (client)
    admin-layout-context.tsx  # Context provider
```

**Naming convention**:
- File: `{purpose}-content.tsx` or `{purpose}-wrapper.tsx`
- Component: `{Purpose}Content` or `{Purpose}Wrapper`

**Examples**:
- ✅ `app/admin/(dashboard)/dashboard-content.tsx` → `DashboardContent`
- ✅ `app/admin/(dashboard)/admin-layout-context.tsx` → `AdminLayoutProvider`

#### Rule 4: Reusable UI Components → `components/`

**Use when**:
- Component is used in multiple places
- Component is feature-agnostic
- Component can be part of a design system
- Component is independently testable

**File structure**:
```
components/
  admin/           # Admin-specific reusable components
  ui/              # Generic UI components (Shadcn)
  guest-*.tsx      # Guest/public area components
  contexts/        # Context providers (if not in app/)
```

**Naming convention**:
- File: `{feature}-{component}.tsx` or `{component}.tsx`
- Component: `{Feature}{Component}` or `{Component}`

**Examples**:
- ✅ `components/admin/admin-header.tsx` → `AdminHeader`
- ✅ `components/admin/admin-sidebar-left.tsx` → `AdminSidebar`
- ✅ `components/admin/sortable-tree.tsx` → `SortableTree`
- ✅ `components/admin/tiptap-editor.tsx` → `TipTapEditor`

#### Rule 5: Context Providers → `contexts/` or `components/contexts/`

**Use when**:
- Provider is shared across multiple route groups
- Provider is not tightly coupled to one route
- Provider provides application-wide or feature-wide state

**File structure**:
```
contexts/
  notification-context.tsx
  page-tree-context.tsx

OR

components/
  contexts/
    page-selection-context.tsx
```

**Naming convention**:
- File: `{feature}-context.tsx`
- Provider: `{Feature}Provider`
- Hook: `use{Feature}`

**Examples**:
- ✅ `contexts/notification-context.tsx` → `NotificationProvider`, `useNotifications`
- ✅ `contexts/page-tree-context.tsx` → `PageTreeProvider`, `usePageTree`
- ✅ `components/admin/page-selection-context.tsx` → `PageSelectionProvider`, `usePageSelection`

#### Rule 6: Puck/Editor Components → `components/admin/`

**Use when**:
- Component is a Puck block/component
- Component is used in the page editor
- Component is part of the admin design system

**File structure**:
```
components/
  admin/
    image-block.tsx
    heading-block.tsx
    grid-block.tsx
    link-block.tsx
    spacer-block.tsx
    tip-tap-block.tsx
```

**Naming convention**:
- File: `{type}-block.tsx`
- Component: `{Type}Block`

**Examples**:
- ✅ `components/admin/image-block.tsx` → `ImageBlock`
- ✅ `components/admin/heading-block.tsx` → `HeadingBlock`
- ✅ `components/admin/spacer-block.tsx` → `SpacerBlock`

---

## Migration Plan

### Phase 1: Document and Communicate (Week 1)

1. ✅ Create this analysis document
2. Add to `.github/copilot-instructions.md`
3. Create `/admin/docs/dev/component-organization` (as admin documentation)
4. Team review and feedback

### Phase 2: Audit Existing Components (Week 1-2)

Create a checklist of all components and categorize them:

**Route-Specific (Keep in `app/`)**:
- ✅ `app/admin/(dashboard)/pages/create/form.tsx` → Keep
- ✅ `app/admin/(dashboard)/settings/settings-form.tsx` → Keep
- ✅ `app/[locale]/login/login-form.tsx` → Keep
- ✅ `app/[locale]/invitation/validate/form.tsx` → Keep
- ✅ `app/admin/(dashboard)/dashboard-content.tsx` → Keep
- ✅ `app/admin/(dashboard)/pages-tree.tsx` → Keep
- ✅ `app/admin/(dashboard)/page-order-save.tsx` → Keep
- ✅ `app/admin/(dashboard)/admin-layout-context.tsx` → Keep
- ✅ `app/admin/pages/[locale]/[slug]/edit/editor.tsx` → Keep

**Reusable (Keep in `components/`)**:
- ✅ `components/admin/page-properties-form.tsx` → Keep
- ✅ `components/admin/admin-header.tsx` → Keep
- ✅ `components/admin/admin-sidebar-left.tsx` → Keep
- ✅ `components/admin/admin-sidebar-right.tsx` → Keep
- ✅ `components/admin/sidebar-translations.tsx` → Keep
- ✅ `components/admin/sortable-tree.tsx` → Keep
- ✅ `components/admin/translation-manager.tsx` → Keep
- ✅ `components/admin/tiptap-editor.tsx` → Keep

**Context Providers (Consider moving to `contexts/`)**:
- ⚠️ `components/admin/page-selection-context.tsx` → Consider moving to `contexts/`

### Phase 3: Standardize Naming (Week 2)

**Standardize form file naming**:
- `app/admin/(dashboard)/pages/create/form.tsx` → Keep as `form.tsx` ✅
- `app/admin/(dashboard)/settings/settings-form.tsx` → Rename to `form.tsx`
- `app/[locale]/login/login-form.tsx` → Rename to `form.tsx`
- `app/[locale]/invitation/validate/form.tsx` → Keep as `form.tsx` ✅

**Rationale**: Consistent naming makes it easier to find forms.

**Status**: ✅ **COMPLETED** - All files now use kebab-case naming convention.

### Phase 4: Move Context Providers (Week 2-3)

**Move to `contexts/`**:
- `components/admin/page-selection-context.tsx` → `contexts/page-selection-context.tsx`

**Update imports**:
- Search and replace all imports

### Phase 5: Update Documentation (Week 3)

1. Update `.github/copilot-instructions.md` with new rules
2. Create `/admin/docs/dev/component-organization` with examples
3. Add decision tree diagram
4. Add code examples for each pattern

---

## Quick Reference Guide

### Where Should I Put This Component?

| Component Type | Location | File Name | Example |
|----------------|----------|-----------|---------|
| Route-specific form | `app/route/form.tsx` | `form.tsx` | `app/admin/pages/create/form.tsx` |
| Reusable form | `components/feature/` | `{feature}-form.tsx` | `components/admin/page-properties-form.tsx` |
| Route layout wrapper | `app/route-group/` | `{purpose}-content.tsx` | `app/admin/dashboard-content.tsx` |
| Reusable UI component | `components/` | `{component}.tsx` | `components/admin/admin-header.tsx` |
| Context provider | `contexts/` | `{feature}-context.tsx` | `contexts/notification-context.tsx` |
| Puck block | `components/admin/` | `{type}-block.tsx` | `components/admin/image-block.tsx` |

### Naming Conventions

**All file names use kebab-case. All component names use PascalCase.**

| Type | File Name | Component Name | Example |
|------|-----------|----------------|---------|
| Form (route-specific) | `form.tsx` | `{Route}Form` | `app/admin/pages/create/form.tsx` → `CreatePageForm` |
| Form (reusable) | `{feature}-form.tsx` | `{Feature}Form` | `components/admin/page-properties-form.tsx` → `PagePropertiesForm` |
| Layout wrapper | `{purpose}-content.tsx` | `{Purpose}Content` | `app/admin/dashboard-content.tsx` → `DashboardContent` |
| UI component | `{component}.tsx` | `{Component}` | `components/admin/admin-header.tsx` → `AdminHeader` |
| Context | `{feature}-context.tsx` | `{Feature}Provider`, `use{Feature}` | `contexts/notification-context.tsx` → `NotificationProvider` |
| Puck block | `{type}-block.tsx` | `{Type}Block` | `components/admin/image-block.tsx` → `ImageBlock` |

---

## Common Patterns

### Pattern 1: Simple Route with Form

```typescript
// app/admin/pages/create/page.tsx
import { CreatePageForm } from "./form";

export default async function CreatePage() {
  return (
    <div>
      <h1>Create New Page</h1>
      <CreatePageForm />
    </div>
  );
}
```

```typescript
// app/admin/pages/create/form.tsx
"use client";

import { useActionState } from "react";
import { createPageAction } from "@/app/actions";

export function CreatePageForm() {
  const [state, formAction] = useActionState(createPageAction, {});
  
  return (
    <form action={formAction}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 2: Route with Reusable Component

```typescript
// app/admin/(dashboard)/page.tsx
import { PagesTree } from "./pages-tree";

export default async function DashboardPage() {
  await requireAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <PagesTree />
    </div>
  );
}
```

```typescript
// app/admin/(dashboard)/pages-tree.tsx
"use client";

import { SortableTree } from "@/components/admin/sortable-tree";

export function PagesTree() {
  return (
    <div>
      <SortableTree />
    </div>
  );
}
```

### Pattern 3: Reusable Form in Sidebar

```typescript
// components/admin/page-properties-form.tsx
"use client";

import { useActionState } from "react";
import { updatePageAction } from "@/app/actions";

export function PagePropertiesForm({ page }: { page: Page }) {
  const [state, formAction] = useActionState(
    updatePageAction.bind(null, page.id),
    {}
  );
  
  return (
    <form action={formAction}>
      {/* Form fields */}
    </form>
  );
}
```

```typescript
// components/admin/admin-sidebar-right.tsx
"use client";

import { PagePropertiesForm } from "./page-properties-form";

export function AdminSidebarRight({ children, title }) {
  return (
    <aside>
      <h2>{title}</h2>
      {children}
      {/* Used here */}
    </aside>
  );
}
```

---

## Decision Checklist

Before creating a new component, ask yourself:

1. **Is this a form?**
   - ✅ Yes → Is it ONLY used for one route?
     - ✅ Yes → Put in `app/route/form.tsx`
     - ❌ No → Put in `components/feature/{feature}-form.tsx`
   - ❌ No → Continue to #2

2. **Is this a reusable UI component?**
   - ✅ Yes → Put in `components/` (admin/, ui/, or guest-*)
   - ❌ No → Continue to #3

3. **Is this a layout/route wrapper?**
   - ✅ Yes → Put in `app/route-group/{purpose}-content.tsx`
   - ❌ No → Continue to #4

4. **Is this a context provider?**
   - ✅ Yes → Put in `contexts/{feature}-context.tsx`
   - ❌ No → Put in `components/feature/{component}.tsx`

---

## Conclusion

The current organization is functional but inconsistent. By adopting the proposed best practice, we can:

1. **Reduce confusion**: Clear rules for where to put components
2. **Improve discoverability**: Consistent naming and locations
3. **Enable better refactoring**: Clear separation of concerns
4. **Support team collaboration**: Shared understanding of structure
5. **Scale effectively**: Patterns that work as the app grows

The migration plan is incremental and can be done without disrupting development. Start with new components following the rules, then gradually refactor existing ones.

---

## Next Steps

1. **Review this document** with the team
2. **Get feedback** on the proposed rules
3. **Update documentation** (`.github/copilot-instructions.md` and `/admin/docs`)
4. **Start applying** to new components
5. **Gradually refactor** existing components (low priority)

---

*Last Updated: 2025-12-30*
*Status: Proposed - Awaiting Team Review*
