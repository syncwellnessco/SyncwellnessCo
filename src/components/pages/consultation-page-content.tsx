import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";

export function ConsultationPageContent() {
  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Book Your Free Discovery Call"
        description="Limited spots available each month. Let's discuss your health goals and find the right program for you."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-100">
            <Calendar className="h-8 w-8 text-sage-600" />
          </div>
          <SectionHeading
            eyebrow="Next Step"
            title="Your Health Transformation Starts Here"
            description={`Connect with ${siteConfig.founder} for a complimentary discovery call. We'll explore your goals, answer your questions, and determine the best path forward — with no obligation.`}
          />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a href={`mailto:${siteConfig.email}?subject=Free Discovery Call`}>
                Book Free Call
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/programs">View Programs</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-sage-500">
            Available {siteConfig.businessHours}
          </p>
        </div>
      </section>
    </>
  );
}
