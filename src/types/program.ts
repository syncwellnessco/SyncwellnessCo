export interface Program {
  id: string;

  // --------------------------
  // BASIC INFORMATION
  // --------------------------
  title: string;
  slug: string;
  shortDescription: string;
  description: string;

  duration: string; // "12 Weeks"
  format: string; // "1:1 Online"
  category: string; // Hormones, Gut Health, Fat Loss

  status: "draft" | "published";
  featured: boolean;
  showOnHome?: boolean;
  featured_rank?: number;

  // --------------------------
  // PRICING
  // --------------------------
  pricing: {
    price: number;
    currency: string;
    salePrice?: number;
    requireConsultant?: boolean;

    paymentType: "one-time" | "subscription" | "custom";

    installmentAvailable: boolean;
    installmentText?: string;
  };

  // --------------------------
  // HERO
  // --------------------------
  hero: {
    headline?: string;
    subheadline?: string;
    bannerImage: string;
    introVideo?: string;
    ctaText: string;
    ctaLink: string;
  };

  // --------------------------
  // TARGET AUDIENCE
  // --------------------------
  audience: {
    designedFor: string[];
    notFor: string[];
    idealClient: string[];
  };

  // --------------------------
  // PROBLEMS SOLVED
  // --------------------------
  problemsSolved: string[];

  // --------------------------
  // BENEFITS / OUTCOMES
  // --------------------------
  outcomes: {
    summary: string;
    physical: string[];
    mental: string[];
    lifestyle: string[];
    wellness: string[];
  };

  // --------------------------
  // WHAT'S INCLUDED
  // --------------------------
  included: {
    title: string;
    description?: string;
    icon?: string;
  }[];

  // --------------------------
  // BONUSES
  // --------------------------
  bonuses: {
    title: string;
    description?: string;
  }[];

  // --------------------------
  // PROGRAM STRUCTURE
  // --------------------------
  structure: {
    weeks: {
      week: string;
      title: string;
      description: string;
    }[];
    coachingSchedule: string;
    sessionFrequency: string;
    supportStructure: string;
  };

  // --------------------------
  // METHODOLOGY
  // --------------------------
  methodology: {
    framework: string;
    process: string;
    whyItWorks: string;
    scientificBasis: string;
  };

  // --------------------------
  // FAQ
  // --------------------------
  faqs: {
    question: string;
    answer: string;
  }[];

  // --------------------------
  // ENROLLMENT
  // --------------------------
  enrollment: {
    startDates: string[];
    process: string;
    applicationProcess: string;
    paymentPlans: string;
  };

  // --------------------------
  // QUIZ (Optional)
  // --------------------------
  quiz?: {
    enabled: boolean;
    title: string;
    description?: string;
    quizLink?: string;
  };

  // --------------------------
  // SEO
  // --------------------------
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  // --------------------------
  // TIMESTAMPS
  // --------------------------
  createdAt: string;
  updatedAt: string;
}
