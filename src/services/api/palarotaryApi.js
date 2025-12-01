import { formatQueryParams } from "../../utils/itemFormat";
import { axiosInstance, createAxiosInstanceWithInterceptor } from "./axios";
import { handleApiError } from "../../utils/handlers";

const axios = createAxiosInstanceWithInterceptor("data");
// ============================================
// CSRF TOKEN API
// ============================================

export const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/users/csrf-token");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN AUTH
// ============================================

export const loginAdminApi = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/clubs/auth/login",
      credentials
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// PUBLIC APIS - Member Registration
// ============================================

export const getApprovedClubs = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/users/clubs");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const registerMember = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/users/register/visitor",
      data
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getVerifyQrCode = async (qrCode) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/users/visitors/verify/${qrCode}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCheckAvailability = async ({ zone, shirtNumber }) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/users/visitors/merchandise/check-availability?zone=${zone}&shirtNumber=${shirtNumber}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// SHIRT ORDERING API
// ============================================

export const submitShirtOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/users/visitors/merchandise",
      orderData
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTransactionInfo = async (tnNumber) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/users/visitors/merchandise/transaction${tnNumber}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// PUBLIC APIS - Club Registration
// ============================================

export const registerClub = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/clubs/auth/register-club",
      data
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const uploadPaymentProof = async ({ token, ...payload }) => {
  try {
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
  } catch (error) {
    handleApiError(error);
  }
};

export const getRegisteredClub = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/clubs/auth/registered-clubs"
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Dashboard & Analytics
// ============================================

export const getAdminDashboardOverviewApi = async () => {
  try {
    const response = await axios.get("/api/v1/clubs/cms/dashboard/overview");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardClubsDetailedApi = async (payload) => {
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/dashboard/clubs?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardAttendeesApi = async (payload) => {
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/dashboard/attendees?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Transactions
// ============================================
export const getAdminTransactionsApi = async (payload) => {
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/transactions?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAdminTransactionsApi = async (payload) => {
  try {
    const response = await axios.post(
      `/api/v1/clubs/cms/transactions/validate-club-registration`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Merchandise
// ============================================

export const getAdminMerchandisesApi = async (payload) => {
  //page:1, limit:50, status:, zone:, paymentStatus:
  console.log(payload);
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/merchandises?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminMerchandiseByIdApi = async (merchandiseId) => {
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/merchandises/${merchandiseId}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminMerchandiseByZoneApi = async (zone) => {
  try {
    const response = await axios.get(
      `/api/v1/clubs/cms/merchandises/zone/${zone}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminMerchandisesStatsApi = async () => {
  try {
    const response = await axios.get(`/api/v1/clubs/cms/merchandises/stats`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAdminMerchandiseApi = async (payload) => {
  // merchandiseId, status, assignedNumber, remarks:
  try {
    const response = await axios.post(
      `/api/v1/clubs/cms/merchandises/validate`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// OLD API - must remove when done
// ============================================

export const getPaymentInfo = async () => {
  try {
    const response = await axiosInstance.get("/api/clubs/payment-info");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const checkClubStatus = async (clubId) => {
  try {
    const response = await axiosInstance.get(`/api/clubs/${clubId}/status`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getMemberBadge = async (memberId) => {
  try {
    const response = await axiosInstance.get(`/api/members/${memberId}/badge`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getMemberDetails = async (memberId) => {
  try {
    const response = await axiosInstance.get(`/api/members/${memberId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Dashboard & Analytics
// ============================================

export const getAdminDashboard = async () => {
  try {
    const response = await axios.get("/api/admin/dashboard");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminAnalytics = async () => {
  try {
    const response = await axios.get("/api/admin/analytics");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdvancedAnalytics = async () => {
  try {
    const response = await axios.get("/api/admin/analytics/advanced");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Club Management
// ============================================

export const getAdminClubs = async (params) => {
  try {
    const response = await axios.get("/api/admin/clubs", { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminClubDetails = async (clubId) => {
  try {
    const response = await axios.get(`/api/admin/clubs/${clubId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const approveClub = async (clubId) => {
  try {
    const response = await axios.put(`/api/admin/clubs/${clubId}/approve`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const rejectClub = async (clubId, rejectionReason) => {
  try {
    const response = await axios.put(`/api/admin/clubs/${clubId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Member Management
// ============================================

export const getAdminMembers = async (params) => {
  try {
    const response = await axios.get("/api/admin/members", { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteMember = async (memberId) => {
  try {
    const response = await axios.delete(`/api/admin/members/${memberId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// ADMIN APIS - Zone Management
// ============================================

export const getAdminZones = async () => {
  try {
    const response = await axios.get("/api/admin/zones");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// SCANNER APIS - Attendance & QR Scanning
// ============================================

export const scanQRCode = async (data) => {
  try {
    const response = await axios.post("/api/scanner/scan", data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAttendanceStats = async () => {
  try {
    const response = await axios.get("/api/scanner/stats");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getMemberAttendance = async (memberId) => {
  try {
    const response = await axios.get(`/api/scanner/member/${memberId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const exportAttendance = async (date) => {
  try {
    const response = await axios.get("/api/scanner/export", {
      params: { date },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// SHIRT ORDER APIS
// ============================================

export const getShirtOrders = async (params) => {
  try {
    const response = await axios.get("/api/admin/shirts/orders", { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateShirtOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(
      `/api/admin/shirts/orders/${orderId}/status`,
      {
        status,
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const approveSpecialNumber = async (orderId, itemId, approved) => {
  try {
    const response = await axios.put(
      `/api/admin/shirts/orders/${orderId}/items/${itemId}/special-number`,
      { approved }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
