import { axiosInstance, createAxiosInstanceWithInterceptor } from "./axios";

const axios = createAxiosInstanceWithInterceptor("data");
// ============================================
// ADMIN AUTH
// ============================================

export const loginAdminApi = async (credentials) => {
  const response = await axiosInstance.post("/api/admin/login", credentials);
  return response.data;
};

// ============================================
// PUBLIC APIS - Club Registration
// ============================================

export const registerClub = async (data) => {
  const response = await axiosInstance.post("/api/clubs/register", data);
  return response.data;
};

export const uploadPaymentProof = async (clubId, file) => {
  const formData = new FormData();
  formData.append("proof_of_payment", file);

  const response = await axiosInstance.post(
    `/api/clubs/${clubId}/upload-payment`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getPaymentInfo = async () => {
  const response = await axiosInstance.get("/api/clubs/payment-info");
  return response.data;
};

export const getApprovedClubs = async () => {
  const response = await axiosInstance.get("/api/clubs/approved");
  return response.data;
};

export const checkClubStatus = async (clubId) => {
  const response = await axiosInstance.get(`/api/clubs/${clubId}/status`);
  return response.data;
};

// ============================================
// PUBLIC APIS - Member Registration
// ============================================

export const registerMember = async (data) => {
  const response = await axiosInstance.post("/api/members/register", data);
  return response.data;
};

export const getMemberBadge = async (memberId) => {
  const response = await axiosInstance.get(`/api/members/${memberId}/badge`);
  return response.data;
};

export const getMemberDetails = async (memberId) => {
  const response = await axiosInstance.get(`/api/members/${memberId}`);
  return response.data;
};

// ============================================
// ADMIN APIS - Dashboard & Analytics
// ============================================

export const getAdminDashboard = async () => {
  const response = await axios.get("/api/admin/dashboard");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await axios.get("/api/admin/analytics");
  return response.data;
};

// ============================================
// ADMIN APIS - Club Management
// ============================================

export const getAdminClubs = async (params) => {
  const response = await axios.get("/api/admin/clubs", { params });
  return response.data;
};

export const getAdminClubDetails = async (clubId) => {
  const response = await axios.get(`/api/admin/clubs/${clubId}`);
  return response.data;
};

export const approveClub = async (clubId) => {
  const response = await axios.put(`/api/admin/clubs/${clubId}/approve`);
  return response.data;
};

export const rejectClub = async (clubId, rejectionReason) => {
  const response = await axios.put(`/api/admin/clubs/${clubId}/reject`, {
    rejection_reason: rejectionReason,
  });
  return response.data;
};

// ============================================
// ADMIN APIS - Member Management
// ============================================

export const getAdminMembers = async (params) => {
  const response = await axios.get("/api/admin/members", { params });
  return response.data;
};

export const deleteMember = async (memberId) => {
  const response = await axios.delete(`/api/admin/members/${memberId}`);
  return response.data;
};

// ============================================
// ADMIN APIS - Zone Management
// ============================================

export const getAdminZones = async () => {
  const response = await axios.get("/api/admin/zones");
  return response.data;
};
