import { axiosInstance, createAxiosInstanceWithInterceptor } from "./axios";

const axios = createAxiosInstanceWithInterceptor("data");
// ============================================
// CSRF TOKEN API
// ============================================

export const getCsrfToken = async () => {
  // Use a separate axios instance without CSRF token for fetching the CSRF token
  // to avoid circular dependency
  const response = await axiosInstance.get("/api/v1/users/csrf-token");
  return response.data;
};

// ============================================
// ADMIN AUTH
// ============================================

export const loginAdminApi = async (credentials) => {
  const response = await axiosInstance.post(
    "/api/v1/clubs/auth/login",
    credentials
  );
  return response.data;
};
// ============================================
// PUBLIC APIS - Member Registration
// ============================================

export const getApprovedClubs = async () => {
  const response = await axiosInstance.get("/api/v1/users/clubs");
  return response.data;
};

export const registerMember = async (data) => {
  const response = await axiosInstance.post(
    "/api/v1/users/register/visitor",
    data
  );
  return response.data;
};

export const getVerifyQrCode = async (qrCode) => {
  const response = await axiosInstance.get(
    `/api/v1/users/visitors/verify/${qrCode}`
  );
  return response.data;
};

export const getCheckAvailability = async ({ zone, shirtNumber }) => {
  const response = await axiosInstance.get(
    `/api/v1/users/visitors/merchandise/check-availability?zone=${zone}&shirtNumber=${shirtNumber}`
  );
  return response.data;
};

// ============================================
// SHIRT ORDERING API
// ============================================

export const submitShirtOrder = async (orderData) => {
  const response = await axiosInstance.post(
    "/api/v1/users/visitors/merchandise",
    orderData
  );
  return response.data;
};

export const getTransactionInfo = async (tnNumber) => {
  const response = await axiosInstance.get(
    `/api/v1/users/visitors/merchandise/transaction${tnNumber}`
  );
  return response.data;
};

// ============================================
// PUBLIC APIS - Club Registration
// ============================================

export const registerClub = async (data) => {
  const response = await axiosInstance.post(
    "/api/v1/clubs/auth/register-club",
    data
  );
  return response.data;
};

export const uploadPaymentProof = async ({ token, ...payload }) => {
  const response = await axiosInstance.post(
    `/api/v1/clubs/auth/upload-payment-proof?token=${token}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getRegisteredClub = async () => {
  const response = await axiosInstance.get(
    "/api/v1/clubs/auth/registered-clubs"
  );
  return response.data;
};

// =====================================================================================================================================================================
// ------------------------------------------

// ============================================
// OLD API - must remove when done
// ============================================

// ============================================
// PUBLIC APIS - Club Registration
// ============================================

// export const uploadPaymentProof = async (clubId, file) => {
//   const formData = new FormData();
//   formData.append("proof_of_payment", file);

//   const response = await axiosInstance.post(
//     `/api/clubs/${clubId}/upload-payment`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );
//   return response.data;
// };

export const getPaymentInfo = async () => {
  const response = await axiosInstance.get("/api/clubs/payment-info");
  return response.data;
};

// export const getApprovedClubs = async () => {
//   const response = await axiosInstance.get("/api/v1/users/clubs");
//   return response.data;
// };

export const checkClubStatus = async (clubId) => {
  const response = await axiosInstance.get(`/api/clubs/${clubId}/status`);
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

export const getAdvancedAnalytics = async () => {
  const response = await axios.get("/api/admin/analytics/advanced");
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

// ============================================
// SCANNER APIS - Attendance & QR Scanning
// ============================================

export const scanQRCode = async (data) => {
  const response = await axios.post("/api/scanner/scan", data);
  return response.data;
};

export const getAttendanceStats = async () => {
  const response = await axios.get("/api/scanner/stats");
  return response.data;
};

export const getMemberAttendance = async (memberId) => {
  const response = await axios.get(`/api/scanner/member/${memberId}`);
  return response.data;
};

export const exportAttendance = async (date) => {
  const response = await axios.get("/api/scanner/export", {
    params: { date },
  });
  return response.data;
};

// ============================================
// SHIRT ORDER APIS
// ============================================

export const getShirtOrders = async (params) => {
  const response = await axios.get("/api/admin/shirts/orders", { params });
  return response.data;
};

export const updateShirtOrderStatus = async (orderId, status) => {
  const response = await axios.put(
    `/api/admin/shirts/orders/${orderId}/status`,
    {
      status,
    }
  );
  return response.data;
};

export const approveSpecialNumber = async (orderId, itemId, approved) => {
  const response = await axios.put(
    `/api/admin/shirts/orders/${orderId}/items/${itemId}/special-number`,
    { approved }
  );
  return response.data;
};
