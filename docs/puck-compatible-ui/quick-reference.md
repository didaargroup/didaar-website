# Quick Reference: Puck Components in Your Dashboard

## TL;DR

- **Keep your current dashboard layout** (it's great!)
- **Use Puck components** (Button, ActionBar, IconButton) for consistency
- **Use full Puck Layout** only in the editor page

## Component Cheat Sheet

### Button

```tsx
import { Button } from "@measured/puck";

// Basic
<Button variant="primary">Click me</Button>
<Button variant="secondary">Cancel</Button>

// With icon
<Button variant="primary" icon={<Plus className="h-4 w-4" />}>
  New page
</Button>

// As link
<Button href="/admin/pages" variant="secondary">
  View pages
</Button>

// Full width
<Button fullWidth>Full width button</Button>

// Loading state
<Button loading>Saving...</Button>

// Important: Button does NOT accept className prop
// Use wrapper div for custom styling
<div className="my-custom-class">
  <Button variant="primary">Click me</Button>
</div>
```

### ActionBar

```tsx
import { ActionBar } from "@measured/puck";

<ActionBar label="Actions">
  <ActionBar.Action onClick={() => console.log("Save")}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={() => console.log("Cancel")}>
    <Button variant="secondary">Cancel</Button>
  </ActionBar.Action>
</ActionBar>

// Important: ActionBar uses "label" prop, not subcomponent
// ❌ Wrong: <ActionBar.Label>Actions</ActionBar.Label>
// ✅ Correct: <ActionBar label="Actions">
```

### IconButton

```tsx
import { IconButton } from "@measured/puck";

// Important: Always provide title prop for accessibility
<IconButton 
  type="button" 
  title="Close menu"
  onClick={() => {}}
>
  <X focusable="false" />
</IconButton>

// Common pattern: toggle sidebar
<IconButton 
  type="button" 
  title="Toggle sidebar"
  onClick={toggleSidebar}
>
  <PanelLeft focusable="false" />
</IconButton>
```

## Common Patterns

### Page Header with Actions

```tsx
<div className="flex items-start justify-between gap-4">
  <div className="flex-1">
    <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
    <p className="text-sm text-muted-foreground mt-1">
      Page description goes here
    </p>
  </div>
  
  <ActionBar label="Actions">
    <ActionBar.Action onClick={action1}>
      <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
        Primary action
      </Button>
    </ActionBar.Action>
    <ActionBar.Action onClick={action2}>
      <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />}>
        Secondary action
      </Button>
    </ActionBar.Action>
  </ActionBar>
</div>
```

### Card with Actions

```tsx
<div className="rounded-lg border border-border bg-card p-6">
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1">
      <h3 className="font-semibold text-foreground">Card Title</h3>
      <p className="text-sm text-muted-foreground">
        Card description
      </p>
    </div>
    
    <ActionBar label="Actions">
      <ActionBar.Action onClick={editAction}>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </ActionBar.Action>
      <ActionBar.Action onClick={deleteAction}>
        <Button variant="secondary" size="sm">
          Delete
        </Button>
      </ActionBar.Action>
    </ActionBar>
  </div>
</div>
```

### Form Actions

```tsx
<form action={formAction}>
  {/* Form fields here */}
  
  <ActionBar label="Form Actions">
    <ActionBar.Action onClick={() => {}}>
      <Button variant="primary" type="submit">
        Submit
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

### Icon-Only Actions

```tsx
<ActionBar label="Quick actions">
  <ActionBar.Action onClick={refresh}>
    <IconButton type="button" title="Refresh">
      <RefreshCw focusable="false" className="h-4 w-4" />
    </IconButton>
  </ActionBar.Action>
  <ActionBar.Action onClick={edit}>
    <IconButton type="button" title="Edit">
      <Edit focusable="false" className="h-4 w-4" />
    </IconButton>
  </ActionBar.Action>
  <ActionBar.Action onClick={delete}>
    <IconButton type="button" title="Delete">
      <Trash2 focusable="false" className="h-4 w-4" />
    </IconButton>
  </ActionBar.Action>
</ActionBar>
```

## Migration Checklist

### Step 1: Update Imports

```tsx
// Before
import { Button } from "@/components/ui/button";

// After
import { Button } from "@measured/puck";
```

### Step 2: Update Button Props

```tsx
// Before
<Button 
  variant="default"
  className="custom-class"
  onClick={handleClick}
>
  Click me
</Button>

// After
<Button 
  variant="primary"
  onClick={handleClick}
>
  Click me
</Button>
```

### Step 3: Add Icons

```tsx
import { Plus, Edit, Trash2 } from "lucide-react";

<Button 
  variant="primary" 
  icon={<Plus className="h-4 w-4" />}
>
  New item
</Button>
```

### Step 4: Group Actions with ActionBar

```tsx
// Before
<div className="flex gap-2">
  <Button onClick={save}>Save</Button>
  <Button onClick={cancel}>Cancel</Button>
</div>

// After
<ActionBar label="Actions">
  <ActionBar.Action onClick={save}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={cancel}>
    <Button variant="secondary">Cancel</Button>
  </ActionBar.Action>
</ActionBar>
```

## Common Pitfalls to Avoid

### ❌ Don't use className on Button

```tsx
// Wrong
<Button className="my-class" variant="primary">Click</Button>

// Correct
<div className="my-class">
  <Button variant="primary">Click</Button>
</div>
```

### ❌ Don't use ActionBar.Label subcomponent

```tsx
// Wrong
<ActionBar>
  <ActionBar.Label>Actions</ActionBar.Label>
  <ActionBar.Action onClick={action}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>

// Correct
<ActionBar label="Actions">
  <ActionBar.Action onClick={action}>
    <Button>Click</Button>
  </ActionBar.Action>
</ActionBar>
```

### ❌ Don't forget title on IconButton

```tsx
// Wrong
<IconButton onClick={action}>
  <X />
</IconButton>

// Correct
<IconButton type="button" title="Close" onClick={action}>
  <X focusable="false" />
</IconButton>
```

### ❌ Don't use asChild pattern

```tsx
// Wrong
<Button asChild>
  <Link href="/path">Click</Link>
</Button>

// Correct
<Button href="/path">Click</Button>
```

## File Structure

```
app/admin/
  (dashboard)/
    layout.tsx           ← Keep your current layout ✅
    page.tsx             ← Add Puck components
    pages/
      create/
        form.tsx         ← Use Puck Button, ActionBar
        page.tsx
      [locale]/
        [slug]/
          edit/
            editor.tsx   ← Use full Puck Layout
            page.tsx

components/admin/
  admin-header.tsx       ← Already using Puck ✅
  admin-sidebar.tsx      ← Already using Puck ✅
```

## Styling with Tailwind

Puck components work seamlessly with Tailwind:

```tsx
// Wrapper divs for custom styling
<div className="flex items-center justify-between gap-4">
  <Button variant="primary">Click me</Button>
</div>

// Spacing with gap
<ActionBar label="Actions" className="gap-2">
  <ActionBar.Action onClick={action}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
</ActionBar>

// Responsive layouts
<div className="flex flex-col sm:flex-row gap-4">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
</div>
```

## Dark Mode

Puck components automatically support dark mode:

```tsx
// No extra work needed - just use the components
<Button variant="primary">Works in dark mode!</Button>

// Your existing dark mode setup handles the rest
<html className="dark">
  <Button variant="primary">Automatically styled</Button>
</html>
```

## Need Help?

- Full analysis: `docs/PUCK_LAYOUT_ANALYSIS.md`
- Visual comparison: `docs/PUCK_LAYOUT_COMPARISON.md`
- Puck components guide: `docs/PUCK_COMPONENTS_GUIDE.md`
- UI guidelines: `docs/UI_GUIDELINES.md`
- Puck docs: https://puckeditor.dev/docs

## Quick Copy-Paste Templates

### Page Template

```tsx
import { ActionBar, Button } from "@measured/puck";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Description
          </p>
        </div>
        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              New item
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>
      
      {/* Page content */}
    </div>
  );
}
```

### Form Template

```tsx
import { ActionBar, Button } from "@measured/puck";
import { useActionState } from "react";
import { someAction } from "@/app/actions";

export function MyForm() {
  const [state, formAction] = useActionState(someAction, initialState);
  
  return (
    <form action={formAction} className="space-y-6">
      {/* Form fields */}
      
      <ActionBar label="Form Actions">
        <ActionBar.Action onClick={() => {}}>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </ActionBar.Action>
        <ActionBar.Action onClick={() => {}}>
          <Button variant="secondary" type="button">
            Cancel
          </Button>
        </ActionBar.Action>
      </ActionBar>
    </form>
  );
}
```

### Card Template

```tsx
import { ActionBar, Button } from "@measured/puck";
import { Edit, Trash2 } from "lucide-react";

export function Card({ title, description, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ActionBar label="Actions">
          <ActionBar.Action onClick={onEdit}>
            <Button variant="secondary" size="sm" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </ActionBar.Action>
          <ActionBar.Action onClick={onDelete}>
            <Button variant="secondary" size="sm" icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>
    </div>
  );
}
```
