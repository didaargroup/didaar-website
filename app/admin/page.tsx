import { requireAuth } from "@/lib/route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableTree, PageTreeNode } from "@/components/admin/sortable-tree";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  // Protect this route - requires authentication and accepted invitation
  const { user } = await requireAuth({ requireInvitation: true });

  // Mock data for pages tree - this will be replaced with database data later
  const mockPages: PageTreeNode[] = [
    {
      id: "Home",
      title: "Home",
      slug: "/",
      children: [
        {
          id: "About Us",
          title: "About Us",
          slug: "/about",
        },
        {
          id: "Services",
          title: "Services",
          slug: "/services",
          children: [
            {
              id: "Web Development",
              title: "Web Development",
              slug: "/services/web-development",
            },
            {
              id: "Mobile Apps",
              title: "Mobile Apps",
              slug: "/services/mobile-apps",
            },
          ],
        },
      ],
    },
    {
      id: "Blog",
      title: "Blog",
      slug: "/blog",
      children: [
        {
          id: "Getting Started",
          title: "Getting Started",
          slug: "/blog/getting-started",
        },
        {
          id: "Advanced Features",
          title: "Advanced Features",
          slug: "/blog/advanced-features",
        },
      ],
    },
    {
      id: "Contact",
      title: "Contact",
      slug: "/contact",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pages
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your site pages and content structure
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </header>

      {/* Pages Tree Card */}
      <Card>
        <CardHeader>
          <CardTitle>Page Structure</CardTitle>
          <CardDescription>
            Drag and drop to reorder pages. Click the arrow to expand/collapse child pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SortableTree items={mockPages} />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">9</p>
            <p className="text-sm text-muted-foreground mt-1">
              Across all sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">7</p>
            <p className="text-sm text-muted-foreground mt-1">
              Live on the site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">2</p>
            <p className="text-sm text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}