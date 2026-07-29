"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/blog-card";

type BlogSectionProps = {
  blogs: BlogPost[];
};

export function BlogSection({ blogs }: BlogSectionProps) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="bg-[#EBE3DB] py-8 sm:py-12" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From the Blog"
          title={<>Wellness Insights & <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">Tips</span></>}
          description="Practical reads on hormones, nutrition, and living well, curated for women like you."
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {blogs.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="w-full flex"
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
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


