import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BlogPageContent } from "@/components/pages/blog-page-content";
import { getAllBlogPosts } from "@/lib/blogs";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog",
  description: "Wellness insights on hormones, gut health, and sustainable nutrition.",
};

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts({ publishedOnly: true });
  const posts = allPosts.filter(p => p.category !== "Podcast" && p.category !== "News Article");

  return (
    <PageShell noPadding>
      <BlogPageContent initialPosts={posts} />
    </PageShell>
  );
}
