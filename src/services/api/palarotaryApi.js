import { formatQueryParams } from "../../utils/itemFormat";
import { axiosInstance, createAxiosInstanceWithInterceptor } from "./axios";
import { handleApiError } from "../../utils/handlers";

const axios = createAxiosInstanceWithInterceptor("data");
// ============================================
// CSRF TOKEN API
// ============================================

export const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get("/api/v2/users/csrf-token");
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
      "/api/v2/clubs/auth/login",
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
    const response = await axiosInstance.get("/api/v2/users/clubs");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const registerMember = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/api/v2/users/register/visitor",
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
      `/api/v2/users/visitors/verify/${qrCode}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCheckAvailability = async ({ zone, shirtNumber }) => {
  try {
    const response = await axiosInstance.get(
      `/api/v2/users/visitors/merchandise/check-availability?zone=${zone}&shirtNumber=${shirtNumber}`
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
      "/api/v2/users/visitors/merchandise",
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
      `/api/v2/users/visitors/merchandise/transaction${tnNumber}`
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
      "/api/v2/clubs/auth/register-club",
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
      `/api/v2/clubs/auth/upload-payment-proof?token=${token}`,
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
      "/api/v2/clubs/auth/registered-clubs"
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
    const response = await axios.get("/api/v2/clubs/cms/dashboard/overview");
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardClubsDetailedApi = async (payload) => {
  // query:  page,limit,status
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/dashboard/clubs?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardAttendeesApi = async (payload) => {
  // query:  page, limit, search(optional), clubId(optional), registerAs(optional):
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/dashboard/attendees?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardPaymentProofApi = async (payload) => {
  // query:  page, limit, status(optional), clubId(optional)
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/dashboard/payment-proofs?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const getAdminDashboardDailyRegistrationsApi = async (payload) => {
  // query:  days
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/dashboard/daily-registrations?${formatQueryParams(
        payload,
        {
          skipEmpty: true,
        }
      )}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminDashboardClubAttendeesApi = async ({
  clubId,
  ...payload
}) => {
  // query:  page, limit
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/dashboard/clubs/${clubId}/attendees?${formatQueryParams(
        payload,
        {
          skipEmpty: true,
        }
      )}`
    );
    return response.data?.data;
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
      `/api/v2/clubs/cms/transactions?${formatQueryParams(payload, {
        skipEmpty: true,
      })}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAdminTransactionsApi = async (payload) => {
  try {
    const response = await axios.post(
      `/api/v2/clubs/cms/transactions/validate-club-registration`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const toggleClubVerificationAdminTransactionsApi = async (payload) => {
  try {
    const response = await axios.post(
      `/api/v2/clubs/cms/transactions/toggle-club-verification`,
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
      `/api/v2/clubs/cms/merchandises?${formatQueryParams(payload, {
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
      `/api/v2/clubs/cms/merchandises/${merchandiseId}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminMerchandiseByZoneApi = async (zone) => {
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/merchandises/zone/${zone}`
    );
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminMerchandisesStatsApi = async () => {
  try {
    const response = await axios.get(`/api/v2/clubs/cms/merchandises/stats`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateAdminMerchandiseStatusApi = async (payload) => {
  // merchandiseId, status, assignedNumber, remarks:
  try {
    const response = await axios.post(
      `/api/v2/clubs/cms/merchandises/validate`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// ============================================
// SCANNER
// ============================================

export const scanQRCodeApi = async (payload) => {
  // merchandiseId, status, assignedNumber, remarks:
  try {
    const response = await axios.post(`/api/v2/scanner/scans`, payload);
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
    return response.data?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAdminChekcNumber = async ({ zone, shirtNumber }) => {
  try {
    const response = await axios.get(
      `/api/v2/clubs/cms/merchandises/check-number/${zone}/${shirtNumber}`
    );
    return response.data?.data;
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
