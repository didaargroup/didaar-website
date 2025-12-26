# Puck Integration - Code Examples

This document provides practical code examples for using Puck components in your dashboard.

---

## Table of Contents

1. [Complete Dashboard Page Example](#complete-dashboard-page-example)
2. [Admin Header Enhancement](#admin-header-enhancement)
3. [Form Page Example](#form-page-example)
4. [List/Table Page Example](#listtable-page-example)
5. [Settings Page Example](#settings-page-example)
6. [Modal/Dialog Example](#modaldialog-example)

---

## Complete Dashboard Page Example

### Before: Using Shadcn UI

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage your pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => {}}>
            <Plus className="h-4 w-4" />
            New page
          </Button>
        </div>
      </div>

      {/* Page content */}
    </div>
  );
}
```

### After: Using Puck Components

```tsx
"use client";

import { ActionBar, Button, IconButton } from "@measured/puck";
import { Plus, Edit, Trash, Eye } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage your pages
          </p>
        </div>

        <ActionBar label="Actions">
          <ActionBar.Group>
            <ActionBar.Action onClick={() => {}}>
              <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
                New page
              </Button>
            </ActionBar.Action>
          </ActionBar.Group>
        </ActionBar>
      </div>

      {/* Page content */}
    </div>
  );
}
```

**Changes:**
1. Import from `@measured/puck` instead of `@/components/ui/button`
2. Use `ActionBar` to group actions
3. Use `ActionBar.Action` wrapper for buttons
4. Add `icon` prop to Button (instead of children)
5. Change `variant="default"` to `variant="primary"`

---

## Admin Header Enhancement

### Current Implementation

```tsx
// components/admin/admin-header.tsx
"use client";

import { ActionBar, Button, IconButton } from "@measured/puck";
import { Home, LogOut, PanelLeft, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

export function AdminHeader() {
  const pathname = usePathname();

  const toggleMobileSidebar = () => {
    const sidebar = document.querySelector("[data-sidebar]") as HTMLElement;
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <IconButton type="button" title="Toggle sidebar" onClick={toggleMobileSidebar}>
              <PanelLeft focusable="false" />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              P
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">Puck Admin</div>
              <div className="text-xs text-muted-foreground">{pathname?.replace("/", "") || "admin"}</div>
            </div>
          </div>
        </div>

        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button href="/admin/pages/create" variant="primary" icon={<Plus className="h-4 w-4" />}>
              New page
            </Button>
          </ActionBar.Action>

          <ActionBar.Action onClick={() => {}}>
            <Button href="/" variant="secondary" icon={<Home className="h-4 w-4" />} newTab>
              View site
            </Button>
          </ActionBar.Action>

          <ActionBar.Action onClick={() => {}}>
            <form action={logout}>
              <Button type="submit" variant="secondary" icon={<LogOut className="h-4 w-4" />}>
                Logout
              </Button>
            </form>
          </ActionBar.Action>
        </ActionBar>
      </div>
    </header>
  );
}
```

**This is already perfect!** ✅

Your admin header is already using Puck components correctly. No changes needed.

---

## Form Page Example

### Create Page Form

```tsx
"use client";

import { useActionState } from "react";
import { ActionBar, Button } from "@measured/puck";
import { Save, X } from "lucide-react";
import { createPageAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FormState = {
  errors?: {
    title?: string[];
    slug?: string[];
    _form?: string[];
  };
  success: boolean;
};

const initialState: FormState = {
  success: false,
};

export default function CreatePageForm() {
  const [state, formAction] = useActionState(createPageAction, initialState);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create New Page</CardTitle>
            <CardDescription>
              Create a new page for your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {/* Title field */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter page title"
                  required
                  className={state.errors && 'title' in state.errors ? "border-destructive" : ""}
                />
                {state.errors && 'title' in state.errors && (
                  <p className="text-xs text-destructive">
                    {state.errors.title?.[0]}
                  </p>
                )}
              </div>

              {/* Slug field */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="page-url-slug"
                  required
                  className={state.errors && 'slug' in state.errors ? "border-destructive" : ""}
                />
                {state.errors && 'slug' in state.errors && (
                  <p className="text-xs text-destructive">
                    {state.errors.slug?.[0]}
                  </p>
                )}
              </div>

              {/* Form-level error */}
              {state.errors && '_form' in state.errors && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    {state.errors._form?.[0]}
                  </p>
                </div>
              )}

              {/* Form actions */}
              <ActionBar label="Form actions">
                <ActionBar.Group>
                  <ActionBar.Action onClick={() => {}}>
                    <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>
                      Create Page
                    </Button>
                  </ActionBar.Action>
                </ActionBar.Group>

                <ActionBar.Group>
                  <ActionBar.Action onClick={() => window.history.back()}>
                    <Button type="button" variant="secondary" icon={<X className="h-4 w-4" />}>
                      Cancel
                    </Button>
                  </ActionBar.Action>
                </ActionBar.Group>
              </ActionBar>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Key Points:**
1. Use `ActionBar` to group form actions
2. Use `ActionBar.Group` to separate primary and secondary actions
3. Use `Button` with `variant="primary"` for submit
4. Use `Button` with `variant="secondary"` for cancel
5. Add icons to buttons using `icon` prop
6. Keep Shadcn UI for form fields (Input, Label, Card)

---

## List/Table Page Example

### Pages List with Row Actions

```tsx
"use client";

import { IconButton } from "@measured/puck";
import { Edit, Trash, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Page = {
  id: number;
  title: string;
  slug: string;
  locale: string;
};

export default function PagesList() {
  const pages: Page[] = [
    { id: 1, title: "Home", slug: "home", locale: "en" },
    { id: 2, title: "About", slug: "about", locale: "en" },
    { id: 3, title: "Contact", slug: "contact", locale: "en" },
  ];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Locale</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border">
                  <td className="p-4">{page.title}</td>
                  <td className="p-4">{page.slug}</td>
                  <td className="p-4">{page.locale}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton
                        type="button"
                        title="View page"
                        onClick={() => window.open(`/${page.locale}/${page.slug}`, '_blank')}
                      >
                        <Eye focusable={false} className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        type="button"
                        title="Edit page"
                        onClick={() => window.location.href = `/admin/pages/${page.locale}/${page.slug}/edit`}
                      >
                        <Edit focusable={false} className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        type="button"
                        title="Delete page"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
                            // Handle delete
                          }
                        }}
                      >
                        <Trash focusable={false} className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Key Points:**
1. Use `IconButton` for icon-only actions
2. Always include `title` prop for accessibility
3. Always add `focusable={false}` to Lucide icons
4. Use `className="h-4 w-4"` for icon sizing
5. Group icon buttons in a flex container with gap

---

## Settings Page Example

### Settings Form with Multiple Sections

```tsx
"use client";

import { useActionState } from "react";
import { ActionBar, Button } from "@measured/puck";
import { Save, X } from "lucide-react";
import { saveSettingsAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FormState = {
  errors?: {
    siteName?: string[];
    siteUrl?: string[];
    _form?: string[];
  };
  success: boolean;
};

const initialState: FormState = {
  success: false,
};

export default function SettingsPage() {
  const [state, formAction] = useActionState(saveSettingsAction, initialState);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your site settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your site's basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                name="siteName"
                type="text"
                placeholder="My Site"
                required
                className={state.errors && 'siteName' in state.errors ? "border-destructive" : ""}
              />
              {state.errors && 'siteName' in state.errors && (
                <p className="text-xs text-destructive">
                  {state.errors.siteName?.[0]}
                </p>
              )}
            </div>

            {/* Site URL */}
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                name="siteUrl"
                type="url"
                placeholder="https://example.com"
                required
                className={state.errors && 'siteUrl' in state.errors ? "border-destructive" : ""}
              />
              {state.errors && 'siteUrl' in state.errors && (
                <p className="text-xs text-destructive">
                  {state.errors.siteUrl?.[0]}
                </p>
              )}
            </div>

            {/* Form-level error */}
            {state.errors && '_form' in state.errors && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  {state.errors._form?.[0]}
                </p>
              </div>
            )}

            {/* Success message */}
            {state.success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Settings saved successfully!
                </p>
              </div>
            )}

            {/* Form actions */}
            <ActionBar label="Actions">
              <ActionBar.Group>
                <ActionBar.Action onClick={() => {}}>
                  <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>
                    Save Settings
                  </Button>
                </ActionBar.Action>
              </ActionBar.Group>

              <ActionBar.Group>
                <ActionBar.Action onClick={() => window.location.reload()}>
                  <Button type="button" variant="secondary" icon={<X className="h-4 w-4" />}>
                    Reset
                  </Button>
                </ActionBar.Action>
              </ActionBar.Group>
            </ActionBar>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Modal/Dialog Example

### Delete Confirmation Dialog

```tsx
"use client";

import { ActionBar, Button } from "@measured/puck";
import { AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end mt-6">
          <ActionBar label="Confirm">
            <ActionBar.Group>
              <ActionBar.Action onClick={onConfirm}>
                <Button variant="primary">Confirm</Button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Usage example
export default function PageWithDelete() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Perform delete
    setShowConfirm(false);
  };

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => setShowConfirm(true)}
      >
        Delete Page
      </Button>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Page"
        description="Are you sure you want to delete this page? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Page Header with Actions

```tsx
export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <ActionBar label="Actions">
            {actions}
          </ActionBar>
        )}
      </div>
    </div>
  );
}

// Usage
<PageHeader
  title="Pages"
  description="Manage your pages"
  actions={
    <ActionBar.Group>
      <ActionBar.Action onClick={handleCreate}>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
          New page
        </Button>
      </ActionBar.Action>
    </ActionBar.Group>
  }
/>
```

### Pattern 2: Empty State with Action

```tsx
export function EmptyState({ title, description, action }: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>
        <ActionBar label="Actions">
          <ActionBar.Group>
            {action}
          </ActionBar.Group>
        </ActionBar>
      </div>
    </div>
  );
}

// Usage
<EmptyState
  title="No pages yet"
  description="Create your first page to get started"
  action={
    <ActionBar.Action onClick={handleCreate}>
      <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
        Create Page
      </Button>
    </ActionBar.Action>
  }
/>
```

### Pattern 3: Loading State

```tsx
export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

### Pattern 4: Error State

```tsx
export function ErrorState({ title, message, onRetry }: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {message}
        </p>
        {onRetry && (
          <ActionBar label="Actions">
            <ActionBar.Group>
              <ActionBar.Action onClick={onRetry}>
                <Button variant="secondary">Try Again</Button>
              </ActionBar.Action>
            </ActionBar.Group>
          </ActionBar>
        )}
      </div>
    </div>
  );
}
```

---

## Summary

### Key Takeaways

1. **Use Puck components in admin area** (`app/admin/*`)
2. **Use Shadcn UI in public area** (`app/[locale]/*`)
3. **Always use ActionBar** for grouping actions
4. **Always include `title`** on IconButton
5. **Always add `focusable={false}`** to Lucide icons
6. **Keep your layout** (it's excellent!)

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

### File Structure

```
app/
├── admin/                          ← Use Puck components
│   ├── (dashboard)/
│   │   ├── layout.tsx             ← Keep your layout
│   │   └── page.tsx               ← Use Puck components
│   └── pages/
│       └── [locale]/
│           └── [slug]/
│               └── edit/
│                   └── editor.tsx  ← Use full Puck
└── [locale]/                       ← Use Shadcn UI
    ├── login/
    └── page.tsx
```

---

## Next Steps

1. **Read** [PUCK_QUICK_IMPLEMENTATION.md](./PUCK_QUICK_IMPLEMENTATION.md)
2. **Review** [PUCK_COMPONENTS_GUIDE.md](./PUCK_COMPONENTS_GUIDE.md)
3. **Implement** Puck components throughout your admin area
4. **Enjoy** consistent styling with zero maintenance burden
