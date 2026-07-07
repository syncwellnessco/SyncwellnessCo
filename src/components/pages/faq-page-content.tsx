import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "@/components/ui/link";
import { PageHero } from "@/components/layout/page-hero";
import { faqs } from "@/data/faqs";

export function FAQPageContent() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Everything you need to know about working with SyncWellnessCo."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left font-display text-base sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-sm text-charcoal">
            Still have questions?{" "}
            <Link
              href="/contact"
              className="font-medium text-charcoal underline-offset-4 hover:underline"
            >
              Contact us
            </Link>{" "}
            or{" "}
            <Link
              href="/programs"
              className="font-medium text-charcoal underline-offset-4 hover:underline"
            >
              explore our programs
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
