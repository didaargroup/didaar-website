# UI Guidelines - Pucked Project

This document establishes the UI patterns, styling conventions, and design system standards for maintaining visual integrity and consistency across the Pucked application.

## Design System Overview

### Critical: Dual Component Library Architecture

**This project uses TWO different component libraries:**

| Area | Component Library | Location |
|------|-------------------|----------|
| **Admin Dashboard** | `@measured/puck` v0.20.2 | `/admin/*` routes |
| **Public/Guest Area** | Shadcn UI | `/app/[locale]/*` routes |

**Why?** The admin area uses Puck's components to maintain visual consistency with the page editor. The public area uses Shadcn UI for a traditional, accessible component library.

**⚠️ Important:** Never mix these libraries. Use Puck components in admin routes and Shadcn components in public routes.

### Admin Area - @measured/puck Components

**Location**: All files in `app/admin/` directory

**Import Pattern:**
```tsx
import { Button, ActionBar, IconButton } from "@measured/puck";
```

**Available Components:**
- **Button** - Primary and secondary buttons with icon support
- **ActionBar** - Action bar with label and action buttons
- **IconButton** - Icon-only buttons with tooltips
- **Drawer** - Collapsible drawer for navigation
- **DropZone** - Drop zone for drag-and-drop
- **FieldLabel** - Labels for form fields
- **Label** - Text label component
- **AutoField** - Auto-rendering field component

**📖 Complete Reference:** See [puck-compatible-ui/components-guide.md](./puck-compatible-ui/components-guide.md)

**Styling Approach:**
- Uses CSS variables defined in Puck's CSS
- Inline styles with CSS custom properties
- No Tailwind classes on Puck components
- Example: `style={{ background: "var(--puck-color-grey-12)" }}`

### Public Area - Shadcn UI Components

**Location**: All files in `app/[locale]/` directory

**Import Pattern:**
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
```

**Available Components:**
- **Button** - Various button variants
- **Card** - Card containers with header and content
- **Input** - Text input fields
- **Label** - Form labels
- **Checkbox** - Checkbox inputs
- **Badge** - Status badges
- **Collapsible** - Collapsible content sections

**Styling Approach:**
- Tailwind CSS utility classes
- Example: `className="bg-primary text-primary-foreground hover:bg-primary/90"`

---

## Core Styling Principles

### 1. Never Use Inline Styles (Except with Puck)

**❌ Wrong:**
```tsx
<div style={{ padding: "16px", background: "#f5f5f5" }}>
```

**✅ Right (Tailwind):**
```tsx
<div className="p-4 bg-gray-100">
```

**✅ Right (Puck CSS variables):**
```tsx
<div style={{ padding: "var(--puck-space-px)", background: "var(--puck-color-grey-11)" }}>
```

### 2. Use Semantic Color Tokens

**Puck Colors (Admin):**
```css
--puck-color-white: #ffffff
--puck-color-black: #000000
--puck-color-grey-05: #767676
--puck-color-grey-09: #dcdcdc
--puck-color-grey-10: #efefef
--puck-color-grey-11: #f5f5f5
--puck-color-grey-12: #fafafa
--puck-color-azure-04: #0158ad
```

**Tailwind Colors (Public):**
```tsx
bg-primary, text-primary-foreground
bg-secondary, text-secondary-foreground
bg-muted, text-muted-foreground
bg-destructive, text-destructive
```

### 3. Always Include Dark Mode Support

**Puck Components:** Dark mode is handled automatically via CSS variables.

**Tailwind Classes:** Always add `dark:` variants:
```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### 4. Use the `cn()` Helper for Conditional Classes

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  "dark:dark-mode-class"
)}>
```

---

## Common UI Patterns

### Spacing System

**Puck (Admin):**
```css
--puck-space-px: 16px
padding: var(--puck-space-px)
gap: calc(var(--puck-space-px) * 0.75)  /* 12px */
```

**Tailwind (Public):**
```tsx
p-4    /* 16px */
p-6    /* 24px */
gap-2  /* 8px */
gap-4  /* 16px */
```

### Typography

**Puck (Admin):**
```css
--puck-font-size-xxs: 14px
--puck-font-size-xs: 16px
--puck-font-size-s: 18px
--puck-font-size-m: 21px
```

**Tailwind (Public):**
```tsx
text-sm   /* 14px */
text-base /* 16px */
text-lg   /* 18px */
text-xl   /* 20px */
```

### Error Styling

**Field Error:**
```tsx
<Input className={hasError ? "border-destructive" : ""} />
{hasError && <p className="text-xs text-destructive">{error}</p>}
```

**Form-Level Error:**
```tsx
<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
  <p className="text-sm text-destructive">{error}</p>
</div>
```

---

## Layout Patterns

### Centered Form Layout

```tsx
<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
  <div className="w-full max-w-lg">
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form content */}
      </CardContent>
    </Card>
  </div>
</div>
```

### Admin Dashboard Layout

The admin dashboard uses a custom layout with:
- **Header**: Puck-style header with toggle button
- **Sidebar**: Collapsible navigation drawer
- **Main Content**: Scrollable content area

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  Header (toggle, title, actions)       │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Content                │
│ (nav)    │  (flex-1, overflow-auto)     │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Implementation:** See `app/admin/(dashboard)/layout.tsx`

---

## Form Patterns

### Server Action Forms (React 19)

**⚠️ Critical:** Always use `useActionState` from `"react"`, NOT `useFormState` from `"react-dom"`.

```tsx
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@measured/puck"  // Admin
// import { Button } from "@/components/ui/button"  // Public

type FormState = {
  errors?: {
    fieldName?: string[]
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

export function MyForm() {
  const [state, formAction] = useActionState(someAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {/* Field with error */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          className={state.errors?.title ? "border-destructive" : ""}
        />
        {state.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Form-level error */}
      {state.errors?._form && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

**📖 Complete Guide:** See [server-actions/nextjs-server-actions.md](./server-actions/nextjs-server-actions.md)

---

## Common Pitfalls

### ❌ Don't Mix Component Libraries

```tsx
// WRONG - Using Shadcn in admin
import { Button } from "@/components/ui/button";

// RIGHT - Using Puck in admin
import { Button } from "@measured/puck";
```

### ❌ Don't Use Inline Styles (Except Puck Variables)

```tsx
// WRONG
<div style={{ padding: "16px", color: "red" }}>

// RIGHT (Tailwind)
<div className="p-4 text-red-500">

// RIGHT (Puck CSS variables)
<div style={{ padding: "var(--puck-space-px)", color: "var(--puck-color-red-05)" }}>
```

### ❌ Don't Forget Dark Mode

```tsx
// WRONG
<div className="bg-white text-gray-900">

// RIGHT
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### ❌ Don't Call formAction Directly

```tsx
// WRONG
<Button onClick={() => formAction(new FormData())}>

// RIGHT
<form action={formAction}>
  <Button type="submit">Submit</Button>
</form>
```

---

## Component-Specific Guidelines

### Puck Button (Admin)

```tsx
import { Button } from "@measured/puck";

// Basic
<Button variant="primary">Click me</Button>
<Button variant="secondary">Cancel</Button>

// With icon
<Button variant="primary" icon={<Plus />}>
  New page
</Button>

// As link
<Button href="/admin/pages" variant="secondary">
  View pages
</Button>

// ⚠️ Button does NOT accept className prop
// Use wrapper div for custom styling
<div className="my-custom-class">
  <Button variant="primary">Click me</Button>
</div>
```

### Shadcn Button (Public)

```tsx
import { Button } from "@/components/ui/button";

// Basic
<Button>Click me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  New item
</Button>

// As link
<Button asChild>
  <Link href="/page">Go to page</Link>
</Button>
```

---

## Accessibility

- Always provide `title` prop for `IconButton` components
- Use semantic HTML (`<button>`, `<a>`, `<form>`)
- Include proper ARIA labels for custom components
- Ensure keyboard navigation works
- Test with screen readers

---

## Resources

- **[Puck Components Guide](./puck-compatible-ui/components-guide.md)** - Complete Puck component API
- **[Server Actions Guide](./server-actions/nextjs-server-actions.md)** - Form handling patterns
- **[Authentication Guide](./authentication/invitation-system.md)** - Auth flow documentation

---

**Last Updated**: December 26, 2025


**Dark Mode (`.dark` class):**
All colors automatically invert via CSS custom properties. Use `dark:` prefix for Tailwind utilities.

### Border Radius System

```css
--radius: 0.625rem (10px) /* Base radius */
--radius-sm: calc(var(--radius) - 4px)  /* 6px */
--radius-md: calc(var(--radius) - 2px)  /* 8px */
--radius-lg: var(--radius)              /* 10px */
--radius-xl: calc(var(--radius) + 4px)  /* 14px */
--radius-2xl: calc(var(--radius) + 8px) /* 18px */
--radius-3xl: calc(var(--radius) + 12px) /* 22px */
```

**Standard Usage:**
- Cards/Containers: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-md` or `rounded-xl`
- Inputs: `rounded-md` or `rounded-lg`
- Small elements: `rounded-sm` or `rounded`

### Spacing Scale

Use Tailwind's default spacing scale (4px base unit):
- `gap-4` = 16px (standard gap between elements)
- `p-6` = 24px (standard card padding)
- `p-8` = 32px (large card padding)
- `px-4 py-2` = standard button padding

## Component Patterns

### 1. Buttons

**Always use the `Button` component from `@/components/ui/button`:**

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Submit</Button>

// Secondary/cancel
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost/transparent
<Button variant="ghost">Close</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

**❌ NEVER use inline styles for buttons:**
```tsx
// BAD
<button style={{ padding: "0.75rem", backgroundColor: "#000" }}>
  Click me
</button>
```

### 2. Cards & Containers

**Standard card pattern:**
```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
  {/* Content */}
</div>
```

**Elevated card (for emphasis):**
```tsx
<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
  {/* Content */}
</div>
```

**Section containers:**
```tsx
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {/* Content */}
</section>
```

### 3. Forms

**Input fields pattern:**
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
    placeholder="you@example.com"
  />
  <p className="text-xs text-muted-foreground">
    We'll never share your email with anyone else.
  </p>
</div>
```

**Form layout:**
```tsx
<form className="space-y-4">
  {/* Form fields with consistent vertical spacing */}
</form>
```

**Complete form example (Server Actions + useFormState):**
```tsx
"use client"

import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFormState } from "react-dom"

type FormState = {
  errors?: {
    title?: string[]
    email?: string[]
    _form?: string[]
  }
}

const initialState = {
  errors: {},
}

export function MyForm() {
  const [state, formAction] = useFormState(someAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
        <CardDescription>Brief description of the form</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter title"
              required
              className={state.errors && 'title' in state.errors ? "border-destructive" : ""}
            />
            {state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox id="agree" name="agree" />
            <Label htmlFor="agree" className="cursor-pointer">
              I agree to the terms
            </Label>
          </div>

          {/* Form-level error */}
          {state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**❌ NEVER use inline styles for forms:**
```tsx
// BAD
<input style={{ 
  width: "100%", 
  padding: "0.75rem", 
  border: "1px solid #ccc" 
}} />
```

**Checkboxes:**
```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center gap-2">
  <Checkbox
    id="terms"
    name="terms"
    defaultChecked={false}
  />
  <Label htmlFor="terms" className="cursor-pointer">
    I agree to the terms and conditions
  </Label>
</div>
```

**❌ NEVER use native checkboxes:**
```tsx
// BAD
<input
  type="checkbox"
  className="h-4 w-4 rounded border-gray-300"
/>
```

### 4. Typography

**Headings:**
```tsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-medium">Subsection Title</h3>
```

**Body text:**
```tsx
<p className="text-base">Regular paragraph text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>
<p className="text-xs text-muted-foreground">Caption text</p>
```

**Text alignment:**
```tsx
<div className="text-center">Centered content</div>
<div className="text-left">Left aligned (default)</div>
<div className="text-right">Right aligned</div>
```

### 5. Loading States

**Button loading:**
```tsx
<Button disabled={isPending}>
  {isPending ? "Loading..." : "Submit"}
</Button>
```

**Page loading skeleton:**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
</div>
```

### 6. Error Messages

**Inline error (form-level):**
```tsx
{error && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive">{error}</p>
  </div>
)}
```

**Form field error:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className={errors.email ? "border-destructive focus:ring-destructive" : ""}
  />
  {errors.email && (
    <p className="text-xs text-destructive">{errors.email}</p>
  )}
</div>
```

**Server action form errors (with useFormState):**
```tsx
type FormState = {
  errors?: {
    fieldName?: string[]
    _form?: string[]
  }
}

// In component:
const [state, formAction] = useFormState(serverAction, initialState)

// Field-level error:
<Input
  className={state.errors && 'fieldName' in state.errors ? "border-destructive" : ""}
/>
{state.errors && 'fieldName' in state.errors && Array.isArray(state.errors.fieldName) && state.errors.fieldName.length > 0 && (
  <p className="text-xs text-destructive">{state.errors.fieldName[0]}</p>
)}

// Form-level error:
{state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive">{state.errors._form[0]}</p>
  </div>
)}
```

**❌ NEVER use inline styles for error messages:**
```tsx
// BAD
<p style={{ color: "red", fontSize: "12px" }}>{error}</p>
```

### 7. Icons

**Icon sizing standards:**
```tsx
<svg className="w-4 h-4"> {/* 16px - inline with text */}
<svg className="w-5 h-5"> {/* 20px - buttons, small UI */}
<svg className="w-6 h-6"> {/* 24px - standard size */}
<svg className="w-8 h-8"> {/* 32px - large icons */}
```

**Icon with text:**
```tsx
<div className="flex items-center gap-2">
  <svg className="w-5 h-5" />
  <span>Label</span>
</div>
```

## Layout Patterns

### 1. Centered Content (Auth Pages, Forms)

```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    {/* Card content */}
  </div>
</div>
```

### 2. Dashboard Layout

```tsx
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className="w-64 border-r">
    {/* Navigation */}
  </aside>
  
  {/* Main content */}
  <main className="flex-1 overflow-auto">
    <div className="p-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

### 3. Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### 4. Flexbox Patterns

**Horizontal alignment:**
```tsx
<div className="flex items-center justify-between">
  <h2>Title</h2>
  <Button>Action</Button>
</div>
```

**Vertical stacking:**
```tsx
<div className="flex flex-col gap-4">
  {/* Stacked items */}
</div>
```

## Responsive Design

### Breakpoints

```tsx
// Mobile first approach
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

**Standard breakpoints:**
- `sm:` 640px (small tablets)
- `md:` 768px (tablets)
- `lg:` 1024px (laptops)
- `xl:` 1280px (desktops)
- `2xl:` 1536px (large screens)

### Responsive Patterns

**Hide/show elements:**
```tsx
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

**Responsive spacing:**
```tsx
<div className="px-4 sm:px-6 lg:px-8">
```

**Responsive typography:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
```

## Dark Mode

### Implementation

**Always use dark mode variants:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

**Common dark mode patterns:**
```tsx
// Backgrounds
bg-white dark:bg-gray-900
bg-gray-50 dark:bg-gray-800

// Text
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400

// Borders
border-gray-200 dark:border-gray-800
border-gray-300 dark:border-gray-700
```

## Accessibility

### Focus States

**Always include focus indicators:**
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary/50">
```

### ARIA Labels

```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

### Semantic HTML

```tsx
// Use proper heading hierarchy
<h1>Main title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>

// Use semantic elements
<nav>, <main>, <section>, <article>, <aside>, <header>, <footer>
```

## Animation & Transitions

### Standard Transitions

```tsx
// Smooth color/size changes
className="transition-all duration-200"

// Hover effects
className="hover:bg-accent hover:text-accent-foreground transition-colors"

// Transform animations
className="transform hover:-translate-y-0.5 transition-transform"
```

### Loading Spinners

```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
```

## Utility Functions

### `cn()` Helper

**Always use `cn()` for conditional classes:**
```tsx
import { cn } from "@/lib/utils";

const button = cn(
  "base classes",
  isActive && "active classes",
  "additional classes"
);
```

**Why use `cn()`:**
- Merges Tailwind classes intelligently
- Removes conflicting classes
- Handles conditional logic cleanly

## Common Anti-Patterns to Avoid

### ❌ Inline Styles

```tsx
// BAD
<div style={{ padding: "2rem", backgroundColor: "#fff" }} />

// GOOD
<div className="p-8 bg-white" />
```

### ❌ Magic Numbers

```tsx
// BAD
<div style={{ marginTop: "27px" }} />

// GOOD
<div className="mt-6" /> // Uses spacing scale
```

### ❌ Inconsistent Naming

```tsx
// BAD
className="bg-gray-200 bg-gray-300"

// GOOD
className="bg-gray-200 dark:bg-gray-700"
```

### ❌ Hardcoded Colors

```tsx
// BAD
className="bg-[#FF0000]"

// GOOD
className="bg-destructive"
```

## Component Library (Shadcn UI)

### Available Components

Check `components/ui/` for available components:
- `button.tsx` - Button component with variants
- More components can be added via `npx shadcn@latest add [component]`

### Adding New Components

```bash
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
```

## Page-Specific Patterns

### Auth Pages (Login, Signup)

**Pattern:**
- Centered card layout
- Max-width: 400-480px
- Icon/brand header
- Single primary action
- Minimal footer text

**Example:**
```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      {/* Content */}
    </div>
  </div>
</div>
```

### Dashboard Pages

**Pattern:**
- Full-width layout
- Page header with title + actions
- Card-based content sections
- Consistent spacing (gap-6)

**Example:**
```tsx
<div className="p-6 space-y-6">
  <header className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <Button>Create New</Button>
  </header>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</div>
```

### Editor Pages (Puck)

**Pattern:**
- Full-screen layout
- Toolbar on top
- Canvas takes remaining space
- Sidebar for component properties

## Internationalization (i18n) UI Considerations

### RTL Support (Farsi)

**When adding Farsi support:**
```tsx
<div dir="rtl" className="text-right">
  {/* Farsi content */}
</div>
```

**Text alignment:**
- English: `text-left` (default)
- Farsi: `text-right`

**Icon positioning:**
```tsx
// English
<div className="flex items-center gap-2">
  <Icon /> <span>Text</span>
</div>

// Farsi (RTL)
<div className="flex items-center gap-2 flex-row-reverse">
  <Icon /> <span>متن</span>
</div>
```

## Quick Reference

### Common Class Combinations

**Card:**
```tsx
"bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
```

**Button container:**
```tsx
"flex items-center gap-2"
```

**Section:**
```tsx
"space-y-4" or "gap-4" (for flex/grid)
```

**Input:**
```tsx
"w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
```

**Text + icon:**
```tsx
"flex items-center gap-2"
```

## Best Practices Summary

1. **Always use Tailwind utility classes** - No inline styles
2. **Use semantic color tokens** - `bg-primary`, not `bg-blue-500`
3. **Maintain dark mode support** - Always add `dark:` variants
4. **Follow spacing scale** - Use Tailwind's spacing units
5. **Use the `cn()` helper** - For conditional classes
6. **Use Shadcn components** - Don't reinvent the wheel
7. **Test responsive behavior** - Mobile-first approach
8. **Ensure accessibility** - Focus states, ARIA labels, semantic HTML
9. **Keep consistency** - Use the same patterns across pages
10. **Document new patterns** - Add to this guide when creating new UI patterns

## File Organization

```
components/
├── ui/                    # Shadcn UI components (don't modify manually)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── auth-guard.tsx         # Custom components
└── [feature]/             # Feature-specific components
    └── [component].tsx
```

## When to Break Rules

These guidelines are standards, not laws. You may deviate when:

1. **Integrating third-party libraries** (e.g., Puck editor) that have their own styling
2. **Creating highly custom visual elements** that can't be achieved with utilities
3. **Performance optimization** requires specific approaches
4. **Legacy code** migration (plan to refactor later)

**When breaking rules:**
- Document why in a comment
- Consider the long-term maintenance impact
- Prefer creating a reusable component over one-off styles
