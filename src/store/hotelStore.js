import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCurrentActiveUserToken = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      reset: () => set({ token: null, user: null }),
    }),
    {
      name: "test-hotel-active-user-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useSuperAdminAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setToken: (token) => set({ token }),
      setUserData: (userData) => set({ userData }),
      reset: () => set({ userData: null, token: null }),
    }),
    {
      name: "test-hotel-superadmin-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setToken: (token) => set({ token }),
      setUserData: (userData) => set({ userData }),
      reset: () => set({ userData: null, token: null }),
    }),
    {
      name: "test-hotel-admin-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useReceptionistAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setToken: (token) => set({ token }),
      setUserData: (userData) => set({ userData }),
      reset: () => set({ userData: null, token: null }),
    }),
    {
      name: "test-hotel-receptionist-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
