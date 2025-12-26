# Puck-Compatible UI Components

This folder contains documentation for using `@measured/puck` components in the Pucked admin dashboard.

## Why Use Puck Components?

The admin dashboard uses `@measured/puck` components to maintain **visual consistency** with the page editor. This creates a cohesive user experience throughout the admin interface.

**Benefits:**
- ✅ Consistent styling with the page editor
- ✅ No additional CSS to maintain
- ✅ Automatic updates with Puck releases
- ✅ Reduced bundle size (already installed)
- ✅ Familiar patterns for users

## Quick Start

### 1. Import Components

```tsx
import { Button, ActionBar, IconButton } from "@measured/puck";
```

### 2. Use in Admin Pages

```tsx
<ActionBar label="Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
</ActionBar>
```

### 3. Follow Puck's Styling Patterns

```tsx
// Use CSS variables for styling
<div style={{
  background: "var(--puck-color-grey-12)",
  padding: "var(--puck-space-px)"
}}>
```

## Documentation Files

### [components-guide.md](./components-guide.md)
**Complete API reference** for all Puck components.

- Component props and usage
- Sub-components (like `ActionBar.Action`)
- Common patterns and examples
- Pitfalls to avoid

**Read this when:** You need to look up how to use a specific component.

### [quick-reference.md](./quick-reference.md)
**Cheat sheet** for common Puck component patterns.

- Copy-paste examples
- Common use cases
- Quick syntax reference

**Read this when:** You know what you need and just want the syntax.

### [implementation-guide.md](./implementation-guide.md)
**Step-by-step guide** for integrating Puck components.

- Installation and setup
- Migration from Shadcn UI
- Best practices
- Troubleshooting

**Read this when:** You're new to Puck components or migrating existing code.

### [examples.md](./examples.md)
**Real-world code examples** for common scenarios.

- Complete page examples
- Form patterns
- List/table views
- Settings pages
- Modals and dialogs

**Read this when:** You want to see complete working examples.

## Key Concepts

### CSS Variables

Puck uses CSS custom properties for all styling:

```css
/* Spacing */
--puck-space-px: 16px

/* Colors */
--puck-color-white: #ffffff
--puck-color-black: #000000
--puck-color-grey-05: #767676
--puck-color-grey-09: #dcdcdc
--puck-color-grey-11: #f5f5f5
--puck-color-grey-12: #fafafa
--puck-color-azure-04: #0158ad

/* Typography */
--puck-font-size-xxs: 14px
--puck-font-size-xs: 16px
--puck-font-size-s: 18px
```

### Component Constraints

**Button:**
- ❌ Does NOT accept `className` prop
- ✅ Use `fullWidth` prop for full-width buttons
- ✅ Use `href` prop for links (not `asChild`)
- ✅ Use `icon` prop for icon buttons

**ActionBar:**
- ❌ Does NOT use `ActionBar.Label` subcomponent
- ✅ Use the `label` prop instead
- ✅ Wrap buttons in `ActionBar.Action`

**IconButton:**
- ✅ Always provide `title` prop for accessibility
- ✅ Use for icon-only buttons

### Styling Approach

**Use inline styles with CSS variables:**
```tsx
<div style={{
  background: "var(--puck-color-grey-12)",
  padding: "var(--puck-space-px)",
  border: "1px solid var(--puck-color-grey-09)"
}}>
```

**Don't use Tailwind classes on Puck components:**
```tsx
// ❌ Wrong
<Button className="my-custom-class">

// ✅ Right
<div className="my-custom-class">
  <Button variant="primary">Click me</Button>
</div>
```

## Common Patterns

### Action Bar with Buttons

```tsx
<ActionBar label="Page Actions">
  <ActionBar.Action onClick={handleSave}>
    <Button variant="primary" icon={<Save />}>
      Save
    </Button>
  </ActionBar.Action>
  
  <ActionBar.Action onClick={handleCancel}>
    <Button variant="secondary" icon={<X />}>
      Cancel
    </Button>
  </ActionBar.Action>
</ActionBar>
```

### Icon Button

```tsx
<IconButton
  type="button"
  title="Toggle sidebar"
  onClick={toggleSidebar}
>
  <PanelLeft focusable="false" />
</IconButton>
```

### Button as Link

```tsx
<Button
  href="/admin/pages/create"
  variant="primary"
  icon={<Plus />}
>
  New page
</Button>
```

## When to Use Puck vs Shadcn

| Scenario | Use |
|----------|-----|
| Admin dashboard pages | **Puck components** |
| Page editor (`/admin/pages/[...]/edit`) | **Puck components** |
| Public pages (`/en/*`, `/fa/*`) | **Shadcn UI** |
| Login/signup forms | **Shadcn UI** |

## Related Documentation

- **[UI Guidelines](../UI_GUIDELINES.md)** - Overall design system and patterns
- **[Server Actions Guide](../server-actions/nextjs-server-actions.md)** - Form handling with React 19
- **[Authentication Guide](../authentication/invitation-system.md)** - Auth flow documentation

## Troubleshooting

### CSS Variables Not Working

**Problem:** `var(--puck-space-px)` returns undefined

**Solution:** Make sure your component is wrapped in the admin dashboard layout which defines these variables:

```tsx
// app/admin/(dashboard)/layout.tsx
<div className={styles.adminDashboard}>
  {/* CSS variables defined here */}
  {children}
</div>
```

### Button Styling Issues

**Problem:** Can't add custom classes to Button

**Solution:** Use a wrapper div:

```tsx
<div className="my-custom-class">
  <Button variant="primary">Click me</Button>
</div>
```

### ActionBar Not Working

**Problem:** `ActionBar.Label` doesn't exist

**Solution:** Use the `label` prop instead:

```tsx
// ❌ Wrong
<ActionBar>
  <ActionBar.Label>Actions</ActionBar.Label>
  <ActionBar.Action>...</ActionBar.Action>
</ActionBar>

// ✅ Right
<ActionBar label="Actions">
  <ActionBar.Action>...</ActionBar.Action>
</ActionBar>
```

---

**Need help?** Check the [components-guide.md](./components-guide.md) for detailed API documentation.
