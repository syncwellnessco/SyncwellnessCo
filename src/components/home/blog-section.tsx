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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
          {blogs.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="w-full flex"
            >
              <Link 
                href={`/resources/blogs/${post.slug || post.id}`}
                className="group flex flex-col w-full bg-white border border-[#EBE3DB] hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {post.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-[#EBE3DB]">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] bg-sage-50 border-b border-[#EBE3DB]" />
                )}
                <div className="p-3 md:p-5 flex flex-col flex-1 space-y-2 text-left">
                  <span className="text-[#8C6D40] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em]">
                    {post.category}
                  </span>
                  <h3 className="font-display text-xs sm:text-sm md:text-base text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
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
