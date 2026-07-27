"use client";

import Image from "next/image";
import Link from "next/link";
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
          description="Practical reads on hormones, nutrition, and living well, curated for women like you."
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {blogs.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="w-full flex"
            >
              <article className="flex flex-col overflow-hidden bg-[#FAF8F5] border border-[#EBE3DB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md w-full">
                <Link href={`/resources/blogs/${post.slug || post.id}`} className="group flex-1 flex flex-col">
                  {post.image ? (
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-[#EBE3DB]">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] bg-sage-50 border-b border-[#EBE3DB]" />
                  )}
                  <div className="p-3 sm:p-4 flex flex-1 flex-col items-center justify-between text-center min-h-[110px] sm:min-h-[130px]">
                    <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-charcoal leading-snug line-clamp-3 group-hover:text-[#8C6D40] transition-colors">
                      {post.title}
                    </h3>
                    {post.category && (
                      <span className="font-display italic text-[#8C6D40] text-sm sm:text-base font-semibold mt-2.5">
                        {post.category}
                      </span>
                    )}
                  </div>
                </Link>
                <Link 
                  href={`/resources/blogs/${post.slug || post.id}`} 
                  className="block w-full bg-[#8C6D40] py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B8955F]"
                >
                  Read More
                </Link>
              </article>
            </motion.div>
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
