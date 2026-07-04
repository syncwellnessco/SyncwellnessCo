export type ProgramTimelineItem = {
  label: string;
  title: string;
  description: string;
};

export type ProgramFAQ = {
  question: string;
  answer: string;
};

export type ProgramMedia = {
  type: "image" | "video";
  url: string;
  title?: string;
};

export type Program = {
  id: string;
  name: string;
  duration: string;
  format: string;
  description: string;
  overview: string;
  overviewParagraphs?: string[];
  stats: string[];
  problems: string[];
  features: string[];
  bonuses?: string[];
  perfectFor: string[];
  timeline?: ProgramTimelineItem[];
  outcomes: string;
  methodology?: string;
  faqs?: ProgramFAQ[];
  gallery?: ProgramMedia[];
  featured?: boolean;
  cta: string;
  ctaLink: string;
  secondaryCta?: string;
  pricing?: string;
  videoUrl?: string;
  trustLine?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgramInput = Omit<Program, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export type UpdateProgramInput = Partial<Omit<Program, "id" | "createdAt">> & {
  id: string;
};
