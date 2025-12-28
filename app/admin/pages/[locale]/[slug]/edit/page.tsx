import { requireAuth } from "@/lib/route-guard";
import { getPageBySlug, getPageContent, getPagesTree } from "@/lib/page";
import { notFound } from "next/navigation";
import Editor from "./editor";

interface EditorPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { user } = await requireAuth({ requireInvitation: true });

  // In Next.js 15+, params is a Promise that needs to be awaited
  const { locale, slug } = await params;

  // Get page by slug
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Get page content for the specific locale
  const pageContent = await getPageContent(page.id, locale);

  // Get all pages for the internal link selector
  const pagesTree = await getPagesTree();

  return (
    <Editor
      pageId={page.id}
      locale={locale}
      initialTitle={pageContent.title}
      initialContent={pageContent.content}
      initialPublished={pageContent.published}
      initialIsDraft={page.isDraft}
      pagesTree={pagesTree}
    />
  );
}