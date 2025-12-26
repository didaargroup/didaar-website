# Puck Layout Integration: Visual Comparison

## Current Dashboard Layout (Keep This!)

Your current dashboard layout is **excellent** and should be kept as-is:

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (256px)  │  Header (60px)                      │
│  ┌─────────────┐  ├─────────────────────────────────────┤
│  │ Dashboard   │  │                                     │
│  │ Pages       │  │  Main Content Area                 │
│  │ Settings    │  │  (flex-1, overflow-auto)            │
│  │             │  │                                     │
│  │             │  │  - Your pages tree                 │
│  │             │  │  - Your forms                      │
│  │             │  │  - Your content                    │
│  └─────────────┘  │                                     │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

**Why this works well:**
- ✅ Simple flexbox layout
- ✅ Responsive with mobile sidebar
- ✅ Familiar dashboard pattern
- ✅ Easy to maintain
- ✅ Already using Puck components (Button, ActionBar, IconButton)

## Puck Editor Layout (Use in Editor Page Only)

Puck's layout is designed specifically for the page editor:

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (Publish, Preview, etc.)                                │
├──────────┬──────────────────────────┬──────────────────────────┤
│          │  Component Tree          │                          │
│  Left    │  (Outline)               │                          │
│  Sidebar │                          │                          │
│          ├──────────────────────────┤                          │
│  -       │  Component Library       │  Canvas                  │
│  Blocks  │  (Draggable items)       │  (Page preview)          │
│          │                          │                          │
│  Outline │                          │  ┌────────────────────┐  │
│          │                          │  │  Your page         │  │
│          │                          │  │  content           │  │
│          │                          │  │  (drag & drop)     │  │
│          │                          │  └────────────────────┘  │
├──────────┴──────────────────────────┴──────────────────────────┤
│  Right Sidebar (Component Properties / Fields)                  │
│  - Edit selected component props                                │
│  - Form fields, colors, text, etc.                             │
└─────────────────────────────────────────────────────────────────┘
```

**Why this works for editor:**
- ✅ Three-column layout for complex editing
- ✅ Left sidebar: Components + Outline
- ✅ Center: Canvas for visual editing
- ✅ Right sidebar: Property editor
- ✅ Optimized for drag-and-drop workflows

## Option 1: Hybrid Approach (Recommended)

**Keep your dashboard layout, use Puck components:**

```tsx
// Dashboard pages use your layout
app/admin/(dashboard)/layout.tsx  ← Your current flex layout ✅
app/admin/(dashboard)/page.tsx    ← Uses Puck Button, ActionBar
app/admin/(dashboard)/pages/      ← Uses Puck components

// Editor page uses full Puck layout
app/admin/pages/[locale]/[slug]/edit/page.tsx  ← Full Puck layout
```

**Visual:**
```
Dashboard: Your Layout + Puck Components
┌──────────┬────────────────────────────────────┐
│ Sidebar  │  Header with Puck ActionBar        │
│          ├────────────────────────────────────┤
│          │  Content with Puck Buttons         │
│          │  - Puck Button (primary)           │
│          │  - Puck Button (secondary)         │
│          │  - Puck IconButton                 │
└──────────┴────────────────────────────────────┘

Editor: Full Puck Layout
┌──────┬─────────────┬──────────┬────────────────┐
│ Nav  │ Components  │ Canvas   │ Fields         │
│      │ + Outline   │          │                │
└──────┴─────────────┴──────────┴────────────────┘
```

## Option 2: Puck Components Everywhere

**Use Puck components in all admin pages:**

### Before (Your Current Code)
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
```

### After (With Puck)
```tsx
import { Button } from "@measured/puck";

<Button variant="primary">Click me</Button>
```

### Benefits
- ✅ Consistent styling across dashboard and editor
- ✅ Built-in dark mode support
- ✅ Icon support built-in
- ✅ No need to maintain separate button component

### ActionBar Pattern
```tsx
// Before: Multiple buttons scattered
<div className="flex gap-2">
  <button onClick={save}>Save</button>
  <button onClick={cancel}>Cancel</button>
  <button onClick={delete}>Delete</button>
</div>

// After: Organized with ActionBar
<ActionBar label="Actions">
  <ActionBar.Action onClick={save}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={cancel}>
    <Button variant="secondary">Cancel</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={delete}>
    <Button variant="secondary">Delete</Button>
  </ActionBar.Action>
</ActionBar>
```

## Option 3: Copy Puck's Grid Layout (Advanced)

**Only if you want to rebuild your dashboard layout:**

```css
/* Copy Puck's responsive grid system */
.admin-layout {
  display: grid;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  grid-template-columns: 256px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

/* Responsive breakpoints from Puck */
@media (max-width: 1024px) {
  .admin-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
  }
}
```

**⚠️ Not recommended** - Your current flex layout is simpler and works fine!

## Component Mapping

### Your Current Components → Puck Equivalents

| Your Component | Puck Equivalent | Notes |
|---------------|-----------------|-------|
| `@/components/ui/button` | `@measured/puck` Button | Puck has built-in icon support |
| Custom action bars | `ActionBar` | Groups related actions |
| Icon buttons | `IconButton` | Always requires title prop |
| Custom sidebars | `Drawer` | For component lists |
| Custom layouts | `Puck.Layout` | Only in editor page |

### When to Use Each

**Use Puck Button:**
- ✅ All admin pages
- ✅ Dashboard actions
- ✅ Form submissions
- ✅ Navigation links (with href prop)

**Use Puck ActionBar:**
- ✅ Page headers with multiple actions
- ✅ Form action bars
- ✅ Card action bars
- ✅ Table bulk actions

**Use Puck IconButton:**
- ✅ Toggle buttons (sidebar, menu)
- ✅ Tooltips (always provide title)
- ✅ Compact actions

**Use Full Puck Layout:**
- ✅ Editor page only
- ❌ Not for general dashboard

## Practical Examples

### Example 1: Dashboard Page Header

```tsx
// Before
<div className="flex items-center justify-between">
  <h1>Pages</h1>
  <div className="flex gap-2">
    <button>Create new</button>
    <button>Export</button>
  </div>
</div>

// After
<div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold">Pages</h1>
    <p className="text-sm text-muted-foreground">Manage pages</p>
  </div>
  <ActionBar label="Actions">
    <ActionBar.Action onClick={() => {}}>
      <Button variant="primary" icon={<Plus />}>
        Create new
      </Button>
    </ActionBar.Action>
    <ActionBar.Action onClick={() => {}}>
      <Button variant="secondary" icon={<Download />}>
        Export
      </Button>
    </ActionBar.Action>
  </ActionBar>
</div>
```

### Example 2: Card with Actions

```tsx
// Before
<div className="card">
  <h3>Page Title</h3>
  <p>Description</p>
  <div className="flex gap-2">
    <button>Edit</button>
    <button>Delete</button>
  </div>
</div>

// After
<div className="rounded-lg border border-border bg-card p-6">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h3 className="font-semibold">Page Title</h3>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
    <ActionBar label="Actions">
      <ActionBar.Action onClick={() => {}}>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </ActionBar.Action>
      <ActionBar.Action onClick={() => {}}>
        <Button variant="secondary" size="sm">
          Delete
        </Button>
      </ActionBar.Action>
    </ActionBar>
  </div>
</div>
```

### Example 3: Form Actions

```tsx
// Before
<form>
  {/* fields */}
  <div className="flex gap-2">
    <button type="submit">Save</button>
    <button type="button">Cancel</button>
  </div>
</form>

// After
<form>
  {/* fields */}
  <ActionBar label="Form Actions">
    <ActionBar.Action onClick={() => {}}>
      <Button variant="primary" type="submit">
        Save
      </Button>
    </ActionBar.Action>
    <ActionBar.Action onClick={() => {}}>
      <Button variant="secondary" type="button">
        Cancel
      </Button>
    </ActionBar.Action>
  </ActionBar>
</form>
```

## Migration Path

### Phase 1: Quick Wins (1-2 hours)
1. Replace Button imports in dashboard pages
2. Add ActionBar to page headers
3. Use IconButton for icon-only buttons

### Phase 2: Consistency (2-3 hours)
1. Update all admin pages to use Puck components
2. Create reusable action bar patterns
3. Document component usage

### Phase 3: Advanced (Optional)
1. Customize Puck theme to match your brand
2. Create custom Puck plugins
3. Extend editor functionality

## Summary

**Keep your dashboard layout** - it's well-designed!
**Use Puck components** - for consistency with editor
**Use full Puck layout** - only in editor page

This hybrid approach gives you:
- ✅ Best of both worlds
- ✅ Minimal refactoring
- ✅ Consistent UI language
- ✅ Future flexibility
