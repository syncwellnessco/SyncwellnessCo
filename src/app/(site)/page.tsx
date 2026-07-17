import { HeroSection } from "@/components/home/hero-section";
import { StrugglesSection } from "@/components/home/struggles-section";
import { HowWeHelpSection } from "@/components/home/how-we-help-section";
import nextDynamic from 'next/dynamic';

const ProgramsSection = nextDynamic(() => import("@/components/home/programs-section").then(mod => mod.ProgramsSection));
const AboutCoachSection = nextDynamic(() => import("@/components/home/about-coach-section").then(mod => mod.AboutCoachSection));
const OneToOneCallSection = nextDynamic(() => import("@/components/home/one-to-one-call-section").then(mod => mod.OneToOneCallSection));
const TestimonialsSection = nextDynamic(() => import("@/components/home/testimonials-section").then(mod => mod.TestimonialsSection));
const VideoTestimonialsSection = nextDynamic(() => import("@/components/home/video-testimonials-section").then(mod => mod.VideoTestimonialsSection));
const BlogSection = nextDynamic(() => import("@/components/home/blog-section").then(mod => mod.BlogSection));
const FreeResourceSection = nextDynamic(() => import("@/components/home/free-resource-section").then(mod => mod.FreeResourceSection));
const FAQSection = nextDynamic(() => import("@/components/home/faq-section").then(mod => mod.FAQSection));
const FinalCTASection = nextDynamic(() => import("@/components/home/final-cta-section").then(mod => mod.FinalCTASection));

import { getAllBlogPosts } from "@/lib/blogs";
import { getAllPrograms } from "@/lib/programs";

export const revalidate = 60;

export default async function HomePage() {
  const blogs = await getAllBlogPosts({ publishedOnly: true });
  const latestBlogs = blogs.filter(post => post.category !== "Podcast" && post.category !== "News Article").slice(0, 2);

  const allPrograms = await getAllPrograms({ publishedOnly: true });

  return (
    <main>
      <HeroSection />
      <StrugglesSection />
      <HowWeHelpSection />
      <ProgramsSection programs={allPrograms} />
      <AboutCoachSection />
      <OneToOneCallSection />
      <TestimonialsSection />
      <VideoTestimonialsSection />
      <BlogSection blogs={latestBlogs} />
      <FreeResourceSection />
      <FinalCTASection />
      <FAQSection />
    </main>
  );
}
