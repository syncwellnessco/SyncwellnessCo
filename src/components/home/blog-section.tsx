"use client";

import Image from "next/image";
import Link from "@/components/ui/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BlogPost } from "@/types/blog";

type BlogSectionProps = {
  blogs: BlogPost[];
};

export function BlogSection({ blogs }: BlogSectionProps) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="bg-[#EBE3DB] py-6 sm:py-10" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From the Blog"
          title={<>Wellness Insights & <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">Tips</span></>}
          description="Practical reads on hormones, nutrition, and living well — curated for women like you."
        />

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {blogs.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
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
                      sizes="(max-width: 768px) 100vw, 25vw"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-5 text-center">
                  <h3 className="font-display text-lg lg:text-xl text-charcoal leading-tight mb-2 group-hover:text-[#8C6D40] transition-colors">
                    {post.title}
                  </h3>
                  <span className="font-display italic text-[#8C6D40] text-base">
                    {post.category}
                  </span>
                </div>
              </Link>
              <Link prefetch={false} 
                href={`/resources/blogs/${post.slug || post.id}`} 
                className="block w-full bg-[#8C6D40] py-3 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B8955F]"
              >
                Read More
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 text-center sm:mt-8">
          <Link
            href="/resources/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-gold"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
