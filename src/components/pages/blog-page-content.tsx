import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { getAllBlogPosts } from "@/lib/blogs";

export async function BlogPageContent() {
  const posts = await getAllBlogPosts({ publishedOnly: true });

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Wellness Insights & Tips"
        description="Practical reads on hormones, nutrition, and living well — curated for women like you."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-beige-200 bg-cream shadow-sm transition-shadow hover:shadow-md"
              >
                {post.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {post.category}
                  </span>
                  <h2 className="mt-2 font-display text-xl font-semibold text-charcoal">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-sage-600">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
