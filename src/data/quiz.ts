export interface Question {
  id: number;
  text: string;
  type: "scale" | "yes_no" | "bristol" | "options" | "text";
  helper?: string;
  options?: string[];
}

export interface BristolType {
  type: number;
  label: string;
  desc: string;
  color: string;
}

export interface QuizResult {
  minScore: number;
  maxScore: number;
  categoryTitle: string;
  categoryColor: string;
  emojiType: "smile" | "alert-warning" | "alert-error";
  descriptionParagraphs: string[];
  highlightBox?: {
    borderColor: string;
    title: string;
    paragraphs: string[];
  };
  footerParagraphs?: string[];
  footerItalic?: string;
}

export const quizIntro = {
  triggerBadge: "Assessment",
  triggerTitle: "Is Your Gut Microbiome Out of Balance?",
  triggerDescription: "Take our quick, evidence-based 2-minute Gut Health Quiz to assess your symptom severity, classify your dysbiosis level, and verify your eligibility for the 15-day Cleanse.",
  introTitle: "Gut Cleanse Eligibility & Dysbiosis Quiz",
  introDescription: "This brief self-assessment measures the severity of your digestive, energy, and metabolic symptoms to classify your gut health and tailor your cleanse roadmap."
};

export const QUESTIONS: Question[] = [
  {
    id: 2,
    text: "Are you someone who is Diabetic (type 1 or type 2), or Pregnant/Lactating, or Renal or Cancer patient?",
    type: "yes_no",
    options: ["Yes", "No"],
    helper: "If yes, please let us know prior to starting the program."
  },
  {
    id: 3,
    text: "Gassy feeling",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 4,
    text: "Bloating",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 5,
    text: "Heaviness after Meals",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 6,
    text: "Stomach pain",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 7,
    text: "Lethargy or feeling tired",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 8,
    text: "Brain Fog",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 9,
    text: "Constipation (without laxatives)",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 10,
    text: "Mucus in stool",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 11,
    text: "Smelly stool",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 12,
    text: "Bad breath",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 13,
    text: "Oral thrush (white layer on your tongue)",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 14,
    text: "Acne",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 15,
    text: "Eczema / Psoriasis / Rosacea / Rashes",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 16,
    text: "Acidity / Heartburn / Reflux",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 17,
    text: "Nausea",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 18,
    text: "Burping / Belching",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 19,
    text: "Sweet cravings",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 20,
    text: "Disturbed sleep",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 21,
    text: "How would you rate your stress / anxiety on a scale",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 22,
    text: "Stubborn Weight / Resistant Metabolism",
    type: "scale",
    helper: "Rate from 1 (lowest/rare) to 5 (highest/severe)."
  },
  {
    id: 23,
    text: "Poop type",
    type: "bristol",
    helper: "According to the Bristol Stool Chart, please select your typical stool type below:"
  },
  {
    id: 24,
    text: "How often do you poop?",
    type: "options",
    options: [
      "Once a day",
      "Twice a day",
      "More than 2 times a day",
      "Once every other day",
      "Less than 3 times a week"
    ]
  },
  {
    id: 25,
    text: "Floating stool?",
    type: "options",
    options: [
      "Rare or not noticed",
      "Sometimes",
      "Often"
    ]
  },
  {
    id: 26,
    text: "Top 3 Gut-related pain points that you want to improve during the cleanse",
    type: "text",
    helper: "Provide up to three concerns."
  },
  {
    id: 27,
    text: "Mention any past medical history or if your doctor has confirmed any specific gut-related diagnosis for you.",
    type: "text",
    helper: "Please specify (e.g., IBS, Crohn's disease, gastritis, SIBO, H. Pylori etc.)"
  }
];

export const BRISTOL_TYPES: BristolType[] = [
  { type: 1, label: "Type 1: Separate hard lumps", desc: "Like nuts, hard to pass. Indicates severe constipation.", color: "bg-amber-900" },
  { type: 2, label: "Type 2: Sausage-shaped but lumpy", desc: "Indicates mild constipation.", color: "bg-amber-800" },
  { type: 3, label: "Type 3: Like a sausage with surface cracks", desc: "Normal / optimal, but on the drier side.", color: "bg-amber-700" },
  { type: 4, label: "Type 4: Smooth and soft snake-like", desc: "Perfect, healthy stool. Easy to pass.", color: "bg-emerald-700" },
  { type: 5, label: "Type 5: Soft blobs with clear-cut edges", desc: "Lacking fiber, slightly fast transit time.", color: "bg-teal-700" },
  { type: 6, label: "Type 6: Fluffy mushy pieces with ragged edges", desc: "Borderline diarrhea, inflammation or irritation.", color: "bg-orange-700" },
  { type: 7, label: "Type 7: Watery, entire liquid, no solid pieces", desc: "Diarrhea. Severe irritation or infection.", color: "bg-red-700" }
];

export const QUIZ_RESULTS: QuizResult[] = [
  {
    minScore: 0,
    maxScore: 14,
    categoryTitle: "Healthy Gut / Optimal Microbiome",
    categoryColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    emojiType: "smile",
    descriptionParagraphs: [
      "Based on your score, your gut health is in great condition! You have minimal digestive symptoms, indicating a well-balanced microbiome.",
      "Keep up the healthy habits to maintain your gut microbiome. However, if you experience occasional bloating or want to optimize your digestion, the 15-day Cleanse can still serve as an excellent seasonal reboot."
    ]
  },
  {
    minScore: 15,
    maxScore: 30,
    categoryTitle: "Category 1 — Moderate Gut Dysbiosis",
    categoryColor: "text-amber-700 bg-amber-50 border-amber-200",
    emojiType: "alert-warning",
    descriptionParagraphs: [
      "Based on your score, your gut health falls in Category 1, which means you are eligible for the 15-day Gut Cleanse Program."
    ],
    highlightBox: {
      borderColor: "border-amber-500",
      title: "You have moderate gut dysbiosis (more bad, less good bacteria)",
      paragraphs: [
        "Your symptoms are manageable BUT can be improved if you recognize your trigger foods and sensitivities. Through our carefully designed gut cleanse program, you can expect to see a 50% reduction or more in the symptoms that are most concerning to you. Eating anti-inflammatory foods will help you restore your gut microbiome naturally and lead you on an uphill journey to a healthier lifestyle.",
        "A healthy gut can help you achieve clarity in thinking, keeps you motivated to do basic things in life, gives you more energy, better nutrient absorption and overall improvement in mood."
      ]
    },
    footerItalic: "We can't wait to have you!"
  },
  {
    minScore: 31,
    maxScore: 50,
    categoryTitle: "Category 2 — Elevated Gut Dysbiosis",
    categoryColor: "text-orange-700 bg-orange-50 border-orange-200",
    emojiType: "alert-warning",
    descriptionParagraphs: [
      "Based on your score, your gut health falls in Category 2, which means you are eligible for the 15-day Gut Cleanse Program."
    ],
    highlightBox: {
      borderColor: "border-orange-500",
      title: "You have moderate gut dysbiosis (more bad, less good bacteria)",
      paragraphs: [
        "Your symptoms are manageable BUT can be improved if you recognize your trigger foods and sensitivities. Through our carefully designed gut cleanse program, you can expect to see a 50% reduction or more in the symptoms that are most concerning to you. Eating anti-inflammatory foods will help you restore your gut microbiome naturally and lead you on an uphill journey to a healthier lifestyle.",
        "A healthy gut can help you achieve clarity in thinking, keeps you motivated to do basic things in life, gives you more energy, better nutrient absorption and overall improvement in mood."
      ]
    },
    footerItalic: "We can't wait to have you!"
  },
  {
    minScore: 51,
    maxScore: 999,
    categoryTitle: "Category 3 — Severe Gut Dysbiosis",
    categoryColor: "text-red-700 bg-red-50 border-red-200",
    emojiType: "alert-error",
    descriptionParagraphs: [
      "Based on your score, your gut health falls in Category 3, which means you are eligible for the 15-day Gut Cleanse Program."
    ],
    highlightBox: {
      borderColor: "border-red-500",
      title: "You have moderate to severe gut dysbiosis (more bad, less good bacteria)",
      paragraphs: [
        "You will see maximum improvement in as little as 15 days in your digestive disturbances. In as little as 24 hours, our gut microbiome starts to change when we eat an anti-inflammatory diet.",
        "With small practices like fat first, eliminating raw foods, introducing gut loving foods, and being consistent with morning rituals will help reverse unmanageable symptoms you are facing currently. We also have a vagus nerve workshop in these 15 days which will help you understand the connection between mental relaxation and gut health. The 15 days would be a great start for you in your health journey and help you build a connection between what you eat and how you feel."
      ]
    },
    footerParagraphs: [
      "This 15-day gut cleanse program is designed in a way that can help you understand what's triggering your symptoms and help restore your gut microbiome without medication or expensive treatments right from the comfort of your own home."
    ]
  }
];

export function getQuizResult(score: number): QuizResult {
  const result = QUIZ_RESULTS.find(r => score >= r.minScore && score <= r.maxScore);
  if (result) return result;
  return QUIZ_RESULTS[QUIZ_RESULTS.length - 1];
}

export function calculateQuizScore(answers: Record<number, any>): { score: number; result: QuizResult } {
  let score = 0;

  QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return;

    if (q.type === "scale") {
      const val = Number(ans) || 1;
      // Subtract 1 so 1 (Almost Never) is 0 points, and 5 (Severe) is 4 points
      score += Math.max(0, val - 1);
    } else if (q.type === "bristol") {
      const val = Number(ans);
      if (val === 4) {
        score += 0;
      } else if (val === 3 || val === 5) {
        score += 1;
      } else if (val === 2 || val === 6) {
        score += 2;
      } else if (val === 1 || val === 7) {
        score += 3;
      }
    } else if (q.type === "options" && q.id === 24) {
      const opt = String(ans);
      if (opt === "Once a day" || opt === "Twice a day") {
        score += 0;
      } else if (opt === "More than 2 times a day" || opt === "Once every other day") {
        score += 1;
      } else if (opt === "Less than 3 times a week") {
        score += 3;
      }
    } else if (q.type === "options" && q.id === 25) {
      const opt = String(ans);
      if (opt === "Rare or not noticed") {
        score += 0;
      } else if (opt === "Sometimes") {
        score += 1;
      } else if (opt === "Often") {
        score += 2;
      }
    }
  });

  const result = getQuizResult(score);
  return { score, result };
}
