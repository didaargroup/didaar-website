import { requireAuth } from "@/lib/route-guard";
import { PagesTree } from "@/components/admin/pages-tree";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FormSection, HeadingSection } from "@/components/admin/form-layout";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="p-6 space-y-6 @container">
      <FormSection
        heading={
          <HeadingSection
            title="Pages Management"
            description="Actions related to site pages">
          </HeadingSection>
        }
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Create and manage your site pages
            </p>
          </div>
          <Button asChild variant="primary">
            <Link href="/admin/pages/create">Create Page</Link>
          </Button>
        </div>
      </FormSection>
      <FormSection heading={
          <HeadingSection
            title="Page Tree"
            description="Manage your site pages and content structure">
          </HeadingSection>
      }>
        <PagesTree />
      </FormSection>
    </div>
  );
}


