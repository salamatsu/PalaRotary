import { createAxiosInstanceWithInterceptor, getUsersValues } from "./axios";

const axiosDefault = createAxiosInstanceWithInterceptor(
  "data",
  getUsersValues.receptionist
);

// Enhanced error handler
const handleApiError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error.response?.status === 401) {
    throw new Error("Authentication required");
  }
  if (error.response?.status === 403) {
    throw new Error("Access denied");
  }
  if (error.response?.status === 404) {
    throw new Error("Resource not found");
  }
  throw new Error(error.message || "An unexpected error occurred");
};

// Add booking with validation
export const addBookingApi = async (payload) => {
  try {
    const result = await axiosDefault.post("/api/bookings", payload);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const extendBookingApi = async ({ bookingId, ...payload }) => {
  try {
    const result = await axiosDefault.post(
      `/api/bookings/${bookingId}/extensions`,
      payload
    );
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getBookingByRoomIdApi = async (roomId) => {
  try {
    const result = await axiosDefault.get(
      `/api/bookings/${roomId}/bookingByRoomId`
    );
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getBookingsApi = async () => {
  try {
    const result = await axiosDefault.get(`/api/bookings`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const paymentSettleApi = async ({ bookingId, ...payload }) => {
  try {
    const result = await axiosDefault.post(
      `/api/bookings/${bookingId}/payments/settle`,
      payload
    );
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getBookingPaymentSummaryApi = async (bookingId) => {
  try {
    const result = await axiosDefault.get(
      `/api/bookings/${bookingId}/payments/summary`
    );
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getBookingByBookingIdApi = async (bookingId) => {
  try {
    const result = await axiosDefault.get(`/api/bookings/${bookingId}`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getBookingStatusApi = async (bookingId) => {
  try {
    const result = await axiosDefault.get(`/api/bookings/${bookingId}/status`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// PAYMENT OPERATIONS
export const getBookingPaymentsApi = async (bookingId) => {
  try {
    const result = await axiosDefault.get(
      `/api/bookings/${bookingId}/payments`
    );
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getBookingChargesApi = async (bookingId) => {
  try {
    const result = await axiosDefault.get(`/api/bookings/${bookingId}/charges`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};
