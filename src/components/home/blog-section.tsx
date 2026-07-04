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
    <section className="bg-[#EBE3DB] py-20 lg:py-32" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From the Blog"
          title={<>Wellness Insights & <span className="box-decoration-clone bg-[#B38C50] px-2 py-0.5 text-cream">Tips</span></>}
          description="Practical reads on hormones, nutrition, and living well — curated for women like you."
        />

        <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBlogs.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex flex-col overflow-hidden rounded-none bg-[#FAF8F5] shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
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
