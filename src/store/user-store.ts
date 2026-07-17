import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserState = {
  user: any | null | undefined;
  purchasedPrograms: string[]; // array of program IDs
  bookingDetails: Record<string, any>; // maps programId to booking details
  consultationsCompleted: Record<string, boolean>; // maps programId to boolean
  setUser: (user: any | null | undefined) => void;
  setPurchasedPrograms: (programs: string[]) => void;
  addPurchasedProgram: (programId: string) => void;
  setBookingDetail: (programId: string, details: any) => void;
  setConsultationCompleted: (programId: string, completed: boolean) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: undefined,
      purchasedPrograms: [],
      bookingDetails: {},
      consultationsCompleted: {},
      setUser: (user) => set({ user }),
      setPurchasedPrograms: (programs) => set({ purchasedPrograms: programs }),
      addPurchasedProgram: (programId) => set((state) => ({ 
        purchasedPrograms: [...new Set([...state.purchasedPrograms, programId])] 
      })),
      setBookingDetail: (programId, details) => set((state) => ({
        bookingDetails: { ...state.bookingDetails, [programId]: details }
      })),
      setConsultationCompleted: (programId, completed) => set((state) => ({
        consultationsCompleted: { ...state.consultationsCompleted, [programId]: completed }
      })),
      logout: () => set({ 
        user: null, 
        purchasedPrograms: [], 
        bookingDetails: {}, 
        consultationsCompleted: {} 
      }),
    }),
    {
      name: 'syncwellness-user-storage',
    }
  )
);
