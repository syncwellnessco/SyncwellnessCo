import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StrugglesSection } from "@/components/home/struggles-section";
import { HowWeHelpSection } from "@/components/home/how-we-help-section";
import { ProgramsSection } from "@/components/home/programs-section";
import { AboutCoachSection } from "@/components/home/about-coach-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { VideoTestimonialsSection } from "@/components/home/video-testimonials-section";
import { BlogSection } from "@/components/home/blog-section";
import { FreeResourceSection } from "@/components/home/free-resource-section";
import { FAQSection } from "@/components/home/faq-section";
import { FinalCTASection } from "@/components/home/final-cta-section";

import { getBlogPosts } from "@/lib/content-store";
import { seedBlogs } from "@/data/seed-blogs";

export default async function HomePage() {
  let blogs = await getBlogPosts();
  if (!blogs || blogs.length === 0) {
    blogs = seedBlogs;
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StrugglesSection />
        <HowWeHelpSection />
        <ProgramsSection />
        <AboutCoachSection />
        <TestimonialsSection />
        <VideoTestimonialsSection />
        <BlogSection blogs={blogs} />
        <FreeResourceSection />
        <FinalCTASection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
