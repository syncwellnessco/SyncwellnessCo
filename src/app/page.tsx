import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StrugglesSection } from "@/components/home/struggles-section";
import { HowWeHelpSection } from "@/components/home/how-we-help-section";
import dynamic from 'next/dynamic';

const ProgramsSection = dynamic(() => import("@/components/home/programs-section").then(mod => mod.ProgramsSection));
const AboutCoachSection = dynamic(() => import("@/components/home/about-coach-section").then(mod => mod.AboutCoachSection));
const TestimonialsSection = dynamic(() => import("@/components/home/testimonials-section").then(mod => mod.TestimonialsSection), { ssr: false });
const VideoTestimonialsSection = dynamic(() => import("@/components/home/video-testimonials-section").then(mod => mod.VideoTestimonialsSection), { ssr: false });
const BlogSection = dynamic(() => import("@/components/home/blog-section").then(mod => mod.BlogSection));
const FreeResourceSection = dynamic(() => import("@/components/home/free-resource-section").then(mod => mod.FreeResourceSection));
const FAQSection = dynamic(() => import("@/components/home/faq-section").then(mod => mod.FAQSection));
const FinalCTASection = dynamic(() => import("@/components/home/final-cta-section").then(mod => mod.FinalCTASection));

import { getAllBlogPosts } from "@/lib/blogs";
import { getAllPrograms } from "@/lib/programs";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const blogs = await getAllBlogPosts({ publishedOnly: true });
  const latestBlogs = blogs.slice(0, 4);

  const allPrograms = await getAllPrograms({ publishedOnly: true });

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StrugglesSection />
        <HowWeHelpSection />
        <ProgramsSection programs={allPrograms} />
        <AboutCoachSection />
        <TestimonialsSection />
        <VideoTestimonialsSection />
        <BlogSection blogs={latestBlogs} />
        <FreeResourceSection />
        <FinalCTASection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
