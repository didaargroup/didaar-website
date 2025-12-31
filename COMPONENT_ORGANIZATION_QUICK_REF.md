# Component Organization Quick Reference

## Naming Convention

**File Names**: kebab-case (`admin-header.tsx`)
**Component Names**: PascalCase (`AdminHeader`)

**Why kebab-case?**
- ✅ Consistency with Shadcn UI
- ✅ Cross-platform safety
- ✅ URL-friendly
- ✅ Modern standard

**Example**:
```typescript
// File: admin-header.tsx
export function AdminHeader() { }

// Import:
import { AdminHeader } from "@/components/admin/admin-header";
```

---

## Decision Tree

```
Is it a form?
├─ Yes → Used in ONLY one route?
│   ├─ Yes → app/route/form.tsx
│   └─ No → components/feature/{feature}-form.tsx
└─ No → Reusable UI component?
    ├─ Yes → components/ (admin/, ui/, guest-*)
    └─ No → Layout/route wrapper?
        ├─ Yes → app/route-group/{purpose}-content.tsx
        └─ No → Context provider?
            ├─ Yes → contexts/{feature}-context.tsx
            └─ No → components/feature/{component}.tsx
```

## Location Guide

| Component Type | Location | File Name | Component Name | Example |
|----------------|----------|-----------|----------------|---------|
| Route-specific form | `app/route/form.tsx` | `form.tsx` | `{Route}Form` | `app/admin/pages/create/form.tsx` → `CreatePageForm` |
| Reusable form | `components/feature/` | `{feature}-form.tsx` | `{Feature}Form` | `components/admin/page-properties-form.tsx` → `PagePropertiesForm` |
| Route layout wrapper | `app/route-group/` | `{purpose}-content.tsx` | `{Purpose}Content` | `app/admin/dashboard-content.tsx` → `DashboardContent` |
| Reusable UI component | `components/` | `{component}.tsx` | `{Component}` | `components/admin/admin-header.tsx` → `AdminHeader` |
| Context provider | `contexts/` | `{feature}-context.tsx` | `{Feature}Provider` | `contexts/notification-context.tsx` → `NotificationProvider` |
| Puck block | `components/admin/` | `{type}-block.tsx` | `{Type}Block` | `components/admin/image-block.tsx` → `ImageBlock` |

## Naming Conventions

**All file names use kebab-case. All component names use PascalCase.**

| Type | File Name | Component Name | Example |
|------|-----------|----------------|---------|
| Form (route-specific) | `form.tsx` | `{Route}Form` | `form.tsx` → `CreatePageForm` |
| Form (reusable) | `{feature}-form.tsx` | `{Feature}Form` | `page-properties-form.tsx` → `PagePropertiesForm` |
| Layout wrapper | `{purpose}-content.tsx` | `{Purpose}Content` | `dashboard-content.tsx` → `DashboardContent` |
| UI component | `{component}.tsx` | `{Component}` | `admin-header.tsx` → `AdminHeader` |
| Context | `{feature}-context.tsx` | `{Feature}Provider`, `use{Feature}` | `notification-context.tsx` → `NotificationProvider` |
| Puck block | `{type}-block.tsx` | `{Type}Block` | `image-block.tsx` → `ImageBlock` |

## Key Rules

1. **Route-specific forms** → Co-locate with route in `app/route/form.tsx`
2. **Reusable forms** → `components/feature/`
3. **Reusable UI components** → `components/`
4. **Layout wrappers** → `app/route-group/`
5. **Context providers** → `contexts/`
6. **Puck blocks** → `components/admin/`

## Import Patterns

```typescript
// ✅ GOOD: Page importing co-located form
import { CreatePageForm } from "./form";

// ✅ GOOD: Page importing reusable component
import { AdminHeader } from "@/components/admin/admin-header";

// ✅ GOOD: Component importing server action
import { createPageAction } from "@/app/actions";

// ❌ BAD: Component importing from app/ (unless actions)
import { Something } from "@/app/some-route/component";
```

## Common Patterns

### Route with Form

```typescript
// app/admin/pages/create/page.tsx
import { CreatePageForm } from "./form";

export default async function CreatePage() {
  return <CreatePageForm />;
}
```

```typescript
// app/admin/pages/create/form.tsx
"use client";
export function CreatePageForm() { /* ... */ }
```

### Reusable Component

```typescript
// components/admin/admin-header.tsx
"use client";
export function AdminHeader() { /* ... */ }
```

```typescript
// app/admin/layout.tsx
import { AdminHeader } from "@/components/admin/admin-header";
```

---

*See COMPONENT_ORGANIZATION_ANALYSIS.md for detailed analysis*
