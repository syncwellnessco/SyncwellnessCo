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
  const featuredBlogs = blogs.filter(post => post.featured);
  
  if (featuredBlogs.length === 0) return null;

  return (
    <section className="bg-gold-muted/60 py-8 sm:py-16" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From the Blog"
          title={<>Wellness Insights & <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">Tips</span></>}
          description="Practical reads on hormones, nutrition, and living well — curated for women like you."
        />

        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBlogs.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="overflow-hidden rounded-2xl bg-cream shadow-sm"
            >
              <Link href={`/blog/${post.id}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {post.category}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-charcoal sm:text-xl">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sage-600">
                  {post.excerpt}
                </p>
              </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 text-center sm:mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-gold"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
