import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRegistrationStore = create(
  persist(
    (set) => ({
      registrations: {
        success: [],
        failed: [],
      },
      addSuccessRegistration: (data) =>
        set((state) => ({
          registrations: {
            ...state.registrations,
            success: [...state.registrations.success, data],
          },
        })),
      addFailedRegistration: (data) =>
        set((state) => ({
          registrations: {
            ...state.registrations,
            failed: [...state.registrations.failed, data],
          },
        })),
      resetRegistrations: () =>
        set({
          registrations: {
            success: [],
            failed: [],
          },
        }),
    }),
    {
      name: "palarotary-registration-storage",
      // Store in localStorage
      getStorage: () => localStorage,
    }
  )
);
