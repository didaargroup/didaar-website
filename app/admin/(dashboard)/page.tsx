import { requireAuth } from "@/lib/route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPagesTree, getPageStats } from "@/lib/page";
import { PagesTree } from "./pages-tree";

export default async function DashboardPage() {
  // Protect this route - requires authentication and accepted invitation
  const { user } = await requireAuth({ requireInvitation: true });

  // Get real data from database
  const pagesTree = await getPagesTree();
  const stats = await getPageStats();

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

        <div className="flex space-x-2">
        <Button asChild variant="outline">
          <Link href="/admin/pages/create">
          <Plus className="h-4 w-4 mr-2" />
          New Page
          </Link>
        </Button>
        </div>
      </header>

      {/* Pages Tree Card */}
      <PagesTree initialItems={pagesTree} />

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
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
            <p className="text-3xl font-bold text-foreground">{stats.published}</p>
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
            <p className="text-3xl font-bold text-foreground">{stats.drafts}</p>
            <p className="text-sm text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}