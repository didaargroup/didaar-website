# Puck Components - Quick Implementation Guide

## Overview

This guide shows you exactly how to use Puck components in your dashboard for consistency with the Puck editor.

**Time to implement:** 1-2 hours
**Difficulty:** Easy
**Maintenance:** None (Puck handles updates)

---

## Table of Contents

1. [Installation](#installation)
2. [Import Patterns](#import-patterns)
3. [Component Reference](#component-reference)
4. [Common Patterns](#common-patterns)
5. [Migration Examples](#migration-examples)
6. [Troubleshooting](#troubleshooting)

---

## Installation

You already have Puck installed, but verify:

```bash
# Check your package.json
pnpm list @measured/puck

# Should show version 0.20.2 or higher
```

**No additional installation needed!**

---

## Import Patterns

### Standard Import

```tsx
import { Button, ActionBar, IconButton } from "@measured/puck";
```

### With Icons (Lucide React)

```tsx
import { Button, ActionBar, IconButton } from "@measured/puck";
import { Plus, Edit, Trash, Settings } from "lucide-react";
```

### Type Imports (for TypeScript)

```tsx
import type { ReactNode } from "react";
import { Button } from "@measured/puck";
```

---

## Component Reference

### Button

**Props:**
- `children`: ReactNode (button text)
- `variant`: "primary" | "secondary"
- `icon`: ReactNode (optional icon element)
- `href`: string (optional, renders as `<a>`)
- `onClick`: (e: SyntheticEvent) => void | Promise<void>
- `type`: "button" | "submit" | "reset"
- `disabled`: boolean
- `fullWidth`: boolean
- `size`: "medium" | "large"
- `loading`: boolean
- `newTab`: boolean (for links)

**Examples:**

```tsx
// Primary button
<Button variant="primary">Save</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Button with icon
<Button variant="primary" icon={<Plus className="h-4 w-4" />}>
  New page
</Button>

// Link button
<Button href="/admin/pages" variant="secondary">
  View all pages
</Button>

// Full width button
<Button variant="primary" fullWidth>
  Submit
</Button>

// Loading button
<Button variant="primary" loading>
  Saving...
</Button>

// Submit button in form
<Button type="submit" variant="primary">
  Create
</Button>

// Disabled button
<Button variant="primary" disabled>
  Cannot click
</Button>
```

**Styling:**
- Primary: Azure blue background (#0066c9), white text
- Secondary: Transparent background, azure border, azure text
- Hover: Darker azure for primary, light azure for secondary
- Radius: 4px
- Padding: 7px 19px (medium), 11px 19px (large)

---

### ActionBar

**Props:**
- `label`: string (optional label text)
- `children`: ReactNode (ActionBar.Group or ActionBar.Action)

**Sub-components:**
- `ActionBar.Group`: Groups related actions
- `ActionBar.Action`: Individual action button
- `ActionBar.Label`: Label text (alternative to `label` prop)
- `ActionBar.Separator`: Visual separator

**Examples:**

```tsx
// Basic action bar
<ActionBar label="Actions">
  <ActionBar.Action onClick={handleSave}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
</ActionBar>

// Action bar with groups
<ActionBar label="Page actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleCreate}>
      <Button variant="primary" icon={<Plus />}>
        New page
      </Button>
    </ActionBar.Action>
  </ActionBar.Group>

  <ActionBar.Group>
    <ActionBar.Action onClick={handleEdit}>
      <Button variant="secondary" icon={<Edit />}>
        Edit
      </Button>
    </ActionBar.Action>
    <ActionBar.Action onClick={handleDelete}>
      <Button variant="secondary" icon={<Trash />}>
        Delete
      </Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>

// Action bar with label
<ActionBar>
  <ActionBar.Label label="Page actions" />
  <ActionBar.Group>
    <ActionBar.Action onClick={handleSave}>
      <Button variant="primary">Save</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>

// Action bar with separator
<ActionBar label="Actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleAction1}>
      <Button variant="secondary">Action 1</Button>
    </ActionBar.Action>
  </ActionBar.Group>

  <ActionBar.Separator />

  <ActionBar.Group>
    <ActionBar.Action onClick={handleAction2}>
      <Button variant="secondary">Action 2</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>
```

**Styling:**
- Background: Dark grey (#181818)
- Label: Light grey text (#c3c3c3)
- Groups: Separated by 0.5px vertical line
- Radius: 8px
- Padding: 4px

---

### IconButton

**Props:**
- `children`: ReactNode (icon element)
- `title`: string (required for accessibility)
- `onClick`: (e: SyntheticEvent) => void | Promise<void>
- `type`: "button" | "submit" | "reset"
- `href`: string (optional, renders as `<a>`)
- `disabled`: boolean
- `active`: boolean
- `newTab`: boolean (for links)

**Examples:**

```tsx
// Basic icon button
<IconButton type="button" title="Settings" onClick={handleSettings}>
  <Settings focusable={false} />
</IconButton>

// Icon button with custom icon
<IconButton type="button" title="Edit" onClick={handleEdit}>
  <Edit focusable={false} />
</IconButton>

// Link icon button
<IconButton href="/admin/settings" title="Settings">
  <Settings focusable={false} />
</IconButton>

// Active icon button
<IconButton type="button" title="Active" active onClick={handleClick}>
  <Star focusable={false} />
</IconButton>

// Disabled icon button
<IconButton type="button" title="Disabled" disabled onClick={handleClick}>
  <Lock focusable={false} />
</IconButton>

// Submit icon button
<IconButton type="submit" title="Submit">
  <Check focusable={false} />
</IconButton>
```

**Important:**
- **Always include `title` prop** for accessibility
- **Always add `focusable={false}`** to Lucide icons (prevents double focus)
- **Never use IconButton for text** (use Button instead)

**Styling:**
- Background: Transparent
- Hover: Light grey (#efefef)
- Active: Azure blue color (#0066c9)
- Radius: 4px
- Padding: 4px
- Size: 32px × 32px

---

### Drawer

**Props:**
- `children`: ReactNode (Drawer.Item components)

**Sub-components:**
- `Drawer.Item`: Draggable item

**Examples:**

```tsx
// Basic drawer
<Drawer>
  <Drawer.Item name="Heading" label="Heading" />
  <Drawer.Item name="Text" label="Text" />
  <Drawer.Item name="Button" label="Button" />
</Drawer>

// Drawer with custom items
<Drawer>
  <Drawer.Item
    name="CustomComponent"
    label="Custom Component"
    isDragDisabled={false}
  >
    {({ children }) => (
      <div className="custom-drawer-item">
        {children}
      </div>
    )}
  </Drawer.Item>
</Drawer>
```

**Note:** Drawer is primarily used in the Puck editor. You typically won't use it in your dashboard unless you're building a custom component picker.

---

### AutoField

**Props:**
- `field`: Field object (type, label, etc.)
- `value`: any
- `onChange`: (value: any) => void
- `readOnly`: boolean

**Examples:**

```tsx
// Text field
<AutoField
  field={{ type: "text", label: "Title" }}
  value={title}
  onChange={setTitle}
/>

// Number field
<AutoField
  field={{ type: "number", label: "Count" }}
  value={count}
  onChange={setCount}
/>

// Select field
<AutoField
  field={{
    type: "select",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  }}
  value={status}
  onChange={setStatus}
/>
```

**Note:** AutoField is primarily used in the Puck editor's field sidebar. You typically won't use it in your dashboard unless you're building custom forms.

---

### FieldLabel

**Props:**
- `label`: string
- `icon`: ReactNode (optional)
- `readOnly`: boolean
- `children`: ReactNode

**Examples:**

```tsx
// Basic label
<FieldLabel label="Title">
  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
</FieldLabel>

// Label with icon
<FieldLabel label="URL" icon={<Link className="h-4 w-4" />}>
  <Input value={url} onChange={(e) => setUrl(e.target.value)} />
</FieldLabel>

// Read-only label
<FieldLabel label="ID" readOnly>
  <span>{id}</span>
</FieldLabel>
```

**Note:** FieldLabel is primarily used in the Puck editor. You typically won't use it in your dashboard.

---

## Common Patterns

### Pattern 1: Page Header with Actions

```tsx
import { ActionBar, Button } from "@measured/puck";
import { Plus, Edit, Trash } from "lucide-react";

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Manage your pages
          </p>
        </div>

        <ActionBar label="Actions">
          <ActionBar.Group>
            <ActionBar.Action onClick={handleCreate}>
              <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
                New page
              </Button>
            </ActionBar.Action>
          </ActionBar.Group>
        </ActionBar>
      </div>
    </div>
  );
}
```

### Pattern 2: Table Row Actions

```tsx
import { IconButton } from "@measured/puck";
import { Edit, Trash, Eye } from "lucide-react";

export function TableRowActions({ onEdit, onDelete, onView }: {
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <IconButton
        type="button"
        title="View"
        onClick={onView}
      >
        <Eye focusable={false} className="h-4 w-4" />
      </IconButton>

      <IconButton
        type="button"
        title="Edit"
        onClick={onEdit}
      >
        <Edit focusable={false} className="h-4 w-4" />
      </IconButton>

      <IconButton
        type="button"
        title="Delete"
        onClick={onDelete}
      >
        <Trash focusable={false} className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
```

### Pattern 3: Form Actions

```tsx
import { ActionBar, Button } from "@measured/puck";
import { Save, X } from "lucide-react";

export function FormActions({ onCancel, onSave }: {
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <ActionBar label="Form actions">
      <ActionBar.Group>
        <ActionBar.Action onClick={onSave}>
          <Button variant="primary" icon={<Save className="h-4 w-4" />}>
            Save
          </Button>
        </ActionBar.Action>
      </ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action onClick={onCancel}>
          <Button variant="secondary" icon={<X className="h-4 w-4" />}>
            Cancel
          </Button>
        </ActionBar.Action>
      </ActionBar.Group>
    </ActionBar>
  );
}
```

### Pattern 4: Confirmation Dialog

```tsx
import { ActionBar, Button } from "@measured/puck";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ onConfirm, onCancel }: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Are you sure?
          </h3>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <ActionBar label="Confirm">
        <ActionBar.Group>
          <ActionBar.Action onClick={onConfirm}>
            <Button variant="primary">Confirm</Button>
          </ActionBar.Action>
        </ActionBar.Group>

        <ActionBar.Group>
          <ActionBar.Action onClick={onCancel}>
            <Button variant="secondary">Cancel</Button>
          </ActionBar.Action>
        </ActionBar.Group>
      </ActionBar>
    </div>
  );
}
```

### Pattern 5: Mobile Navigation Toggle

```tsx
import { IconButton } from "@measured/puck";
import { PanelLeft } from "lucide-react";

export function MobileNavToggle() {
  const toggleSidebar = () => {
    const sidebar = document.querySelector("[data-sidebar]") as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <div className="lg:hidden">
      <IconButton
        type="button"
        title="Toggle sidebar"
        onClick={toggleSidebar}
      >
        <PanelLeft focusable={false} className="h-5 w-5" />
      </IconButton>
    </div>
  );
}
```

---

## Migration Examples

### Example 1: Migrating Shadcn Button to Puck Button

**Before (Shadcn UI):**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" onClick={handleClick}>
  Click me
</Button>
```

**After (Puck):**
```tsx
import { Button } from "@measured/puck";

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

**Changes:**
- Import from `@measured/puck` instead of `@/components/ui/button`
- Change `variant="default"` to `variant="primary"`

---

### Example 2: Migrating Button Group to ActionBar

**Before (Plain buttons):**
```tsx
<div className="flex gap-2">
  <button onClick={handleSave}>Save</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

**After (ActionBar):**
```tsx
<ActionBar label="Actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleSave}>
      <Button variant="primary">Save</Button>
    </ActionBar.Action>
  </ActionBar.Group>
  <ActionBar.Group>
    <ActionBar.Action onClick={handleCancel}>
      <Button variant="secondary">Cancel</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>
```

---

### Example 3: Migrating Icon Button

**Before (Shadcn UI):**
```tsx
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

<Button variant="ghost" size="icon" onClick={handleSettings}>
  <Settings className="h-4 w-4" />
</Button>
```

**After (Puck):**
```tsx
import { IconButton } from "@measured/puck";
import { Settings } from "lucide-react";

<IconButton
  type="button"
  title="Settings"
  onClick={handleSettings}
>
  <Settings focusable={false} className="h-4 w-4" />
</IconButton>
```

**Changes:**
- Use `IconButton` instead of `Button`
- Add required `title` prop
- Add `focusable={false}` to icon

---

### Example 4: Migrating Form Actions

**Before (Shadcn UI):**
```tsx
import { Button } from "@/components/ui/button";

<div className="flex justify-end gap-2">
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button onClick={onSave}>
    Save
  </Button>
</div>
```

**After (Puck):**
```tsx
import { ActionBar, Button } from "@measured/puck";

<ActionBar label="Form actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={onSave}>
      <Button variant="primary">Save</Button>
    </ActionBar.Action>
  </ActionBar.Group>
  <ActionBar.Group>
    <ActionBar.Action onClick={onCancel}>
      <Button variant="secondary">Cancel</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>
```

---

## Troubleshooting

### Issue: Button doesn't accept `className` prop

**Problem:**
```tsx
<Button className="my-custom-class" variant="primary">
  Click me
</Button>
// Error: Property 'className' does not exist on type 'IntrinsicAttributes'
```

**Solution:**
Puck Button doesn't accept `className`. Use a wrapper div:
```tsx
<div className="my-custom-class">
  <Button variant="primary">Click me</Button>
</div>
```

---

### Issue: IconButton missing `title` prop

**Problem:**
```tsx
<IconButton onClick={handleClick}>
  <Settings focusable={false} />
</IconButton>
// Warning: IconButton requires title prop for accessibility
```

**Solution:**
Always add `title` prop:
```tsx
<IconButton
  type="button"
  title="Settings"
  onClick={handleClick}
>
  <Settings focusable={false} />
</IconButton>
```

---

### Issue: Icon is double-focused

**Problem:**
When tabbing to an IconButton, both the button and icon show focus rings.

**Solution:**
Add `focusable={false}` to Lucide icons:
```tsx
<IconButton type="button" title="Settings" onClick={handleClick}>
  <Settings focusable={false} /> {/* Add this */}
</IconButton>
```

---

### Issue: Button with `asChild` pattern doesn't work

**Problem:**
```tsx
<Button asChild>
  <a href="/admin">Go to admin</a>
</Button>
// Error: Property 'asChild' does not exist
```

**Solution:**
Use `href` prop directly:
```tsx
<Button href="/admin" variant="secondary">
  Go to admin
</Button>
```

---

### Issue: ActionBar.Label vs `label` prop

**Problem:**
Not sure when to use `ActionBar.Label` vs `label` prop.

**Solution:**
They're equivalent. Use whichever you prefer:

```tsx
// Option 1: label prop
<ActionBar label="Actions">
  <ActionBar.Action onClick={handleClick}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>

// Option 2: ActionBar.Label
<ActionBar>
  <ActionBar.Label label="Actions" />
  <ActionBar.Action onClick={handleClick}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>
```

---

### Issue: Button icon size

**Problem:**
Icon looks too big or too small in Button.

**Solution:**
Use standard Lucide icon sizes:
```tsx
<Button variant="primary" icon={<Plus className="h-4 w-4" />}>
  New page
</Button>
```

Recommended sizes:
- Small text: `h-3 w-3` or `h-4 w-4`
- Normal text: `h-4 w-4` or `h-5 w-5`
- Large text: `h-5 w-5` or `h-6 w-6`

---

## Best Practices

### 1. Always Use ActionBar for Multiple Actions

```tsx
// ✅ Good
<ActionBar label="Actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleSave}>
      <Button variant="primary">Save</Button>
    </ActionBar.Action>
  </ActionBar.Group>
  <ActionBar.Group>
    <ActionBar.Action onClick={handleCancel}>
      <Button variant="secondary">Cancel</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>

// ❌ Bad
<div className="flex gap-2">
  <Button variant="primary" onClick={handleSave}>Save</Button>
  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
</div>
```

### 2. Always Include `title` on IconButton

```tsx
// ✅ Good
<IconButton type="button" title="Settings" onClick={handleSettings}>
  <Settings focusable={false} />
</IconButton>

// ❌ Bad
<IconButton type="button" onClick={handleSettings}>
  <Settings focusable={false} />
</IconButton>
```

### 3. Always Add `focusable={false}` to Icons

```tsx
// ✅ Good
<IconButton type="button" title="Settings" onClick={handleSettings}>
  <Settings focusable={false} />
</IconButton>

// ❌ Bad
<IconButton type="button" title="Settings" onClick={handleSettings}>
  <Settings />
</IconButton>
```

### 4. Use Semantic Button Variants

```tsx
// ✅ Good
<Button variant="primary" onClick={handlePrimaryAction}>
  Save
</Button>
<Button variant="secondary" onClick={handleSecondaryAction}>
  Cancel
</Button>

// ❌ Bad
<Button variant="primary" onClick={handleCancel}>
  Cancel
</Button>
```

### 5. Group Related Actions

```tsx
// ✅ Good
<ActionBar label="Actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleCreate}>
      <Button variant="primary" icon={<Plus />}>New</Button>
    </ActionBar.Action>
  </ActionBar.Group>
  <ActionBar.Group>
    <ActionBar.Action onClick={handleEdit}>
      <Button variant="secondary" icon={<Edit />}>Edit</Button>
    </ActionBar.Action>
    <ActionBar.Action onClick={handleDelete}>
      <Button variant="secondary" icon={<Trash />}>Delete</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>

// ❌ Bad (no grouping)
<ActionBar label="Actions">
  <ActionBar.Action onClick={handleCreate}>
    <Button variant="primary" icon={<Plus />}>New</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={handleEdit}>
    <Button variant="secondary" icon={<Edit />}>Edit</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={handleDelete}>
    <Button variant="secondary" icon={<Trash />}>Delete</Button>
  </ActionBar.Action>
</ActionBar>
```

---

## Summary

### What to Use Where

| Location | Components to Use |
|----------|-------------------|
| **Admin dashboard** (`app/admin/*`) | Puck components (Button, ActionBar, IconButton) |
| **Public pages** (`app/[locale]/*`) | Shadcn UI components |
| **Editor page** (`app/admin/pages/*/edit/*`) | Full Puck component |

### Quick Reference

```tsx
// Import
import { Button, ActionBar, IconButton } from "@measured/puck";

// Button
<Button variant="primary" icon={<Plus />}>New page</Button>

// ActionBar
<ActionBar label="Actions">
  <ActionBar.Group>
    <ActionBar.Action onClick={handleClick}>
      <Button variant="primary">Save</Button>
    </ActionBar.Action>
  </ActionBar.Group>
</ActionBar>

// IconButton
<IconButton type="button" title="Settings" onClick={handleClick}>
  <Settings focusable={false} />
</IconButton>
```

### Common Mistakes to Avoid

1. ❌ Using `className` on Button (use wrapper div)
2. ❌ Forgetting `title` on IconButton (required for accessibility)
3. ❌ Forgetting `focusable={false}` on icons (prevents double focus)
4. ❌ Using `asChild` pattern (use `href` prop instead)
5. ❌ Using Shadcn UI in admin area (use Puck components)

---

## Further Reading

- [Puck Internal Architecture](./PUCK_INTERNAL_ARCHITECTURE.md)
- [Visual Comparison](./PUCK_VISUAL_COMPARISON.md)
- [UI Guidelines](./UI_GUIDELINES.md)
- [Puck Documentation](https://puckeditor.com/docs)
