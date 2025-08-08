
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
    throw new Error('Authentication required');
  }
  if (error.response?.status === 403) {
    throw new Error('Access denied');
  }
  if (error.response?.status === 404) {
    throw new Error('Resource not found');
  }
  throw new Error(error.message || 'An unexpected error occurred');
};

// Get bookings with filters and pagination
export const getBookingsApi = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add pagination
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    // // Add filtering
    // if (filters.branchId) params.append('branchId', filters.branchId);
    // if (filters.status) params.append('status', filters.status);
    // if (filters.checkInDate) params.append('checkInDate', filters.checkInDate);
    // if (filters.checkOutDate) params.append('checkOutDate', filters.checkOutDate);
    // if (filters.guestName) params.append('guestName', filters.guestName);
    // if (filters.reference) params.append('reference', filters.reference);

    const queryString = params.toString();
    const url = queryString ? `/api/bookings?${queryString}` : '/api/bookings';

    const result = await axiosDefault.get(url);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get booking by reference
export const getBookingByReferenceApi = async (reference) => {
  try {
    const result = await axiosDefault.get(`/api/bookings/${reference}`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add booking with validation
export const addBookingApi = async (payload) => {
  try {
    // Client-side validation
    if (!payload.guestName || !payload.roomId || !payload.checkInDate) {
      throw new Error('Missing required booking information');
    }

    const result = await axiosDefault.post('/api/bookings', payload);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update booking
export const updateBookingApi = async (bookingId, payload) => {
  try {
    const result = await axiosDefault.put(`/api/bookings/${bookingId}`, payload);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Check-in booking
export const checkInBookingApi = async (bookingId) => {
  try {
    const result = await axiosDefault.post(`/api/bookings/${bookingId}/checkin`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Check-out booking
export const checkOutBookingApi = async (bookingId) => {
  try {
    const result = await axiosDefault.post(`/api/bookings/${bookingId}/checkout`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Cancel booking
export const cancelBookingApi = async (bookingId) => {
  try {
    const result = await axiosDefault.delete(`/api/bookings/${bookingId}`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};