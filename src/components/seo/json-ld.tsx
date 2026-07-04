import { siteConfig } from "@/data/site";

export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: siteConfig.name,
    description:
      "Certified Women's Health Coach specializing in hormone balance, gut health, and sustainable fat loss for women.",
    url: "https://syncwellnessco.com",
    email: siteConfig.email,
    openingHours: siteConfig.businessHours,
    areaServed: "Worldwide",
    priceRange: "$$",
    knowsAbout: siteConfig.seoKeywords,
    sameAs: Object.values(siteConfig.social),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
