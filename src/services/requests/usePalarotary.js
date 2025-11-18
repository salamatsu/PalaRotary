import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerClub,
  uploadPaymentProof,
  getPaymentInfo,
  getApprovedClubs,
  checkClubStatus,
  registerMember,
  getMemberBadge,
  getMemberDetails,
  getAdminDashboard,
  getAdminAnalytics,
  getAdminClubs,
  getAdminClubDetails,
  approveClub,
  rejectClub,
  getAdminMembers,
  deleteMember,
  getAdminZones,
} from '../api/palarotaryApi';

// ============================================
// PUBLIC HOOKS - Club Registration
// ============================================

export const useRegisterClub = () => {
  return useMutation({
    mutationFn: registerClub,
  });
};

export const useUploadPaymentProof = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, file }) => uploadPaymentProof(clubId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['club-status']);
    },
  });
};

export const usePaymentInfo = () => {
  return useQuery({
    queryKey: ['payment-info'],
    queryFn: getPaymentInfo,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useApprovedClubs = () => {
  return useQuery({
    queryKey: ['approved-clubs'],
    queryFn: getApprovedClubs,
  });
};

export const useClubStatus = (clubId, enabled = true) => {
  return useQuery({
    queryKey: ['club-status', clubId],
    queryFn: () => checkClubStatus(clubId),
    enabled: !!clubId && enabled,
  });
};

// ============================================
// PUBLIC HOOKS - Member Registration
// ============================================

export const useRegisterMember = () => {
  return useMutation({
    mutationFn: registerMember,
  });
};

export const useMemberBadge = (memberId, enabled = true) => {
  return useQuery({
    queryKey: ['member-badge', memberId],
    queryFn: () => getMemberBadge(memberId),
    enabled: !!memberId && enabled,
  });
};

export const useMemberDetails = (memberId, enabled = true) => {
  return useQuery({
    queryKey: ['member-details', memberId],
    queryFn: () => getMemberDetails(memberId),
    enabled: !!memberId && enabled,
  });
};

// ============================================
// ADMIN HOOKS - Dashboard & Analytics
// ============================================

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalytics,
  });
};

// ============================================
// ADMIN HOOKS - Club Management
// ============================================

export const useAdminClubs = (params = {}) => {
  return useQuery({
    queryKey: ['admin-clubs', params],
    queryFn: () => getAdminClubs(params),
  });
};

export const useAdminClubDetails = (clubId, enabled = true) => {
  return useQuery({
    queryKey: ['admin-club-details', clubId],
    queryFn: () => getAdminClubDetails(clubId),
    enabled: !!clubId && enabled,
  });
};

export const useApproveClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveClub,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-clubs']);
      queryClient.invalidateQueries(['admin-dashboard']);
      queryClient.invalidateQueries(['admin-club-details']);
    },
  });
};

export const useRejectClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, rejectionReason }) => rejectClub(clubId, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-clubs']);
      queryClient.invalidateQueries(['admin-dashboard']);
      queryClient.invalidateQueries(['admin-club-details']);
    },
  });
};

// ============================================
// ADMIN HOOKS - Member Management
// ============================================

export const useAdminMembers = (params = {}) => {
  return useQuery({
    queryKey: ['admin-members', params],
    queryFn: () => getAdminMembers(params),
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-members']);
      queryClient.invalidateQueries(['admin-dashboard']);
      queryClient.invalidateQueries(['admin-club-details']);
    },
  });
};

// ============================================
// ADMIN HOOKS - Zone Management
// ============================================

export const useAdminZones = () => {
  return useQuery({
    queryKey: ['admin-zones'],
    queryFn: getAdminZones,
  });
};
