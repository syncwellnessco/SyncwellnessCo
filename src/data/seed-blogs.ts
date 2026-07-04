import type { BlogPost } from "@/types/blog";

const now = new Date().toISOString();

export const seedBlogs: BlogPost[] = [
  {
    id: "hormone-signs",
    title: "5 Signs Your Hormones Need Attention",
    excerpt:
      "Learn the subtle signals your body sends when hormones are out of balance.",
    content:
      "Many women live with hormone imbalance symptoms for years before recognizing the pattern. Fatigue, mood swings, stubborn weight, and digestive issues often share a common root. In this article, we explore five key signs that your hormones may need support — and what you can do about it.",
    category: "Hormone Health",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    author: "Neha",
    published: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "gut-cycle-connection",
    title: "Gut Health & Your Cycle: What's Connected",
    excerpt:
      "Why digestive wellness plays a bigger role in hormonal balance than you think.",
    content:
      "Your gut and hormones are deeply connected. The microbiome influences estrogen metabolism, inflammation, and nutrient absorption — all of which affect your cycle. Understanding this connection is the first step toward lasting hormonal balance.",
    category: "Gut Health",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    author: "Neha",
    published: true,
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sustainable-fat-loss",
    title: "Sustainable Fat Loss Without Restriction",
    excerpt: "A gentler approach to body composition that actually lasts.",
    content:
      "Crash diets and extreme calorie deficits often backfire — especially for women over 30. Sustainable fat loss requires working with your hormones, supporting metabolism, and building habits you can maintain for life.",
    category: "Nutrition",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525cd17?w=600&h=400&fit=crop",
    author: "Neha",
    published: true,
    createdAt: now,
    updatedAt: now,
  },
];
