import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveClub,
  deleteMember,
  getAdminClubDetails,
  getAdminClubs,
  getAdminDashboardAttendeesApi,
  getAdminDashboardClubAttendeesApi,
  getAdminDashboardClubsDetailedApi,
  getAdminDashboardDailyRegistrationsApi,
  getAdminDashboardOverviewApi,
  getAdminDashboardPaymentProofApi,
  getAdminMembers,
  getAdminMerchandiseByIdApi,
  getAdminMerchandiseByZoneApi,
  getAdminMerchandisesApi,
  getAdminMerchandisesStatsApi,
  getAdminTransactionsApi,
  getAdminZones,
  getApprovedClubs,
  getCheckAvailability,
  getRegisteredClub,
  getTransactionInfo,
  getVerifyQrCode,
  registerClub,
  registerMember,
  rejectClub,
  scanQRCodeApi,
  submitShirtOrder,
  updateAdminMerchandiseStatusApi,
  updateAdminTransactionsApi,
  uploadPaymentProof,
} from "../api/palarotaryApi";

// ============================================
// PUBLIC HOOKS - Member Registration
// ============================================

export const useRegisterMember = () => {
  return useMutation({
    mutationFn: registerMember,
  });
};

export const useApprovedClubs = () => {
  return useQuery({
    queryKey: ["approved-clubs"],
    queryFn: getApprovedClubs,
  });
};

export const useGetVerifyQrCode = () => {
  return useMutation({
    mutationFn: getVerifyQrCode,
  });
};

export const useGetCheckAvailability = () => {
  return useMutation({
    mutationFn: getCheckAvailability,
  });
};

export const useSubmitShirtOrder = () => {
  return useMutation({
    mutationFn: submitShirtOrder,
  });
};

export const useGetTransactionInfo = (tn) => {
  return useQuery({
    queryKey: ["getTransactionInfo", tn],
    queryFn: () => getTransactionInfo(tn),
    enabled: !!tn,
  });
};

// ============================================
// PUBLIC HOOKS - Club Registration
// ============================================

export const useGetRegisteredClub = () => {
  return useQuery({
    queryKey: ["getRegisteredClub"],
    queryFn: getRegisteredClub,
  });
};

export const useUploadPaymentProof = () => {
  return useMutation({
    mutationFn: uploadPaymentProof,
  });
};

// ============================================
// ADMIN HOOKS - DASHBOARD
// ============================================

export const useGetAdminDashboardOverviewApi = () => {
  return useQuery({
    queryKey: ["getAdminDashboardOverviewApi"],
    queryFn: () => getAdminDashboardOverviewApi(),
  });
};

export const useGetAdminDashboardClubsDetailedApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminDashboardClubsDetailedApi", payload],
    queryFn: () => getAdminDashboardClubsDetailedApi(payload),
  });
};

export const useGetAdminDashboardAttendeesApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminDashboardAttendeesApi", payload],
    queryFn: () => getAdminDashboardAttendeesApi(payload),
  });
};

export const useGetAdminDashboardPaymentProofApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminDashboardPaymentProofApi", payload],
    queryFn: () => getAdminDashboardPaymentProofApi(payload),
  });
};

export const useGetAdminDashboardDailyRegistrationsApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminDashboardDailyRegistrationsApi", payload],
    queryFn: () => getAdminDashboardDailyRegistrationsApi(payload),
  });
};

export const useGetAdminDashboardClubAttendeesApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminDashboardClubAttendeesApi", payload],
    queryFn: () => getAdminDashboardClubAttendeesApi(payload),
  });
};

// ============================================
// ADMIN HOOKS - MERCHANDISE
// ============================================

export const useGetAdminMerchandisesApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminMerchandisesApi", payload],
    queryFn: () => getAdminMerchandisesApi(payload),
  });
};
export const useGetAdminMerchandiseByZoneApi = (zone) => {
  return useQuery({
    queryKey: ["getAdminMerchandiseByZoneApi", zone],
    queryFn: () => getAdminMerchandiseByZoneApi(zone),
  });
};
export const useGetAdminMerchandisesStatsApi = () => {
  return useQuery({
    queryKey: ["getAdminMerchandisesStatsApi"],
    queryFn: () => getAdminMerchandisesStatsApi(),
  });
};

export const useGetAdminMerchandiseByIdApi = (merchandiseId) => {
  return useQuery({
    queryKey: ["getAdminMerchandiseByIdApi", merchandiseId],
    queryFn: () => getAdminMerchandiseByIdApi(merchandiseId),
    enabled: !!merchandiseId,
  });
};

export const useUpdateAdminMerchandiseStatusApi = () => {
  // payload: merchandiseId, status, assignedNumber, remarks,
  return useMutation({
    mutationFn: updateAdminMerchandiseStatusApi,
  });
};

// ============================================
// ADMIN - CLUB
// ============================================

export const useGetAdminTransactionsApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminMerchandiseByIdApi", payload],
    queryFn: () => getAdminTransactionsApi(payload),
  });
};

export const useUpdateAdminTransactionsApi = () => {
  return useMutation({
    mutationFn: updateAdminTransactionsApi,
  });
};

// ============================================
// SCANNER
// ============================================
export const useScanQRCode = () => {
  return useMutation({
    mutationFn: scanQRCodeApi,
  });
};

// ============================================
// OLD HOOKS - Club Registration (legacy)
// ============================================

export const useRegisterClub = () => {
  return useMutation({
    mutationFn: registerClub,
  });
};

// ============================================
// ADMIN HOOKS - Club Management
// ============================================

export const useAdminClubs = (params = {}) => {
  return useQuery({
    queryKey: ["admin-clubs", params],
    queryFn: () => getAdminClubs(params),
  });
};

export const useAdminClubDetails = (clubId, enabled = true) => {
  return useQuery({
    queryKey: ["admin-club-details", clubId],
    queryFn: () => getAdminClubDetails(clubId),
    enabled: !!clubId && enabled,
  });
};

export const useApproveClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveClub,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-clubs"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
      queryClient.invalidateQueries(["admin-club-details"]);
    },
  });
};

export const useRejectClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, rejectionReason }) =>
      rejectClub(clubId, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-clubs"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
      queryClient.invalidateQueries(["admin-club-details"]);
    },
  });
};

// ============================================
// ADMIN HOOKS - Member Management
// ============================================

export const useAdminMembers = (params = {}) => {
  return useQuery({
    queryKey: ["admin-members", params],
    queryFn: () => getAdminMembers(params),
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-members"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
      queryClient.invalidateQueries(["admin-club-details"]);
    },
  });
};

// ============================================
// ADMIN HOOKS - Zone Management
// ============================================

export const useAdminZones = () => {
  return useQuery({
    queryKey: ["admin-zones"],
    queryFn: getAdminZones,
  });
};
