import { requireAuth } from "@/lib/route-guard";
import { PagesTree } from "./pages-tree";
import { ReactNode } from "react";
import { Button } from "@/components/admin/ui/button";
import Link from "next/link";



export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="p-6 space-y-6">
      <FormSection
        heading={
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Page Actions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create new pages to build your site's content
            </p>
          </>
        }
      >
        <div className="flex justify-end">

        <Button asChild variant="primary">
          <Link href="/admin/pages/create">
            Create Page
          </Link>
        </Button>
        </div>
      </FormSection>
      <FormSection
        heading={
          <>
            <h1 className="text-xl font-semibold text-foreground">Page Tree</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your site pages and content structure
            </p>
          </>
        }
      >
        <PagesTree />
      </FormSection>
    </div>
  );
}

const FormSection = ({
  heading,
  children,
}: {
  heading: ReactNode;
  children: React.ReactNode;
}) => (
  <>
    <section
      className="md:grid border p-6 rounded-lg bg-white/80"
      style={{ gridTemplateColumns: "1fr 3fr", gap: "2rem" }}
    >
      <div>{heading}</div>
      {children}
    </section>
  </>
);
