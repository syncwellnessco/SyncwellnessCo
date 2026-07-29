"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IMAGES } from "@/data/media";
import { faqs } from "@/data/faqs";

export function FAQSection() {
  const faqBackgroundSrc = IMAGES.shadowBackground;

  return (
    <section
      className="bg-cream bg-cover bg-center py-6 sm:py-10"
      id="faq"
      style={{ backgroundImage: `url(${faqBackgroundSrc})` }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-cream/88 px-4 py-7 shadow-lg shadow-charcoal/10 backdrop-blur-sm sm:px-8 sm:py-10">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Everything you need to know about working with SyncWellnessCo."
          />

          <Accordion type="single" collapsible className="mt-7 w-full sm:mt-10">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left font-display text-base sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-6 text-center text-xs text-charcoal sm:mt-8 sm:text-sm">
            Have more questions?{" "}
            <Link
              href="/faq"
              className="font-medium text-charcoal underline-offset-4 hover:underline"
            >
              View all FAQs
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-medium text-charcoal underline-offset-4 hover:underline"
            >
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
