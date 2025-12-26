
```tsx
/**
 * Example: Enhanced Dashboard Page with Puck Components
 * 
 * This shows how to enhance your existing dashboard with Puck components
 * while keeping your current layout structure.
 */

import { requireAuth } from "@/lib/route-guard";
import { getPagesTree } from "@/lib/page";
import { PagesTree } from "./pages-tree";
import { ActionBar, Button, IconButton } from "@measured/puck";
import { Plus, RefreshCw, Download, Trash2 } from "lucide-react";

export default async function DashboardPage() {
  await requireAuth({ requireInvitation: true });
  const pagesTree = await getPagesTree();

  return (
    <div className="space-y-6">
      {/* Page Header with Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your site pages and content structure
          </p>
        </div>
        
        {/* Primary Actions */}
        <ActionBar label="Page Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button 
              href="/admin/pages/create" 
              variant="primary" 
              icon={<Plus className="h-4 w-4" />}
            >
              New page
            </Button>
          </ActionBar.Action>
          
          <ActionBar.Action onClick={() => {}}>
            <Button 
              variant="secondary" 
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </ActionBar.Action>
          
          <ActionBar.Action onClick={() => {}}>
            <Button 
              variant="secondary" 
              icon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Page Tree</h2>
            <p className="text-xs text-muted-foreground">
              Drag to reorder pages
            </p>
          </div>
          
          {/* Secondary Actions */}
          <ActionBar label="Tree Actions">
            <ActionBar.Action onClick={() => {}}>
              <Button 
                variant="secondary" 
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete selected
              </Button>
            </ActionBar.Action>
          </ActionBar>
        </div>
        
        <div className="p-6">
          <PagesTree initialItems={pagesTree} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Pages" 
          value="12" 
          description="Across all locales"
        />
        <StatsCard 
          title="Published" 
          value="8" 
          description="Live on site"
        />
        <StatsCard 
          title="Drafts" 
          value="4" 
          description="In progress"
        />
      </div>
    </div>
  );
}

/**
 * Example: Reusable Stats Card Component
 * Uses Puck's Button for actions
 */
function StatsCard({ 
  title, 
  value, 
  description,
}: { 
  title: string; 
  value: string; 
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>
    </div>
  );
}

/**
 * Example: Form Page with Puck Components
 */
export async function CreatePageForm() {
  await requireAuth({ requireInvitation: true });

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Page</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to create a new page
          </p>
        </div>

        <form className="space-y-6">
          {/* Form fields here */}
          
          <ActionBar label="Form Actions">
            <ActionBar.Action onClick={() => {}}>
              <Button variant="primary" type="submit">
                Create page
              </Button>
            </ActionBar.Action>
            
            <ActionBar.Action onClick={() => {}}>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </ActionBar.Action>
            
            <ActionBar.Action onClick={() => {}}>
              <Button variant="secondary" type="button">
                Save as draft
              </Button>
            </ActionBar.Action>
          </ActionBar>
        </form>
      </div>
    </div>
  );
}

/**
 * Example: List Page with Bulk Actions
 */
export async function PagesList() {
  await requireAuth({ requireInvitation: true });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">All Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your pages
          </p>
        </div>
        
        <ActionBar label="Actions">
          <ActionBar.Action onClick={() => {}}>
            <Button 
              variant="primary" 
              icon={<Plus className="h-4 w-4" />}
            >
              Add new
            </Button>
          </ActionBar.Action>
          
          <ActionBar.Action onClick={() => {}}>
            <Button 
              variant="secondary" 
              icon={<Download className="h-4 w-4" />}
            >
              Bulk export
            </Button>
          </ActionBar.Action>
        </ActionBar>
      </div>

      {/* Table or list view here */}
    </div>
  );
}

/**
 * Example: Settings Page with IconButtons
 */
export async function SettingsPage() {
  await requireAuth({ requireInvitation: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your application settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Setting Item */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div>
            <h3 className="font-semibold text-foreground">Site Name</h3>
            <p className="text-sm text-muted-foreground">The name of your site</p>
          </div>
          <ActionBar label="Actions">
            <ActionBar.Action onClick={() => {}}>
              <IconButton type="button" title="Edit">
                <RefreshCw focusable="false" className="h-4 w-4" />
              </IconButton>
            </ActionBar.Action>
          </ActionBar>
        </div>

        {/* More setting items */}
      </div>
    </div>
  );
}
```