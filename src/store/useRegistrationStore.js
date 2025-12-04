import { create } from "zustand";

export const useRegistrationStore = create((set) => ({
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
}));
