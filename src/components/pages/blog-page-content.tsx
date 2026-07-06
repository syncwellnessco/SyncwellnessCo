import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { getAllBlogPosts } from "@/lib/blogs";

export async function BlogPageContent() {
  const posts = await getAllBlogPosts({ publishedOnly: true });

  return (
    <>
      <article className="bg-cream">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
          <span className="mb-4 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
            Blog
          </span>
          <h1 className="font-display text-5xl lg:text-7xl font-normal text-charcoal mb-6 leading-tight">
            Wellness Insights & <br />
            <span className="italic text-[#8C6D40]">Tips.</span>
          </h1>
          <p className="mx-auto text-base lg:text-lg leading-relaxed text-charcoal/80 max-w-2xl">
            Practical reads on hormones, nutrition, and living well — curated for women like you.
          </p>
        </section>
      </article>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-none bg-[#FAF8F5] shadow-sm transition-transform hover:-translate-y-1"
              >
                {post.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
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
                  <span className="font-display italic text-[#8C6D40] text-[1.15rem]">
                    {post.category}
                  </span>
                </div>
                <Link 
                  href={`/blog/${post.id}`} 
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
