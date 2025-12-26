import { requireAuth } from "@/lib/route-guard";
import { getPagesTree } from "@/lib/page";
import { PagesTree } from "./pages-tree";

export default async function DashboardPage() {
  await requireAuth({ requireInvitation: true });
  const pagesTree = await getPagesTree();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your site pages and content structure</p>
      </div>
      <PagesTree initialItems={pagesTree} />
    </div>
  );
}