import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserState = {
  user: any | null | undefined;
  purchasedPrograms: string[]; // array of program IDs
  setUser: (user: any | null | undefined) => void;
  setPurchasedPrograms: (programs: string[]) => void;
  addPurchasedProgram: (programId: string) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: undefined,
      purchasedPrograms: [],
      setUser: (user) => set({ user }),
      setPurchasedPrograms: (programs) => set({ purchasedPrograms: programs }),
      addPurchasedProgram: (programId) => set((state) => ({ 
        purchasedPrograms: [...new Set([...state.purchasedPrograms, programId])] 
      })),
      logout: () => set({ user: null, purchasedPrograms: [] }),
    }),
    {
      name: 'syncwellness-user-storage',
    }
  )
);
