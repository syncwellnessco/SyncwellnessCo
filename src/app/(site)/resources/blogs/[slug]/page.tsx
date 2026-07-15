import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { BlogDetailContent } from "@/components/pages/blog-detail-content";
import { getAllBlogPosts } from "@/lib/blogs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getAllBlogPosts();
  const post = posts.find((p) => (p.slug || p.id) === slug);

  return {
    title: post?.title ?? "Blog",
    description: post?.excerpt,
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const posts = await getAllBlogPosts();
  const post = posts.find((p) => (p.slug || p.id) === slug);

  if (post && (post.category === "Podcast" || post.category === "News Article")) {
    if (post.content && (post.content.startsWith("http://") || post.content.startsWith("https://"))) {
      redirect(post.content);
    }
  }

  return (
    <PageShell>
      <BlogDetailContent slug={slug} />
    </PageShell>
  );
}
