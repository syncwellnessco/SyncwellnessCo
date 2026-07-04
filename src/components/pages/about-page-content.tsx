import Image from "next/image";
import { Check } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutContent, brandContent } from "@/data/about-content";
import { siteConfig } from "@/data/site";

export function AboutPageContent() {
  const coachImageSrc = "/neha_arora_coach.png";

  return (
    <>
      <PageHero
        eyebrow="About"
        title={`Meet ${siteConfig.founder}`}
        description={siteConfig.founderTagline}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-beige-200">
              <Image
                src={coachImageSrc}
                alt={`${siteConfig.founder} — ${siteConfig.founderTitle}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div>
              <SectionHeading
                eyebrow="My Story"
                title="From Personal Struggle to Professional Calling"
                align="left"
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-sage-700 sm:text-base">
                {aboutContent.story.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-6 space-y-2">
                {aboutContent.certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-start gap-2 text-sm text-sage-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-beige-100/50 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why I Help Women"
            title="A Unique Approach for Unique Journeys"
            description={aboutContent.whyIHelpWomen}
          />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Coaching Philosophy"
            title="Education, Empowerment & Consistency"
            description={aboutContent.coachingPhilosophy}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {aboutContent.approachDifferentiators.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl border border-beige-200 bg-cream p-4 text-sm text-sage-700"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sage-900 py-12 text-cream sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Brand Vision"
            title="Empowering Women at Every Stage"
            description={brandContent.vision}
            className="[&_h2]:text-cream [&_p]:text-cream/75 [&_span]:text-gold"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandContent.coreValues.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-cream/10 bg-cream/5 p-5"
              >
                <h3 className="font-display text-lg font-semibold text-cream">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
