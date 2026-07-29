import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  program_id: string;
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
  status?: string;
  featured_on_home?: boolean;
  created_at?: string;
}

type ReviewState = {
  submittedReviews: Review[];
  addReview: (review: Review) => void;
  setSubmittedReviews: (reviews: Review[]) => void;
  clearReviews: () => void;
};

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      submittedReviews: [],
      addReview: (review) =>
        set((state) => {
          // Avoid duplicate reviews by ID
          const filtered = state.submittedReviews.filter((r) => r.id !== review.id);
          return { submittedReviews: [review, ...filtered] };
        }),
      setSubmittedReviews: (reviews) => set({ submittedReviews: reviews }),
      clearReviews: () => set({ submittedReviews: [] }),
    }),
    {
      name: 'syncwellness-reviews-storage',
    }
  )
);
