import type { Program } from "@/types/program";

const now = new Date().toISOString();

const defaultVideo =
  "https://res.cloudinary.com/daw1tscqr/video/upload/v1780733233/female-hormone-specialist-certification-curriculum-papers_pm0ohz.mp4";

export const seedPrograms: Program[] = [
  {
    id: "hormone-harmony",
    name: "Hormone Harmony Framework",
    duration: "12 Weeks",
    format: "1:1 Coaching • Online",
    description:
      "Our signature comprehensive program designed to balance hormones, optimize metabolism, improve sleep, manage stress, and restore vibrant energy through personalized protocols.",
    overview:
      "The Hormone Harmony Framework is a personalised 12-week coaching experience built for busy women who want sustainable results — not another restrictive diet.",
    overviewParagraphs: [
      "Through weekly 1:1 sessions, you'll receive custom hormone-friendly meal plans, cycle-synced movement guidance, and practical lifestyle strategies that fit real life.",
      "This program helps you understand your body, balance hormones naturally, and build habits you can maintain long after coaching ends.",
    ],
    stats: [
      "12 Weeks",
      "1:1 Coaching",
      "Custom Meal Plan",
      "Weekly Calls",
      "Evidence Based",
      "Online",
    ],
    problems: [
      "Hormone imbalance",
      "Weight gain",
      "Stress",
      "Poor sleep",
      "Fatigue",
      "Digestion",
      "PMS",
      "Acne",
      "Bloating",
      "Low energy",
    ],
    features: [
      "Weekly 1:1 online coaching sessions",
      "Custom hormone-friendly meal plans",
      "Cycle-synced fitness guidance",
      "Lab review & interpretation",
      "Sleep optimization protocols",
      "Stress management practices",
      "Guided meditation resources",
      "Personalized lifestyle recommendations",
      "Resource library access (while enrolled)",
    ],
    bonuses: [
      "Facial yoga & lymphatic drainage video series",
      "Gut cleanse program guide",
      "Protein calculation guide",
      "Perimenopause & menopause wellness guide",
    ],
    perfectFor: [
      "Balance hormones naturally and sustainably",
      "Lose weight without restrictive dieting",
      "Improve metabolism and support healthy fat loss",
      "Increase energy and reduce fatigue",
      "Improve sleep and manage daily stress",
      "Navigate perimenopause and menopause with confidence",
      "Create lasting lifestyle habits for lifelong wellness",
    ],
    timeline: [
      {
        label: "Weeks 1–2",
        title: "Assessment & Foundation",
        description:
          "Deep-dive health assessment, lab review, and personalised protocol design aligned to your cycle and lifestyle.",
      },
      {
        label: "Weeks 3–5",
        title: "Nutrition & Metabolism",
        description:
          "Hormone-friendly meal plans, macro education, and metabolic support strategies tailored to your goals.",
      },
      {
        label: "Weeks 6–8",
        title: "Gut Health & Energy",
        description:
          "Digestive optimisation, inflammation support, and energy-building routines that sustain you all day.",
      },
      {
        label: "Weeks 9–12",
        title: "Integration & Mastery",
        description:
          "Stress resilience, sleep refinement, and a long-term maintenance framework so results last.",
      },
    ],
    outcomes:
      "By the end of the 12-week Hormone Harmony Framework, you'll have the knowledge, tools, and personalized strategies to support balanced hormones, improved metabolism, better sleep, reduced stress, and increased energy. Many women experience improvements in digestion, mood, body composition, cycle health, and overall wellbeing.",
    methodology:
      "Our framework integrates functional health principles with compassionate coaching — addressing hormones, gut health, metabolism, sleep, and stress as interconnected systems. Every protocol is personalised because no two women are the same.",
    faqs: [
      {
        question: "How does the program work?",
        answer:
          "You'll receive weekly 1:1 coaching calls, personalised meal plans, and ongoing support through our private platform. Each week builds on the last with clear action steps.",
      },
      {
        question: "How soon will I see results?",
        answer:
          "Many clients notice improved energy and digestion within 2–3 weeks. Sustainable hormone balance and body composition changes typically develop over 8–12 weeks.",
      },
      {
        question: "Is this fully online?",
        answer:
          "Yes — all coaching is delivered virtually, so you can participate from anywhere in the world on a schedule that works for you.",
      },
      {
        question: "Do I need previous experience?",
        answer:
          "No prior coaching experience is needed. We meet you where you are and guide you step by step.",
      },
    ],
    gallery: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
        title: "Hormone-friendly nutrition",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
        title: "Mindful wellness",
      },
    ],
    featured: true,
    cta: "Book Discovery Call",
    secondaryCta: "View Curriculum",
    ctaLink: "/consultation",
    pricing: "Starting from $599",
    videoUrl: defaultVideo,
    trustLine: "Trusted by Women Worldwide",
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "gut-cleanse",
    name: "Gut Cleanse Program",
    duration: "2 Weeks",
    format: "Guided Program • Online",
    description:
      "Heal your gut, reduce bloating, and restore digestive harmony with evidence-based protocols tailored to your unique microbiome needs.",
    overview:
      "A focused 2-week gut healing experience with elimination guidance, supplement recommendations, and daily support.",
    overviewParagraphs: [
      "This program gives you a clear, step-by-step protocol to identify triggers, reduce inflammation, and rebuild digestive health.",
      "Perfect for women experiencing bloating, food sensitivities, fatigue, or skin flare-ups linked to gut imbalance.",
    ],
    stats: [
      "2 Weeks",
      "Gut Protocol",
      "Weekly Check-ins",
      "Recipe Collection",
      "Daily Tracking",
      "Online",
    ],
    problems: [
      "Bloating",
      "Digestive discomfort",
      "Food sensitivities",
      "Fatigue",
      "Brain fog",
      "Acne",
      "Sugar cravings",
      "Irregular cycles",
    ],
    features: [
      "Gut healing protocol",
      "Elimination & reintroduction guide",
      "Supplement recommendations",
      "Weekly check-ins",
      "Recipe collection",
      "Daily health tracking",
    ],
    perfectFor: [
      "Reduce bloating and digestive discomfort",
      "Identify food sensitivities safely",
      "Improve energy and mental clarity",
      "Support clearer skin and reduced inflammation",
      "Build a foundation for long-term gut wellness",
    ],
    timeline: [
      {
        label: "Week 1",
        title: "Cleanse & Reset",
        description:
          "Begin the gut healing protocol with targeted nutrition and elimination of common triggers.",
      },
      {
        label: "Week 2",
        title: "Reintroduction & Roadmap",
        description:
          "Guided reintroduction phase and a personalised long-term gut wellness plan.",
      },
    ],
    outcomes:
      "By the end of this 2-week Gut Cleanse Program, you'll gain a clearer understanding of your digestive health and receive a personalized roadmap to support long-term gut wellness. Many women experience reduced bloating, improved bowel regularity, increased energy, and better mental clarity.",
    faqs: [
      {
        question: "Is this suitable if I suspect SIBO?",
        answer:
          "The protocol is designed to support general gut healing. If you have a diagnosed condition, we'll adapt recommendations accordingly during your check-ins.",
      },
      {
        question: "Will I be hungry on this program?",
        answer:
          "No — you'll enjoy nourishing, satisfying meals from our recipe collection designed to support healing without deprivation.",
      },
    ],
    featured: false,
    cta: "Book Your Spot",
    secondaryCta: "View Curriculum",
    ctaLink: "/consultation",
    pricing: "Starting from $149",
    videoUrl: defaultVideo,
    trustLine: "Trusted by Women Worldwide",
    published: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "metabolic-kickstarter",
    name: "4-Week Metabolic Fat Loss Kickstarter",
    duration: "4 Weeks",
    format: "Guided Program • Online",
    description:
      "Jumpstart sustainable fat loss with metabolic reset strategies that work with your hormones — not against them.",
    overview:
      "A 4-week guided program to build healthier habits, improve energy, and support sustainable fat loss through nutrition, movement, and accountability.",
    overviewParagraphs: [
      "You'll receive structured weekly guidance, personalised meal templates, and coaching support to keep you on track.",
      "This program teaches you how to work with your hormones for lasting results — no crash diets or extreme restrictions.",
    ],
    stats: [
      "4 Weeks",
      "Meal Plans",
      "Macro Guide",
      "Weekly Check-ins",
      "Workout Plans",
      "Online",
    ],
    problems: [
      "Stubborn weight",
      "Low metabolism",
      "Sugar cravings",
      "Low energy",
      "Hormone resistance",
      "Poor habits",
    ],
    features: [
      "Structured weekly guidance",
      "Personalized meal plan & recipe booklet",
      "Macros calculation guide",
      "Weekly check-ins & progress support",
      "Daily habit & wellness tracker",
      "Guided movement & workout plans",
      "Sustainable fat loss education",
      "Healthy habit-building strategies",
    ],
    perfectFor: [
      "Lose body fat sustainably",
      "Improve energy and metabolism",
      "Create healthy habits that last",
      "Feel more confident in their body",
      "Learn to work with hormones, not against them",
    ],
    timeline: [
      {
        label: "Week 1",
        title: "Metabolic Reset",
        description: "Foundation nutrition, macro setup, and habit tracking begins.",
      },
      {
        label: "Week 2",
        title: "Momentum & Movement",
        description: "Introduce guided workouts and refine your personalised meal plan.",
      },
      {
        label: "Week 3",
        title: "Optimisation",
        description: "Fine-tune strategies based on progress and energy patterns.",
      },
      {
        label: "Week 4",
        title: "Sustain & Transition",
        description: "Lock in habits and receive your long-term maintenance plan.",
      },
    ],
    outcomes:
      "By the end of this 4-week program, you'll have the tools, knowledge, and confidence to support sustainable fat loss while working in harmony with your hormones. You'll establish healthier nutrition and movement habits and develop a personalised approach to maintaining results long-term.",
    methodology:
      "We focus on hormone-friendly nutrition, adequate protein, strategic movement, and accountability — creating a metabolic reset that supports fat loss without extreme restriction.",
    faqs: [
      {
        question: "Do I need a gym membership?",
        answer:
          "No — workout plans are designed for home or gym and adapt to your equipment and schedule.",
      },
      {
        question: "Can I continue after 4 weeks?",
        answer:
          "Absolutely. Many clients transition into the Hormone Harmony Framework for deeper, long-term support.",
      },
    ],
    featured: false,
    cta: "Book Your Spot",
    secondaryCta: "View Curriculum",
    ctaLink: "/consultation",
    pricing: "Starting from $249",
    videoUrl: defaultVideo,
    trustLine: "Trusted by Women Worldwide",
    published: true,
    createdAt: now,
    updatedAt: now,
  },
];
