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
      name: "palarotary-active-user-auth",
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
      name: "palarotary-admin-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// export const useAdminAuthStore = create(
//   persist(
//     (set) => ({
//       token: null,
//       admin: null,
//       isAuthenticated: false,

//       setAuth: (token, admin) =>
//         set({
//           token,
//           admin,
//           isAuthenticated: true,
//         }),

//       logout: () =>
//         set({
//           token: null,
//           admin: null,
//           isAuthenticated: false,
//         }),

//       updateAdmin: (admin) =>
//         set((state) => ({
//           admin: { ...state.admin, ...admin },
//         })),
//     }),
//     {
//       name: 'palarotary-admin-auth',
//       getStorage: () => localStorage,
//     }
//   )
// );
