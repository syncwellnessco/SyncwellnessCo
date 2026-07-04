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
          <div className="grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-none bg-[#FAF8F5] shadow-sm transition-transform hover:-translate-y-1"
              >
                {post.image && (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 text-center">
                  <h3 className="font-display text-2xl lg:text-[1.65rem] text-charcoal leading-tight mb-4">
                    {post.title}
                  </h3>
                  <span className="font-display italic text-[#B8955F] text-[1.15rem]">
                    {post.category}
                  </span>
                </div>
                <Link 
                  href={`/blog/${post.id}`} 
                  className="block w-full bg-[#B8955F] py-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#967246]"
                >
                  Read More
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
