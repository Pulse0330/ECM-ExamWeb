import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExamState {
  testId: number | null; // RetData хадгалах
  setTestId: (id: number | null) => void;
  clearTestId: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      testId: null,
      setTestId: (id) => set({ testId: id }),
      clearTestId: () => set({ testId: null }),
    }),
    {
      name: "exam-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
