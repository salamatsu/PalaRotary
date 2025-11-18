import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (token, admin) =>
        set({
          token,
          admin,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        }),

      updateAdmin: (admin) =>
        set((state) => ({
          admin: { ...state.admin, ...admin },
        })),
    }),
    {
      name: 'palarotary-admin-auth',
      getStorage: () => localStorage,
    }
  )
);
