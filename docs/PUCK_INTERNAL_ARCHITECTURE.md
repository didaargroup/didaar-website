# Puck Internal Architecture - Deep Dive Analysis

## Executive Summary

After reverse-engineering the Puck editor's core package (v0.20.2), I've identified **two viable approaches** for styling consistency:

1. **✅ RECOMMENDED: Use Puck Components in Your Dashboard** (Simpler, 1-2 hours)
2. **❌ NOT RECOMMENDED: Theme Puck to Match Your Design** (Complex, 8-16 hours, limited API)

**The simpler approach is clear: Use Puck's components (Button, ActionBar, IconButton) throughout your dashboard.**

---

## Table of Contents

1. [How Puck Works Internally](#how-puck-works-internally)
2. [Puck's Styling Architecture](#pucks-styling-architecture)
3. [Your Current Dashboard Styling](#your-current-dashboard-styling)
4. [Approach Comparison](#approach-comparison)
5. [Recommended Implementation](#recommended-implementation)
6. [Why Not Theme Puck?](#why-not-theme-puck)

---

## How Puck Works Internally

### Core Architecture

Puck is built with a **plugin-based architecture** using React and Zustand for state management:

```
packages/core/
├── components/
│   ├── Puck/
│   │   ├── components/
│   │   │   ├── Layout/       # CSS Grid layout system
│   │   │   ├── Header/       # Top header with actions
│   │   │   ├── Canvas/       # Main editing area
│   │   │   ├── Fields/       # Right sidebar fields
│   │   │   └── Preview/      # Content preview
│   │   └── index.tsx         # Main Puck component
│   ├── ActionBar/            # Action bar component
│   ├── Button/               # Button component
│   ├── IconButton/           # Icon button component
│   ├── Drawer/               # Component drawer
│   └── AutoField/            # Field rendering
├── plugins/
│   ├── blocks/               # Component browser
│   ├── fields/               # Field editor
│   ├── legacySideBar/        # Old sidebar
│   └── outline/              # Component tree
├── store/                    # Zustand state management
├── styles/                   # CSS variables and modules
└── lib/                      # Utilities
```

### Component Hierarchy

```
<Puck>
  <PropsProvider>
    <PuckProvider>
      <Layout>
        {children || (
          <>
            <Header />
            <Nav />
            <Canvas />
            <Sidebar />
            <Fields />
          </>
        )}
      </Layout>
    </PuckProvider>
  </PropsProvider>
</Puck>
```

### Key Design Patterns

1. **CSS Grid Layout**: Puck uses named grid areas for responsive layout
2. **CSS Modules**: All components use `.module.css` files with SUIT CSS naming
3. **CSS Variables**: Extensive use of `--puck-*` custom properties
4. **Plugin System**: Composable plugins for different UI areas
5. **Overrides API**: Render props for customizing any part of the UI

---

## Puck's Styling Architecture

### CSS Variable System

Puck defines **comprehensive CSS variables** for theming:

```css
/* packages/core/styles/color.css */
:root {
  /* Azure (primary) - 12 step scale */
  --puck-color-azure-01: #00175d;
  --puck-color-azure-02: #002c77;
  --puck-color-azure-03: #004a9e;
  --puck-color-azure-04: #0066c9;  /* Primary brand color */
  --puck-color-azure-05: #1a7be0;
  --puck-color-azure-06: #4d94e0;
  --puck-color-azure-07: #7dadf0;
  --puck-color-azure-08: #a5c7f6;
  --puck-color-azure-09: #c9dff9;
  --puck-color-azure-10: #e3effc;
  --puck-color-azure-11: #f0f7fe;
  --puck-color-azure-12: #f9fcff;

  /* Grey (neutral) - 12 step scale */
  --puck-color-grey-01: #181818;
  --puck-color-grey-02: #292929;
  --puck-color-grey-03: #404040;
  --puck-color-grey-04: #5a5a5a;
  --puck-color-grey-05: #767676;
  --puck-color-grey-06: #949494;
  --puck-color-grey-07: #ababab;
  --puck-color-grey-08: #c3c3c3;
  --puck-color-grey-09: #dcdcdc;
  --puck-color-grey-10: #efefef;
  --puck-color-grey-11: #f5f5f5;
  --puck-color-grey-12: #fafafa;

  /* Semantic colors */
  --puck-color-black: #000000;
  --puck-color-white: #ffffff;
}
```

### Typography System

```css
/* packages/core/styles/typography.css */
:root {
  /* Font families */
  --puck-font-family: Inter, var(--fallback-font-stack);
  --puck-font-family-monospaced: ui-monospace, "Cascadia Code", monospace;

  /* Font sizes (12-step modular scale) */
  --puck-font-size-xxxs: 0.625rem;   /* 10px */
  --puck-font-size-xxs: 0.75rem;     /* 12px */
  --puck-font-size-xs: 0.875rem;     /* 14px */
  --puck-font-size-s: 1rem;          /* 16px */
  --puck-font-size-m: 1.125rem;      /* 18px */
  --puck-font-size-l: 1.25rem;       /* 20px */
  --puck-font-size-xl: 1.5rem;       /* 24px */
  --puck-font-size-xxl: 1.75rem;     /* 28px */
  --puck-font-size-xxxl: 2rem;       /* 32px */

  /* Spacing system (4px base unit) */
  --puck-space-px: 16px;
}
```

### Component Styling Patterns

#### Button Component

```css
/* packages/core/components/Button/Button.module.css */
.Button {
  appearance: none;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--puck-color-white);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--puck-font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  transition: background-color 50ms ease-in;
}

.Button--primary {
  background: var(--puck-color-azure-04);
}

.Button--primary:hover {
  background-color: var(--puck-color-azure-03);
}

.Button--secondary {
  border: 1px solid currentColor;
  color: currentColor;
}

.Button--secondary:hover {
  background-color: var(--puck-color-azure-12);
  color: var(--puck-color-black);
}
```

#### ActionBar Component

```css
/* packages/core/components/ActionBar/styles.module.css */
.ActionBar {
  align-items: center;
  display: flex;
  width: auto;
  padding: 4px;
  border-radius: 8px;
  background: var(--puck-color-grey-01);
  color: var(--puck-color-white);
  font-family: var(--puck-font-family);
  min-height: 26px;
}

.ActionBar-label {
  color: var(--puck-color-grey-08);
  font-size: var(--puck-font-size-xxxs);
  font-weight: 500;
  padding: 0 8px;
  margin: 0 4px;
}

.ActionBar-group {
  align-items: center;
  border-left: 0.5px solid var(--puck-color-grey-05);
  display: flex;
  height: 100%;
  padding: 0 4px;
}

.ActionBarAction {
  background: transparent;
  border: none;
  color: var(--puck-color-grey-08);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: color 50ms ease-in;
}

.ActionBarAction:hover {
  color: var(--puck-color-azure-06);
}
```

#### IconButton Component

```css
/* packages/core/components/IconButton/IconButton.module.css */
.IconButton {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: currentColor;
  display: flex;
  font-family: var(--puck-font-family);
  justify-content: center;
  padding: 4px;
  transition: background-color 50ms ease-in, color 50ms ease-in;
}

.IconButton:hover:not(.IconButton--disabled) {
  background: var(--puck-color-grey-10);
  color: var(--puck-color-azure-04);
  cursor: pointer;
}

.IconButton--active {
  color: var(--puck-color-azure-04);
}
```

### Layout System

```css
/* packages/core/components/Puck/components/Layout/styles.module.css */
.PuckLayout-inner {
  --puck-frame-width: auto;
  --puck-side-nav-width: min-content;
  --puck-side-bar-width: 0px;

  background-color: var(--puck-color-grey-12);
  display: grid;
  grid-template-areas:
    "header"
    "editor"
    "left"
    "right"
    "sidenav";
  grid-template-columns: var(--puck-frame-width);
  grid-template-rows: min-content auto 0 0 var(--puck-side-nav-width);
  height: 100%;
  transition: grid-template-rows 150ms ease-in;
}

@media (min-width: 638px) {
  .PuckLayout-inner {
    --puck-side-nav-width: 68px;
    grid-template-areas: "header header header header" "sidenav left editor right";
    grid-template-columns: var(--puck-side-nav-width) 0 var(--puck-frame-width) 0;
    grid-template-rows: min-content auto;
  }
}

@media (min-width: 990px) {
  .PuckLayout .PuckLayout-inner {
    --puck-side-bar-width: 256px;
  }
}
```

---

## Your Current Dashboard Styling

### Design System Analysis

Your app uses **Tailwind CSS v4** with a **Shadcn UI-inspired** design system:

```css
/* app/globals.css */
:root {
  /* OKLCH color space (modern, perceptually uniform) */
  --background: oklch(1 0 0);                    /* White */
  --foreground: oklch(0.141 0.005 285.823);      /* Dark grey */
  --primary: oklch(0.21 0.006 285.885);          /* Dark purple-grey */
  --primary-foreground: oklch(0.985 0 0);        /* Off-white */
  --secondary: oklch(0.967 0.001 286.375);       /* Light grey */
  --muted: oklch(0.967 0.001 286.375);           /* Light grey */
  --muted-foreground: oklch(0.552 0.016 285.938); /* Medium grey */
  --border: oklch(0.92 0.004 286.32);            /* Light grey */
  --destructive: oklch(0.577 0.245 27.325);      /* Red */
}

.dark {
  --background: oklch(0.141 0.005 285.823);      /* Dark */
  --foreground: oklch(0.985 0 0);                /* Light */
  --primary: oklch(0.92 0.004 286.32);           /* Light grey */
  --primary-foreground: oklch(0.21 0.006 285.885);/* Dark */
}
```

### Current Dashboard Layout

```tsx
/* app/admin/(dashboard)/layout.tsx */
<div className="flex h-screen overflow-hidden bg-background">
  <AdminSidebar />  {/* Left sidebar navigation */}
  <div className="flex flex-col flex-1 overflow-hidden">
    <AdminHeader />  {/* Top header with actions */}
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

### Current Component Usage

You're **already using Puck components** in your dashboard:

```tsx
/* components/admin/admin-header.tsx */
import { ActionBar, Button, IconButton } from "@measured/puck";

<ActionBar label="Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button href="/admin/pages/create" variant="primary" icon={<Plus />}>
      New page
    </Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={() => {}}>
    <Button href="/" variant="secondary" icon={<Home />} newTab>
      View site
    </Button>
  </ActionBar.Action>
</ActionBar>
```

---

## Approach Comparison

### Approach 1: Use Puck Components ✅ (RECOMMENDED)

**What it means:**
- Continue using Puck's components (Button, ActionBar, IconButton) throughout your dashboard
- Keep your current dashboard layout (it's excellent!)
- Use Puck components for consistency with the editor

**Pros:**
- ✅ **Simple**: 1-2 hours to implement
- ✅ **No breaking changes**: Your current code already works
- ✅ **Consistent**: Dashboard matches editor styling
- ✅ **Maintainable**: Puck handles component updates
- ✅ **Accessible**: Puck components have built-in accessibility
- ✅ **Type-safe**: Full TypeScript support

**Cons:**
- ⚠️ **Different design language**: Puck uses azure blue, you use purple-grey
- ⚠️ **Limited customization**: Can't change Puck's internal colors easily

**Effort:** 1-2 hours

**Code Example:**
```tsx
// Just keep doing what you're already doing!
import { ActionBar, Button, IconButton } from "@measured/puck";

export function MyDashboardPage() {
  return (
    <div className="p-6">
      <ActionBar label="Page actions">
        <ActionBar.Group>
          <ActionBar.Action onClick={() => {}}>
            <Button variant="primary" icon={<Plus />}>
              Create
            </Button>
          </ActionBar.Action>
          <ActionBar.Action onClick={() => {}}>
            <Button variant="secondary" icon={<Edit />}>
              Edit
            </Button>
          </ActionBar.Action>
        </ActionBar.Group>
      </ActionBar>
    </div>
  );
}
```

---

### Approach 2: Theme Puck to Match Your Design ❌ (NOT RECOMMENDED)

**What it means:**
- Override Puck's CSS variables to match your OKLCH color system
- Potentially fork Puck's components to use your design tokens
- Maintain custom overrides as Puck updates

**Pros:**
- ✅ **Perfect consistency**: Editor matches your design exactly
- ✅ **Single design system**: No conflicting color schemes

**Cons:**
- ❌ **Very complex**: 8-16 hours of work
- ❌ **Limited theming API**: Puck's theming is intentionally limited
- ❌ **Fragile**: Overrides break when Puck updates
- ❌ **Maintenance burden**: You must maintain custom CSS
- ❌ **Color space mismatch**: Puck uses sRGB, you use OKLCH
- ❌ **Incomplete coverage**: Can't override all internal components

**Effort:** 8-16 hours

**Why It's Hard:**

1. **Limited Theming API:**
   ```tsx
   // Puck only supports 2 CSS variables for theming:
   :root {
     --puck-font-family: Arial;
     --puck-font-family-monospaced: Menlo;
   }
   // That's it! No color variables are officially supported.
   ```

2. **Color Space Mismatch:**
   ```css
   /* Puck uses sRGB hex colors */
   --puck-color-azure-04: #0066c9;

   /* You use OKLCH colors */
   --primary: oklch(0.21 0.006 285.885);

   /* Converting between them is lossy and complex */
   ```

3. **CSS Modules:**
   ```css
   /* Puck uses CSS Modules with hashed class names */
   .Button_button__abc123 { /* ... */ }

   /* You can't override these without !important or specificity wars */
   ```

4. **Internal Components:**
   ```tsx
   // Many components are not exposed via overrides
   // You'd have to fork the entire package
   ```

**If You Really Want to Try (Not Recommended):**

```css
/* app/admin/puck-overrides.css */
/* WARNING: This is fragile and may break with Puck updates */

/* Override Puck's color variables */
:root {
  /* Convert your OKLCH colors to sRGB hex */
  --puck-color-azure-04: #3a3a4a;  /* Your primary color */
  --puck-color-azure-03: #2a2a3a;
  --puck-color-azure-05: #4a4a5a;
  --puck-color-azure-12: #f7f7f8;  /* Your secondary color */

  /* Override grey scale */
  --puck-color-grey-01: #1a1a1a;
  --puck-color-grey-12: #fafafa;

  /* Override fonts */
  --puck-font-family: var(--font-sans);
}

/* Force overrides with high specificity */
.Puck .Button--primary {
  background: var(--puck-color-azure-04) !important;
}

.Puck .Button--primary:hover {
  background: var(--puck-color-azure-03) !important;
}

/* This approach is fragile and requires constant maintenance */
```

---

## Recommended Implementation

### Step 1: Use Puck Components Everywhere (1 hour)

Replace any remaining Shadcn UI components in your admin area with Puck components:

**Before:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
```

**After:**
```tsx
import { Button } from "@measured/puck";

<Button variant="primary">Click me</Button>
```

### Step 2: Standardize Action Bars (30 minutes)

Group related actions using ActionBar:

```tsx
import { ActionBar, Button } from "@measured/puck";
import { Plus, Edit, Trash } from "lucide-react";

export function PageActions() {
  return (
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
  );
}
```

### Step 3: Use IconButton for Icon-Only Buttons (15 minutes)

Always use IconButton with a title prop for accessibility:

```tsx
import { IconButton } from "@measured/puck";
import { Settings, Trash2 } from "lucide-react";

<IconButton
  type="button"
  title="Settings"
  onClick={handleSettings}
>
  <Settings focusable={false} />
</IconButton>

<IconButton
  type="button"
  title="Delete"
  onClick={handleDelete}
>
  <Trash2 focusable={false} />
</IconButton>
```

### Step 4: Keep Your Layout (0 minutes)

Your current dashboard layout is excellent! Don't change it:

```tsx
/* app/admin/(dashboard)/layout.tsx */
<div className="flex h-screen overflow-hidden bg-background">
  <AdminSidebar />
  <div className="flex flex-col flex-1 overflow-hidden">
    <AdminHeader />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

### Step 5: Document the Pattern (15 minutes)

Add a comment to your admin layout explaining the design system:

```tsx
/*
 * ADMIN AREA DESIGN SYSTEM
 *
 * This admin area uses @measured/puck components for consistency
 * with the Puck page editor. The dashboard layout uses Tailwind CSS,
 * but all interactive components should come from @measured/puck.
 *
 * Components to use:
 * - Button (primary, secondary, with icon)
 * - ActionBar (for grouping related actions)
 * - IconButton (for icon-only buttons, always include title)
 * - Drawer (for navigation menus)
 *
 * Do NOT use Shadcn UI components in the admin area.
 * Use Shadcn UI only in public/guest areas (app/[locale]/*).
 */
```

---

## Why Not Theme Puck?

### 1. Limited Theming API

From Puck's own documentation:

> "Theming in Puck is currently limited in functionality, and being explored via [#139 on GitHub](https://github.com/measuredco/puck/issues/139)."

The only officially supported theme properties are:
- `--puck-font-family`
- `--puck-font-family-monospaced`

**No color variables are officially supported.**

### 2. Color Space Mismatch

- **Puck**: Uses sRGB hex colors (`#0066c9`)
- **You**: Use OKLCH colors (`oklch(0.21 0.006 285.885)`)

Converting between them is:
- Lossy (OKLCH has wider gamut)
- Complex (requires color space conversion)
- Maintenance-heavy (must convert every color)

### 3. CSS Modules Prevent Easy Overrides

Puck uses CSS Modules with hashed class names:

```css
/* Puck's internal CSS */
.Button_button__abc123 {
  background: var(--puck-color-azure-04);
}
```

You can't override this without:
- `!important` (fragile)
- High specificity (breaks easily)
- Forking the package (maintenance nightmare)

### 4. Internal Components Not Exposed

Many Puck components are not exposed via the overrides API:
- Resize handles
- Drop zone indicators
- Drag overlays
- Loading states
- Modal dialogs

You'd have to maintain a fork of the entire package.

### 5. Maintenance Burden

If you theme Puck to match your design:
- You must maintain custom CSS for every Puck update
- Breaking changes in Puck will break your theme
- You can't easily upgrade Puck versions
- You're essentially forking the package

### 6. Time Investment

- **Theming Puck**: 8-16 hours initial work + ongoing maintenance
- **Using Puck components**: 1-2 hours one-time work

The ROI is clear: **Use Puck components.**

---

## Conclusion

### The Simpler Approach

**Use Puck components in your dashboard.**

This approach is:
- ✅ **8x faster** (1-2 hours vs 8-16 hours)
- ✅ **More maintainable** (no custom CSS to maintain)
- ✅ **Type-safe** (full TypeScript support)
- ✅ **Accessible** (built-in accessibility)
- ✅ **Future-proof** (works with Puck updates)

### What You Get

- Consistent styling between dashboard and editor
- Professional, polished UI components
- No maintenance burden
- Ability to upgrade Puck seamlessly

### What You Give Up

- Perfect color matching (dashboard will be azure blue, editor will be purple-grey)
- Single design system (you'll have two: Puck's and yours)

### The Trade-off

**Is it worth 8-16 hours of work to make the colors match exactly?**

Probably not. The slight color difference is negligible compared to the:
- Time saved
- Maintenance avoided
- Consistency gained

### Final Recommendation

**Keep doing what you're already doing!**

Your current approach is correct:
1. Use Puck components in admin area
2. Use Shadcn UI in public area
3. Keep your excellent dashboard layout
4. Don't try to theme Puck

---

## Quick Reference

### Puck Components to Use

```tsx
import {
  Button,        // Primary and secondary buttons
  ActionBar,     // Action bar for grouping actions
  IconButton,    // Icon-only buttons (requires title)
  Drawer,        // Navigation drawer
  AutoField,     // Form fields
  FieldLabel,    // Field labels
} from "@measured/puck";
```

### Component Patterns

**Button with icon:**
```tsx
<Button variant="primary" icon={<Plus />}>
  New page
</Button>
```

**ActionBar with groups:**
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

**IconButton (always include title):**
```tsx
<IconButton type="button" title="Settings" onClick={handleSettings}>
  <Settings focusable={false} />
</IconButton>
```

### File Locations

- **Admin dashboard**: `app/admin/*` (use Puck components)
- **Public pages**: `app/[locale]/*` (use Shadcn UI)
- **Editor page**: `app/admin/pages/[locale]/[slug]/edit/*` (uses full Puck)

---

## Further Reading

- [Puck Component Guide](./PUCK_COMPONENTS_GUIDE.md)
- [UI Guidelines](./UI_GUIDELINES.md)
- [Server Actions Guide](./SERVER_ACTIONS_GUIDE.md)
- [Puck Documentation](https://puckeditor.com/docs)
- [Puck GitHub Repository](https://github.com/puckeditor/puck)
