import Image from "next/image";
import Link from "@/components/ui/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { getAllBlogPosts } from "@/lib/blogs";

export async function BlogPageContent() {
  const posts = await getAllBlogPosts({ publishedOnly: true });

  return (
    <>
      <article className="bg-cream">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 pb-4 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
            Blog
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-normal text-charcoal mb-4 leading-tight">
            Wellness Insights & <span className="italic text-[#8C6D40]">Tips.</span>
          </h1>
          <p className="mx-auto text-sm lg:text-base leading-relaxed text-charcoal/80 max-w-2xl">
            Practical reads on hormones, nutrition, and living well — curated for women like you.
          </p>
        </section>
      </article>

      <section className="pb-12 sm:pb-16 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-none bg-[#FAF8F5] shadow-sm transition-transform"
              >
                <Link prefetch={false} href={`/resources/blogs/${post.slug || post.id}`} className="group flex-1 flex flex-col">
                  {post.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 text-center">
                    <h3 className="font-display text-2xl lg:text-[1.65rem] text-charcoal leading-tight mb-4 group-hover:text-[#8C6D40] transition-colors">
                      {post.title}
                    </h3>
                    <span className="font-display italic text-[#8C6D40] text-[1.15rem]">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <Link prefetch={false} 
                  href={`/resources/blogs/${post.slug || post.id}`} 
                  className="block w-full bg-[#8C6D40] py-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B8955F]"
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
