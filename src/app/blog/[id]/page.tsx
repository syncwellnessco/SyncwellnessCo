import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BlogDetailContent } from "@/components/pages/blog-detail-content";
import { getAllBlogPosts } from "@/lib/blogs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllBlogPosts({ publishedOnly: true });
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const posts = await getAllBlogPosts();
  const post = posts.find((p) => p.id === id);

  return {
    title: post?.title ?? "Blog",
    description: post?.excerpt,
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <BlogDetailContent id={id} />
    </PageShell>
  );
}
