# Puck Layout Design Analysis & Integration Guide

## Executive Summary

Based on analysis of the Puck core package repository, this document outlines the simplest ways to incorporate Puck's layout design patterns into your dashboard. Puck uses a sophisticated **CSS Grid-based layout system** with responsive breakpoints and plugin architecture.

## Key Findings

### 1. Puck's Core Layout Architecture

**Grid-Based Layout System:**
- Uses CSS Grid with named areas: `"header" "editor" "left" "right" "sidenav"`
- Responsive sidebar widths that scale with viewport
- Mobile-first approach with collapsible panels
- CSS custom properties for dynamic sizing

**Key CSS Variables:**
```css
--puck-frame-width: auto
--puck-side-nav-width: min-content
--puck-side-bar-width: 0px
--puck-left-side-bar-width: var(--puck-user-left-side-bar-width, var(--puck-side-bar-width))
--puck-right-side-bar-width: var(--puck-user-right-side-bar-width, var(--puck-side-bar-width))
```

**Responsive Breakpoints:**
- Mobile: < 638px (hidden sidebars)
- Tablet: 638px - 990px (186px - 250px sidebars)
- Desktop: 990px - 1198px (256px sidebars)
- Large: 1198px - 1398px (274px sidebars)
- XLarge: 1398px - 1598px (290px sidebars)
- XXLarge: 1598px+ (320px sidebars)

### 2. Plugin Architecture

Puck uses a **plugin system** for sidebar content:

**Built-in Plugins:**
- `blocksPlugin` - Component library/drawer
- `outlinePlugin` - Page structure tree
- `fieldsPlugin` - Component property editor
- `legacySideBarPlugin` - Combined components + outline

**Plugin Structure:**
```typescript
const plugin = {
  name: "plugin-name",
  label: "Display Name",
  render: () => <Component />,
  // Optional:
  mobileOnly: false,
  desktopOnly: false,
}
```

### 3. Component Composition

Puck exposes **compositional components** for custom layouts:

- `<Puck.Layout>` - Full layout with header, sidebars, canvas
- `<Puck.Components>` - Draggable component list
- `<Puck.Fields>` - Property editor
- `<Puck.Outline>` - Page tree
- `<Puck.Preview>` - Drag-and-drop canvas

## Simplest Integration Approaches

### Option 1: Use Puck Components Directly (Recommended)

**Best for:** Quick integration with minimal custom code

**Implementation:**
```tsx
import { Puck } from "@measured/puck";
import { Button, ActionBar, IconButton } from "@measured/puck";

// Your existing admin layout
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Use Puck components in your pages
export default function MyPage() {
  return (
    <div className="space-y-6">
      <ActionBar label="Page Actions">
        <ActionBar.Action onClick={() => {}}>
          <Button variant="primary">Save</Button>
        </ActionBar.Action>
      </ActionBar>
      
      {/* Your content */}
    </div>
  );
}
```

**Pros:**
- ✅ Zero additional CSS needed
- ✅ Consistent with Puck editor
- ✅ Built-in dark mode support
- ✅ Responsive out of the box

**Cons:**
- ❌ Limited to Puck's design system
- ❌ Less flexibility for custom layouts

### Option 2: Copy Puck's CSS Grid Layout

**Best for:** Full control over layout while using Puck's responsive patterns

**Implementation:**

Create `app/admin/styles/admin-layout.css`:
```css
.admin-layout {
  --admin-header-height: 60px;
  --admin-sidebar-width: 256px;
  --admin-sidebar-width-collapsed: 0px;
  
  display: grid;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  grid-template-columns: var(--admin-sidebar-width) 1fr;
  grid-template-rows: var(--admin-header-height) 1fr;
  height: 100vh;
  overflow: hidden;
}

.admin-layout--sidebar-collapsed {
  --admin-sidebar-width: var(--admin-sidebar-width-collapsed);
}

.admin-layout__sidebar {
  grid-area: sidebar;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  transition: width 150ms ease-in;
}

.admin-layout__header {
  grid-area: header;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: var(--admin-header-height);
}

.admin-layout__main {
  grid-area: main;
  overflow-y: auto;
  padding: 24px;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .admin-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: var(--admin-header-height) 1fr;
  }
  
  .admin-layout__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 300ms ease-in-out;
  }
  
  .admin-layout__sidebar--open {
    transform: translateX(0);
  }
}
```

Update `app/admin/(dashboard)/layout.tsx`:
```tsx
import "@/admin/styles/admin-layout.css";
import { requireAuth } from "@/lib/route-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ requireInvitation: true });

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <AdminSidebar />
      </aside>
      <div className="flex flex-col">
        <header className="admin-layout__header">
          <AdminHeader />
        </header>
        <main className="admin-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Pros:**
- ✅ Full control over layout
- ✅ Responsive patterns from Puck
- ✅ Can customize breakpoints
- ✅ Works with existing components

**Cons:**
- ❌ Requires custom CSS
- ❌ More maintenance overhead

### Option 3: Hybrid Approach (Recommended for Your Use Case)

**Best for:** Using Puck components in dashboard, custom layout for editor

**Strategy:**
1. Keep your current dashboard layout (it's already good!)
2. Use Puck components (Button, ActionBar, etc.) for consistency
3. Use full Puck Layout only in editor page

**Implementation:**

Your current dashboard layout is already well-designed. Keep it as-is!

Enhance with Puck components where appropriate:

```tsx
// app/admin/(dashboard)/page.tsx
import { requireAuth } from "@/lib/route-guard";
import { getPagesTree } from "@/lib/page";
import { PagesTree } from "./pages-tree";
import { ActionBar, Button } from "@measured/puck";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  await requireAuth({ requireInvitation: true });
  const pagesTree = await getPagesTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your site pages and content structure
          </p>
        </div>
        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button 
              href="/admin/pages/create" 
              variant="primary" 
              icon={<Plus className="h-4 w-4" />}
            >
              New page
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>
      <PagesTree initialItems={pagesTree} />
    </div>
  );
}
```

For the editor page, use full Puck layout:

```tsx
// app/admin/pages/[locale]/[slug]/edit/page.tsx
import { Editor } from "./editor";

export default function EditPage() {
  return <Editor />;
}

// app/admin/pages/[locale]/[slug]/edit/editor.tsx
"use client";

import { Puck } from "@measured/puck";
import { config } from "@/lib/puck/config";

export default function Editor({ pageId, locale, initialTitle, initialContent }) {
  return (
    <div className="h-screen">
      <Puck
        config={config}
        data={initialContent}
        onPublish={handlePublish}
      />
    </div>
  );
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Consistent UI language
- ✅ Minimal refactoring needed
- ✅ Puck editor gets full features

**Cons:**
- ❌ Two different layout systems (but that's OK!)

## Recommended Next Steps

### Phase 1: Quick Wins (1-2 hours)

1. **Replace existing buttons with Puck Buttons** in dashboard:
   - Search for all `<Button>` imports from `@/components/ui/button`
   - Replace with `@measured/puck` Button component
   - Update props to match Puck API (variant, icon, href)

2. **Add ActionBar to page headers**:
   ```tsx
   <ActionBar label="Actions">
     <ActionBar.Action onClick={action1}>
       <Button variant="primary">Action 1</Button>
     </ActionBar.Action>
     <ActionBar.Action onClick={action2}>
       <Button variant="secondary">Action 2</Button>
     </ActionBar.Action>
   </ActionBar>
   ```

3. **Use IconButton for icon-only buttons**:
   ```tsx
   <IconButton type="button" title="Toggle sidebar" onClick={toggleSidebar}>
     <PanelLeft focusable="false" />
   </IconButton>
   ```

### Phase 2: Enhanced Editor (2-4 hours)

1. **Create a proper Puck config** with your components:
   ```tsx
   // lib/puck/config.ts
   import { Config } from "@measured/puck";
   import { HeadingBlock } from "@/components/admin/heading-block";
   import { GridBlock } from "@/components/admin/grid-block";
   
   export const config: Config = {
     components: {
       HeadingBlock,
       GridBlock,
       // ... your components
     },
     categories: {
       layout: {
         components: ["GridBlock", "SpacerBlock"],
       },
       typography: {
         components: ["HeadingBlock", "TextBlock"],
       },
     },
   };
   ```

2. **Add custom plugins** to Puck editor if needed:
   ```tsx
   const customPlugin = {
     name: "seo",
     label: "SEO",
     render: () => <SEOPanel />,
   };
   
   <Puck
     config={config}
     data={initialContent}
     plugins={[customPlugin]}
     onPublish={handlePublish}
   />
   ```

### Phase 3: Advanced Customization (Optional)

1. **Theme customization** - Override Puck CSS variables:
   ```css
   /* app/admin/styles/puck-overrides.css */
   .Puck {
     --puck-color-primary: hsl(var(--primary));
     --puck-color-grey-12: hsl(var(--background));
     --puck-color-grey-01: hsl(var(--border));
   }
   ```

2. **Custom header** in Puck editor:
   ```tsx
   <Puck
     config={config}
     data={initialContent}
     overrides={{
       header: ({ children }) => (
         <CustomHeader onSave={handleSave} />
       ),
     }}
   />
   ```

3. **Responsive sidebar** with Puck's resize logic:
   - Copy sidebar resize hooks from Puck core
   - Implement in your AdminSidebar component

## Key Puck Components to Use

### Button
```tsx
import { Button } from "@measured/puck";

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button href="/path" icon={<Icon />}>Link</Button>
<Button fullWidth>Full width</Button>
<Button loading>Loading...</Button>
```

### ActionBar
```tsx
import { ActionBar } from "@measured/puck";

<ActionBar label="Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={() => {}}>
    <Button variant="secondary">Cancel</Button>
  </ActionBar.Action>
</ActionBar>
```

### IconButton
```tsx
import { IconButton } from "@measured/puck";

<IconButton 
  type="button" 
  title="Close" 
  onClick={() => {}}
>
  <X focusable="false" />
</IconButton>
```

### Drawer (for component lists)
```tsx
import { Drawer } from "@measured/puck";

<Drawer>
  <Drawer.Item name="Heading" />
  <Drawer.Item name="Button" />
  <Drawer.Item name="Card" />
</Drawer>
```

## File Structure Recommendations

```
app/admin/
  styles/
    admin-layout.css       # Your custom layout CSS
    puck-overrides.css     # Puck theme overrides
  (dashboard)/
    layout.tsx             # Keep as-is (already good!)
    page.tsx               # Add ActionBar
  pages/
    [locale]/
      [slug]/
        edit/
          editor.tsx       # Use full Puck layout
          page.tsx

lib/puck/
  config.ts                # Puck component configuration
  plugins/                 # Custom Puck plugins
    seo.ts
    analytics.ts

components/admin/
  admin-header.tsx         # Already using Puck components ✅
  admin-sidebar.tsx        # Already using Puck components ✅
  puck-components/         # Your Puck blocks
    heading-block.tsx
    grid-block.tsx
    link-block.tsx
```

## Conclusion

**Your current dashboard layout is already excellent!** You don't need to change it.

**Recommended approach:**
1. Keep your current dashboard layout (Option 3 - Hybrid)
2. Use Puck components (Button, ActionBar, IconButton) throughout for consistency
3. Use full Puck Layout only in the editor page
4. Gradually adopt more Puck patterns as needed

**Key insight:** Puck's layout system is designed for the page editor, not general admin dashboards. Your current flex-based layout is actually better for a dashboard. Use Puck's components, not their layout system, outside of the editor.

## Resources

- Puck docs: https://puckeditor.dev/docs
- Your Puck components guide: `docs/PUCK_COMPONENTS_GUIDE.md`
- Your UI guidelines: `docs/UI_GUIDELINES.md`
- Puck core repo: https://github.com/puckeditor/puck/tree/main/packages/core
