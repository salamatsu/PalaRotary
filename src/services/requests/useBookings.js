import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addBookingApi,
  cancelBookingApi,
  checkInBookingApi,
  checkOutBookingApi,
  getBookingByReferenceApi,
  getBookingsApi,
  updateBookingApi,
} from "../api/bookingsApi";

// Get all bookings with enhanced filtering and pagination
export const useGetBookings = (filters = {}) => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => getBookingsApi(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch bookings:", error);
    },
  });
};

// Get booking by reference
export const useGetBookingByReference = (reference, options = {}) => {
  return useQuery({
    queryKey: ["booking"],
    queryFn: () => getBookingByReferenceApi(reference),
    enabled: !!reference,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Add booking mutation
export const useAddBooking = () => {
  return useMutation({
    mutationFn: addBookingApi,
    retry: false,
  });
};

// Update booking mutation
export const useUpdateBooking = () => {
  return useMutation({
    mutationFn: ({ bookingId, data }) => updateBookingApi(bookingId, data),
    retry: false,
  });
};

// Check-in booking mutation
export const useCheckInBooking = () => {
  return useMutation({
    mutationFn: checkInBookingApi,
    retry: false,
  });
};

// Check-out booking mutation
export const useCheckOutBooking = () => {
  return useMutation({
    mutationFn: checkOutBookingApi,
    retry: false,
  });
};

// Cancel booking mutation
export const useCancelBooking = () => {
  return useMutation({
    mutationFn: cancelBookingApi,
    retry: false,
  });
};
