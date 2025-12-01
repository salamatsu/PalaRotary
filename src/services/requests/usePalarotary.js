import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveClub,
  checkClubStatus,
  deleteMember,
  exportAttendance,
  getAdminAnalytics,
  getAdminClubDetails,
  getAdminClubs,
  getAdminDashboard,
  getAdminMembers,
  getAdminMerchandiseByIdApi,
  getAdminMerchandisesApi,
  getAdminTransactionsApi,
  getAdminZones,
  getApprovedClubs,
  getAttendanceStats,
  getCheckAvailability,
  getMemberAttendance,
  getMemberBadge,
  getMemberDetails,
  getPaymentInfo,
  getRegisteredClub,
  getTransactionInfo,
  getVerifyQrCode,
  registerClub,
  registerMember,
  rejectClub,
  scanQRCode,
  submitShirtOrder,
  updateAdminMerchandiseApi,
  updateAdminTransactionsApi,
  uploadPaymentProof,
} from "../api/palarotaryApi";

// ============================================
// PUBLIC HOOKS - AUTHENTICATION
// ============================================

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

export const useGetAdminTransactionsApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminTransactionsApi", payload],
    queryFn: () => getAdminTransactionsApi(payload),
  });
};

export const useUpdateAdminTransactionsApi = () => {
  return useMutation({
    mutationFn: updateAdminTransactionsApi,
  });
};

// ============================================
// ADMIN HOOKS - MERCHANDISE
// ============================================

// getAdminMerchandisesApi
// getAdminMerchandiseByIdApi
// getAdminMerchandiseByZoneApi
// getAdminMerchandisesStatsApi
// updateAdminMerchandiseApi

export const useGetAdminMerchandisesApi = (payload) => {
  return useQuery({
    queryKey: ["getAdminMerchandisesApi", payload],
    queryFn: () => getAdminMerchandisesApi(payload),
  });
};

export const useGetAdminMerchandiseByIdApi = (merchandiseId) => {
  return useQuery({
    queryKey: ["getAdminMerchandiseByIdApi", merchandiseId],
    queryFn: () => getAdminMerchandiseByIdApi(merchandiseId),
    enabled: !!merchandiseId,
  });
};

export const useUpdateAdminMerchandiseApi = () => {
  return useMutation({
    mutationFn: updateAdminMerchandiseApi,
  });
};
// ======================================================================================================================================

// ============================================
// OLD HOOKS
// ============================================

export const useRegisterClub = () => {
  return useMutation({
    mutationFn: registerClub,
  });
};

// export const useUploadPaymentProof = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ clubId, file }) => uploadPaymentProof(clubId, file),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["club-status"]);
//     },
//   });
// };

export const usePaymentInfo = () => {
  return useQuery({
    queryKey: ["payment-info"],
    queryFn: getPaymentInfo,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useClubStatus = (clubId, enabled = true) => {
  return useQuery({
    queryKey: ["club-status", clubId],
    queryFn: () => checkClubStatus(clubId),
    enabled: !!clubId && enabled,
  });
};

// ============================================
// PUBLIC HOOKS - Member Registration
// ============================================

export const useMemberBadge = (memberId, enabled = true) => {
  return useQuery({
    queryKey: ["member-badge", memberId],
    queryFn: () => getMemberBadge(memberId),
    enabled: !!memberId && enabled,
  });
};

export const useMemberDetails = (memberId, enabled = true) => {
  return useQuery({
    queryKey: ["member-details", memberId],
    queryFn: () => getMemberDetails(memberId),
    enabled: !!memberId && enabled,
  });
};

// ============================================
// ADMIN HOOKS - Dashboard & Analytics
// ============================================

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: getAdminAnalytics,
  });
};

export const useAdvancedAnalytics = () => {
  return useQuery({
    queryKey: ["advanced-analytics"],
    queryFn: () =>
      import("../api/palarotaryApi").then((m) => m.getAdvancedAnalytics()),
    refetchInterval: 60000, // Refetch every minute
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

// ============================================
// SCANNER HOOKS - Attendance & QR Scanning
// ============================================

export const useScanQRCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scanQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendance-stats"]);
    },
  });
};

export const useAttendanceStats = () => {
  return useQuery({
    queryKey: ["attendance-stats"],
    queryFn: getAttendanceStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMemberAttendance = (memberId, enabled = true) => {
  return useQuery({
    queryKey: ["member-attendance", memberId],
    queryFn: () => getMemberAttendance(memberId),
    enabled: !!memberId && enabled,
  });
};

export const useExportAttendance = () => {
  return useMutation({
    mutationFn: exportAttendance,
  });
};
