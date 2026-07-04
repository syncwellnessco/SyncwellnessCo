import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero } from "@/components/layout/page-hero";
import { getBlogPost } from "@/lib/blogs";

type BlogDetailContentProps = {
  id: string;
};

export async function BlogDetailContent({ id }: BlogDetailContentProps) {
  const post = await getBlogPost(id);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} description={post.excerpt} />

      <article className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {post.image && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="768px"
                priority
              />
            </div>
          )}
          <p className="text-sm text-sage-500">By {post.author}</p>
          <div className="prose prose-sage mt-6 max-w-none">
            {post.content.split("\n\n").map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mb-4 text-base leading-relaxed text-sage-700"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-10 inline-block text-sm font-semibold text-charcoal hover:text-gold"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}
