import type { Program } from "@/types/program";

const now = new Date().toISOString();
const defaultVideo =
  "https://res.cloudinary.com/daw1tscqr/video/upload/v1780733233/female-hormone-specialist-certification-curriculum-papers_pm0ohz.mp4";

export const seedPrograms: Program[] = [
  {
    id: "hormone-harmony",
    title: "Hormone Harmony Framework",
    slug: "hormone-harmony",
    shortDescription: "Our signature comprehensive program is designed to balance hormones, optimize metabolism, improve sleep, manage stress, and restore vibrant energy through personalized protocols.",
    description: "Our signature comprehensive program is designed to balance hormones, optimize metabolism, improve sleep, manage stress, and restore vibrant energy through personalized protocols. Through weekly 1:1 sessions, you'll receive custom hormone-friendly meal plans, cycle-synced movement guidance, and practical lifestyle strategies that fit real life. This program helps you understand your body, balance hormones naturally, and build habits you can maintain long after coaching ends.",
    duration: "12 Weeks",
    format: "1:1 Coaching • Online",
    category: "Hormones",
    status: "published",
    featured: true,
    order: 1,
    pricing: {
      price: 599,
      currency: "USD",
      paymentType: "one-time",
      installmentAvailable: true,
      installmentText: "Payment plans available upon request",
    },
    hero: {
      headline: "Hormone Harmony Framework",
      subheadline: "Balance your hormones, optimize your metabolism, and reclaim your energy.",
      bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
      introVideo: defaultVideo,
      ctaText: "Join Program",
      ctaLink: "/contact",
    },
    audience: {
      designedFor: [
        "Balance their hormones naturally and sustainably",
        "Lose weight in a healthy, long-term way without restrictive dieting",
        "Improve metabolism and support healthy fat loss",
        "Build lean muscle through adequate protein intake and strategic movement",
        "Increase energy levels and reduce fatigue"
      ],
      notFor: [],
      idealClient: [],
    },
    problemsSolved: [
      "Hormone imbalance",
      "Weight gain",
      "Digestive issues",
      "Fatigue",
      "Poor sleep",
      "Stress",
      "Low energy",
      "Bloating"
    ],
    outcomes: {
      summary: "By the end of the 12-week Hormone Harmony Framework, you'll have the knowledge, tools, and personalized strategies to support balanced hormones, improved metabolism, better sleep, reduced stress, and increased energy. Many women experience improvements in digestion, mood, body composition, cycle health, and overall wellbeing while developing sustainable nutrition, movement, and lifestyle habits that support long-term health and vitality.",
      physical: [],
      mental: [],
      lifestyle: [],
      wellness: [],
    },
    included: [
      { title: "Weekly 1:1 online coaching sessions" },
      { title: "Custom hormone-friendly meal plans" },
      { title: "Cycle-synced fitness guidance" },
      { title: "Lab review & interpretation" },
      { title: "Sleep optimization protocols" },
      { title: "Stress management practices" },
      { title: "Guided meditation resources" },
      { title: "Personalized lifestyle recommendations" },
      { title: "Resource library access (while enrolled)" }
    ],
    bonuses: [
      { title: "Facial yoga & lymphatic drainage video series" },
      { title: "Gut cleanse program guide" },
      { title: "Protein calculation guide" },
      { title: "Perimenopause & menopause wellness guide" }
    ],
    structure: {
      weeks: [
        { week: "Weeks 1–2", title: "Assessment & Foundation", description: "Deep-dive health assessment, lab review, and personalised protocol design aligned to your cycle and lifestyle." },
        { week: "Weeks 3–5", title: "Nutrition & Metabolism", description: "Hormone-friendly meal plans, macro education, and metabolic support strategies tailored to your goals." },
        { week: "Weeks 6–8", title: "Gut Health & Energy", description: "Digestive optimisation, inflammation support, and energy-building routines that sustain you all day." },
        { week: "Weeks 9–12", title: "Integration & Mastery", description: "Stress resilience, sleep refinement, and a long-term maintenance framework so results last." }
      ],
      coachingSchedule: "Weekly 1:1 sessions",
      sessionFrequency: "Once a week",
      supportStructure: "Private messaging and portal",
    },
    methodology: {
      framework: "Functional Hormone Balance",
      process: "Integrates functional health principles with compassionate coaching.",
      whyItWorks: "Addresses hormones, gut health, metabolism, sleep, and stress as interconnected systems. Every protocol is personalised because no two women are the same.",
      scientificBasis: "Evidence-based functional nutrition",
    },
    faqs: [
      { question: "How does the program work?", answer: "You'll receive weekly 1:1 coaching calls, personalised meal plans, and ongoing support through our private platform. Each week builds on the last with clear action steps." },
      { question: "How soon will I see results?", answer: "Many clients notice improved energy and digestion within 2–3 weeks. Sustainable hormone balance and body composition changes typically develop over 8–12 weeks." },
      { question: "Is this fully online?", answer: "Yes — all coaching is delivered virtually, so you can participate from anywhere in the world on a schedule that works for you." },
      { question: "Do I need previous experience?", answer: "No prior coaching experience is needed. We meet you where you are and guide you step by step." }
    ],
    enrollment: {
      startDates: ["Rolling admission"],
      process: "Book a consultation call",
      applicationProcess: "Complete intake form prior to call",
      paymentPlans: "Available upon request",
    },
    testimonials: [],
    media: {
      bannerImages: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"],
      gallery: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop"],
      videos: [defaultVideo],
      pdfs: [],
      resources: [],
    },
    seo: {
      metaTitle: "Hormone Harmony Framework | SyncwellnessCo",
      metaDescription: "Our signature comprehensive program to balance hormones, optimize metabolism, and restore vibrant energy.",
      keywords: ["hormones", "wellness", "coach"],
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "gut-cleanse",
    title: "Gut Cleanse Program",
    slug: "gut-cleanse",
    shortDescription: "Heal your gut, reduce bloating, and restore digestive harmony with evidence-based protocols tailored to your unique microbiome needs.",
    description: "Heal your gut, reduce bloating, and restore digestive harmony with evidence-based protocols tailored to your unique microbiome needs. A focused 2-week gut healing experience with elimination guidance, supplement recommendations, and daily support. This program gives you a clear, step-by-step protocol to identify triggers, reduce inflammation, and rebuild digestive health.",
    duration: "2 Weeks",
    format: "Guided Program • Online",
    category: "Gut Health",
    status: "published",
    featured: false,
    order: 2,
    pricing: {
      price: 149,
      currency: "USD",
      paymentType: "one-time",
      installmentAvailable: false,
    },
    hero: {
      headline: "Gut Cleanse Program",
      subheadline: "Heal your gut, reduce bloating, and restore digestive harmony.",
      bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
      introVideo: defaultVideo,
      ctaText: "Join Program",
      ctaLink: "/contact",
    },
    audience: {
      designedFor: [
        "Bloating, gas, or digestive discomfort",
        "Acid reflux, acidity, or indigestion",
        "Constipation, diarrhea, or irregular bowel movements"
      ],
      notFor: [],
      idealClient: [],
    },
    problemsSolved: [
      "Bloating",
      "Digestive discomfort",
      "Food sensitivities",
      "Fatigue",
      "Brain fog",
      "Acne",
      "Sugar cravings",
      "Irregular cycles"
    ],
    outcomes: {
      summary: "By the end of this 2-week Gut Cleanse Program, you'll gain a clearer understanding of your digestive health and receive a personalized roadmap to support long-term gut wellness. Many women experience reduced bloating and digestive discomfort, improved bowel regularity, increased energy, better mental clarity, fewer food sensitivities, improved skin health, and enhanced overall wellbeing. Through targeted nutrition, lifestyle strategies, and gut-supportive protocols, you'll build a strong foundation for healthier digestion, balanced hormones, improved metabolism, and sustainable wellness.",
      physical: [],
      mental: [],
      lifestyle: [],
      wellness: [],
    },
    included: [
      { title: "Gut healing protocol" },
      { title: "Elimination & reintroduction guide" },
      { title: "Supplement recommendations" },
      { title: "Weekly check-ins" },
      { title: "Recipe collection" },
      { title: "Daily health tracking" }
    ],
    bonuses: [],
    structure: {
      weeks: [
        { week: "Week 1", title: "Cleanse & Reset", description: "Begin the gut healing protocol with targeted nutrition and elimination of common triggers." },
        { week: "Week 2", title: "Reintroduction & Roadmap", description: "Guided reintroduction phase and a personalised long-term gut wellness plan." }
      ],
      coachingSchedule: "Weekly check-ins",
      sessionFrequency: "1 check-in per week",
      supportStructure: "Online platform",
    },
    methodology: {
      framework: "Gut Healing Protocol",
      process: "Elimination, Support, Reintroduction.",
      whyItWorks: "Reduces inflammation and identifies root triggers.",
      scientificBasis: "Microbiome science",
    },
    faqs: [
      { question: "Is this suitable if I suspect SIBO?", answer: "The protocol is designed to support general gut healing. If you have a diagnosed condition, we'll adapt recommendations accordingly during your check-ins." },
      { question: "Will I be hungry on this program?", answer: "No — you'll enjoy nourishing, satisfying meals from our recipe collection designed to support healing without deprivation." }
    ],
    enrollment: {
      startDates: ["Start anytime"],
      process: "Direct purchase",
      applicationProcess: "N/A",
      paymentPlans: "N/A",
    },
    testimonials: [],
    media: {
      bannerImages: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"],
      gallery: [],
      videos: [defaultVideo],
      pdfs: [],
      resources: [],
    },
    seo: {
      metaTitle: "Gut Cleanse Program | SyncwellnessCo",
      metaDescription: "Heal your gut, reduce bloating, and restore digestive harmony.",
      keywords: ["gut health", "digestion", "cleanse"],
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "metabolic-kickstarter",
    title: "4-Week Metabolic Fat Loss Kickstarter",
    slug: "metabolic-kickstarter",
    shortDescription: "Jumpstart sustainable fat loss with metabolic reset strategies that work with your hormones—not against them.",
    description: "Jumpstart sustainable fat loss with metabolic reset strategies that work with your hormones—not against them. This 4-week guided program is designed to help you build healthier habits, improve energy levels, and support sustainable fat loss through nutrition, movement, and accountability. You'll receive structured weekly guidance, personalised meal templates, and coaching support to keep you on track. This program teaches you how to work with your hormones for lasting results — no crash diets or extreme restrictions.",
    duration: "4 Weeks",
    format: "Guided Program • Online",
    category: "Fat Loss",
    status: "published",
    featured: false,
    order: 3,
    pricing: {
      price: 249,
      currency: "USD",
      paymentType: "one-time",
      installmentAvailable: false,
    },
    hero: {
      headline: "4-Week Metabolic Fat Loss Kickstarter",
      subheadline: "Jumpstart sustainable fat loss with metabolic reset strategies.",
      bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
      introVideo: defaultVideo,
      ctaText: "Join Program",
      ctaLink: "/contact",
    },
    audience: {
      designedFor: [
        "Lose body fat sustainably",
        "Improve energy and metabolism",
        "Create healthy habits that last",
        "Feel more confident in their body",
        "Learn how to work with their hormones, not against them"
      ],
      notFor: [],
      idealClient: [],
    },
    problemsSolved: [
      "Stubborn weight",
      "Low metabolism",
      "Sugar cravings",
      "Low energy",
      "Hormone resistance",
      "Poor habits"
    ],
    outcomes: {
      summary: "By the end of this 4-week Metabolic Fat Loss Kickstarter, you'll have the tools, knowledge, and confidence to support sustainable fat loss while working in harmony with your hormones. You'll establish healthier nutrition and movement habits, improve energy levels, boost metabolic function, reduce cravings, and develop a personalized approach to maintaining results long-term. Most importantly, you'll create a strong foundation for lasting health, body confidence, and continued progress beyond the program.",
      physical: [],
      mental: [],
      lifestyle: [],
      wellness: [],
    },
    included: [
      { title: "Structured Weekly Guidance" },
      { title: "Personalized Meal Plan & Recipe Booklet" },
      { title: "Macros Calculation Guide (Protein, Carbohydrates & Fats)" },
      { title: "Weekly Check-Ins & Progress Support" },
      { title: "Daily Habit & Wellness Tracker" },
      { title: "Accountability, Motivation & Coaching Support" },
      { title: "Guided Movement & Workout Plans" },
      { title: "Sustainable Fat Loss & Metabolism Education" },
      { title: "Healthy Habit-Building Strategies for Long-Term Success" }
    ],
    bonuses: [],
    structure: {
      weeks: [
        { week: "Week 1", title: "Metabolic Reset", description: "Foundation nutrition, macro setup, and habit tracking begins." },
        { week: "Week 2", title: "Momentum & Movement", description: "Introduce guided workouts and refine your personalised meal plan." },
        { week: "Week 3", title: "Optimisation", description: "Fine-tune strategies based on progress and energy patterns." },
        { week: "Week 4", title: "Sustain & Transition", description: "Lock in habits and receive your long-term maintenance plan." }
      ],
      coachingSchedule: "Weekly check-ins",
      sessionFrequency: "1 check-in per week",
      supportStructure: "Online platform",
    },
    methodology: {
      framework: "Metabolic Reset",
      process: "Hormone-friendly nutrition, adequate protein, strategic movement, and accountability.",
      whyItWorks: "Creates a metabolic reset that supports fat loss without extreme restriction.",
      scientificBasis: "Metabolic science",
    },
    faqs: [
      { question: "Do I need a gym membership?", answer: "No — workout plans are designed for home or gym and adapt to your equipment and schedule." },
      { question: "Can I continue after 4 weeks?", answer: "Absolutely. Many clients transition into the Hormone Harmony Framework for deeper, long-term support." }
    ],
    enrollment: {
      startDates: ["Start anytime"],
      process: "Direct purchase",
      applicationProcess: "N/A",
      paymentPlans: "N/A",
    },
    testimonials: [],
    media: {
      bannerImages: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"],
      gallery: [],
      videos: [defaultVideo],
      pdfs: [],
      resources: [],
    },
    seo: {
      metaTitle: "4-Week Metabolic Fat Loss Kickstarter | SyncwellnessCo",
      metaDescription: "Jumpstart sustainable fat loss with metabolic reset strategies.",
      keywords: ["fat loss", "metabolism", "weight loss"],
    },
    createdAt: now,
    updatedAt: now,
  },
];
