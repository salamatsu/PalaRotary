import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
      name: "sogo-hotel-superadmin-auth",
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
      name: "sogo-hotel-admin-auth",
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
      name: "sogo-hotel-receptionist-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useHotelStore = create((set) => ({
  selectedBranchInfo: {
    branchId: 1,
    branchCode: "SOGO-EDSA-CUB",
    branchName: "Hotel Sogo EDSA Cubao",
    address: "1234 EDSA, Cubao, Quezon City",
    city: "Quezon City",
    region: "Metro Manila",
    contactNumber: "+63-2-8123-4567",
    email: "cubao@hotelsogo.com",
    operatingHours: "24/7",
    amenities: [
      "Free WiFi",
      "24-hour Front Desk",
      "Room Service",
      "Cable TV",
      "Air Conditioning",
    ],
    isActive: true,
  },
  setSelectedBranchInfo: (branchInfo) =>
    set({ selectedBranchInfo: branchInfo }),
}));
