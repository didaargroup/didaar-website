# Puck Components Guide

This document provides comprehensive guidance on using `@measured/puck` components in the Pucked admin interface.

## Overview

The Pucked admin area uses `@measured/puck` version 0.20.2 as its primary component library. This ensures consistency with the page editor and provides a cohesive design system throughout the admin interface.

## Available Components

The following components are exported by `@measured/puck`:

- **ActionBar** - Action bar with label and action buttons
- **Button** - Primary and secondary button variants
- **Drawer** - Collapsible drawer for navigation
- **DropZone** - Drop zone for drag-and-drop content
- **FieldLabel** - Labels for form fields
- **IconButton** - Icon-only buttons with tooltips
- **Label** - Text label component
- **AutoField** - Auto-rendering field component

## Component APIs

### ActionBar

Action bar for grouping related actions with a label.

```tsx
import { ActionBar } from "@measured/puck"

<ActionBar label="Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button variant="primary">Click me</Button>
  </ActionBar.Action>
</ActionBar>
```

**Props:**
- `label` (string) - The label text for the action bar

**Sub-components:**
- `ActionBar.Action` - Wrapper for action buttons
  - `onClick` (function, required) - Click handler

**Important Notes:**
- Does NOT use `ActionBar.Label` - use the `label` prop instead
- `ActionBar.Action` requires an `onClick` function
- Does NOT support `asChild` pattern like Radix UI

### Button

Standard button component with multiple variants.

```tsx
import { Button } from "@measured/puck"

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save
</Button>

// Secondary button
<Button variant="secondary" onClick={handleClick}>
  Cancel
</Button>

// Button with icon
<Button variant="primary" icon={<Plus />}>
  New Item
</Button>

// Link button
<Button href="/admin/pages" variant="secondary">
  View Pages
</Button>

// Full width button
<Button variant="primary" fullWidth>
  Submit
</Button>

// Loading state
<Button variant="primary" loading={isLoading}>
  Processing...
</Button>
```

**Props:**
- `variant` ("primary" | "secondary") - Button style variant
- `type` ("button" | "submit" | "reset") - Button type (default: "button")
- `onClick` (function) - Click handler
- `href` (string) - If provided, renders as a link
- `icon` (ReactNode) - Icon to display before text
- `size` ("small" | "medium" | "large") - Button size
- `disabled` (boolean) - Disable the button
- `loading` (boolean) - Show loading state
- `fullWidth` (boolean) - Make button full width
- `newTab` (boolean) - Open link in new tab (with href)

**Important Notes:**
- Does NOT accept `className` prop - use wrapper `div` for styling
- Does NOT support `asChild` pattern (unlike shadcn/ui)
- Use `fullWidth` prop instead of `className="w-full"`
- For links, use `href` prop directly, not `asChild` with Link component

### Drawer

Collapsible drawer component for navigation menus.

```tsx
import { Drawer } from "@measured/puck"

<Drawer direction="vertical">
  <Drawer.Item
    name="dashboard"
    label="Dashboard"
    id="dashboard"
  />
  <Drawer.Item
    name="pages"
    label="Pages"
    id="pages"
  />
</Drawer>
```

**Props:**
- `direction` ("horizontal" | "vertical") - Drawer orientation

**Sub-components:**
- `Drawer.Item` - Individual drawer item
  - `name` (string) - Item identifier
  - `label` (string) - Display text (must be string, not JSX)
  - `id` (string) - Unique ID

**Important Notes:**
- `Drawer.Item` `label` prop expects a string, NOT JSX
- For custom navigation links, use plain HTML with Tailwind classes instead of `Drawer.Item`
- The Drawer component is best used for simple menu items

### IconButton

Icon-only button with built-in tooltip.

```tsx
import { IconButton } from "@measured/puck"

<IconButton
  type="button"
  title="Toggle sidebar"
  onClick={toggleSidebar}
>
  <Menu focusable="false" />
</IconButton>
```

**Props:**
- `title` (string, required) - Tooltip text
- `type` ("button" | "submit" | "reset") - Button type
- `onClick` (function) - Click handler
- `disabled` (boolean) - Disable the button

**Important Notes:**
- Always provide a `title` prop for accessibility
- Always set `type="button"` for non-form buttons
- Icons should have `focusable="false"` to prevent keyboard focus issues

### DropZone

Drop zone for drag-and-drop content in Puck editor.

```tsx
import { DropZone } from "@measured/puck"

<DropZone zone="content" />
```

**Props:**
- `zone` (string) - Zone identifier

### FieldLabel

Label component for form fields.

```tsx
import { FieldLabel } from "@measured/puck"

<FieldLabel label="Title" icon={<Heading />} />
```

**Props:**
- `label` (string) - Label text
- `icon` (ReactNode) - Optional icon

### Label

Text label component.

```tsx
import { Label } from "@measured/puck"

<Label>Some text</Label>
```

### AutoField

Auto-rendering field component for Puck forms.

```tsx
import { AutoField } from "@measured/puck"

<AutoField field={fieldSchema} />
```

## Common Patterns

### Header with Actions

```tsx
import { ActionBar, Button, IconButton } from "@measured/puck"
import { PanelLeft, Home, LogOut } from "lucide-react"

<header className="flex items-center justify-between h-16 px-4 border-b">
  <div className="flex items-center gap-4">
    <IconButton
      type="button"
      title="Toggle sidebar"
      onClick={toggleSidebar}
    >
      <PanelLeft focusable="false" />
    </IconButton>
    <h1 className="text-xl font-semibold">Dashboard</h1>
  </div>

  <ActionBar label="Actions">
    <ActionBar.Action onClick={() => {}}>
      <Button variant="secondary" icon={<Home />} href="/" newTab />
    </ActionBar.Action>
    <ActionBar.Action onClick={handleLogout}>
      <Button variant="secondary" icon={<LogOut />} type="submit" />
    </ActionBar.Action>
  </ActionBar>
</header>
```

### Navigation Menu

```tsx
import { Drawer } from "@measured/puck"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

<nav className="flex-1 px-3 py-4 overflow-y-auto">
  <Drawer direction="vertical">
    {navigation.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;

      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {item.name}
        </Link>
      );
    })}
  </Drawer>
</nav>
```

### Form with Full Width Button

```tsx
import { Button } from "@measured/puck"

<form action={formAction}>
  {/* Form fields */}

  <div className="w-full">
    <Button type="submit" variant="primary" fullWidth>
      Submit
    </Button>
  </div>
</form>
```

### Action Buttons with Links

```tsx
import { ActionBar, Button } from "@measured/puck"

<ActionBar label="Page Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button
      href="/admin/pages/create"
      variant="primary"
      icon={<Plus />}
    >
      New Page
    </Button>
  </ActionBar.Action>
</ActionBar>
```

## Common Pitfalls

### 1. Using `asChild` Pattern

❌ **Wrong:**
```tsx
<Button asChild variant="primary">
  <Link href="/admin/pages">View Pages</Link>
</Button>
```

✅ **Correct:**
```tsx
<Button href="/admin/pages" variant="primary">
  View Pages
</Button>
```

### 2. Adding `className` to Button

❌ **Wrong:**
```tsx
<Button className="w-full" variant="primary">
  Submit
</Button>
```

✅ **Correct:**
```tsx
<div className="w-full">
  <Button variant="primary" fullWidth>
    Submit
  </Button>
</div>
```

### 3. Using `ActionBar.Label`

❌ **Wrong:**
```tsx
<ActionBar>
  <ActionBar.Label>Actions</ActionBar.Label>
  <ActionBar.Action onClick={handleClick}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>
```

✅ **Correct:**
```tsx
<ActionBar label="Actions">
  <ActionBar.Action onClick={handleClick}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>
```

### 4. Passing JSX to `Drawer.Item` label

❌ **Wrong:**
```tsx
<Drawer.Item
  name="dashboard"
  label={<Link href="/admin">Dashboard</Link>}
/>
```

✅ **Correct:**
```tsx
<Link href="/admin" className="flex items-center gap-2">
  <LayoutDashboard />
  Dashboard
</Link>
```

### 5. Missing `title` on IconButton

❌ **Wrong:**
```tsx
<IconButton onClick={toggleSidebar}>
  <Menu />
</IconButton>
```

✅ **Correct:**
```tsx
<IconButton
  type="button"
  title="Toggle sidebar"
  onClick={toggleSidebar}
>
  <Menu focusable="false" />
</IconButton>
```

### 6. Using `isPublishing` with Puck component

❌ **Wrong:**
```tsx
<Puck
  config={config}
  data={data}
  onPublish={handlePublish}
  isPublishing={isPending}
/>
```

✅ **Correct:**
```tsx
<Puck
  config={config}
  data={data}
  onPublish={handlePublish}
/>
```

## Design System Integration

### Color Tokens

Puck uses semantic color tokens that align with Tailwind CSS:
- `bg-primary` - Primary background color
- `text-primary-foreground` - Text on primary background
- `bg-accent` - Accent background color
- `text-accent-foreground` - Text on accent background
- `text-muted-foreground` - Muted text color
- `bg-destructive` - Error/danger color
- `text-destructive` - Error text color

### Spacing

Use Tailwind's spacing scale (4px base unit):
- `gap-2`, `gap-4` - For flex layouts
- `space-y-2`, `space-y-4` - For vertical layouts
- `p-4`, `p-6` - For padding
- `px-3`, `py-2` - For specific axis padding

### Typography

- Sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Weights: `font-medium`, `font-semibold`, `font-bold`

## When NOT to Use Puck Components

In the **guest/public area** (`/app/[locale]/`), use **Shadcn UI** components instead:
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- etc.

Puck components are ONLY for the admin area (`/app/admin/`).

## Resources

- [Puck GitHub Repository](https://github.com/puckeditor/puck)
- [Puck Component Source](https://github.com/puckeditor/puck/tree/main/packages/core/components)
- [Puck Documentation](https://puckeditor.com/docs)

## Version Information

- **Package**: `@measured/puck`
- **Version**: 0.20.2
- **Last Updated**: 2025-02-14
