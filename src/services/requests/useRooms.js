import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getRoomsByBranchApi,
  getAvailableRoomsApi,
  updateRoomStatusApi,
  getRoomRatesApi,
} from "../api/roomsApi";

// Get all rooms for a branch
export const useGetRoomsRates = (
  roomTypeId = null,
  branchId = null,
  options = {}
) => {
  return useQuery({
    queryKey: ["roomRates", roomTypeId, branchId],
    queryFn: () => getRoomRatesApi(roomTypeId, branchId),
    placeholderData: [],
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch rooms:", error);
    },
    ...options,
  });
};

export const useGetRoomsByBranch = (branchId = null, options = {}) => {
  return useQuery({
    queryKey: ["rooms", branchId],
    queryFn: () => getRoomsByBranchApi(branchId),
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch rooms:", error);
    },
    ...options,
  });
};


// Update room status mutation
export const useUpdateRoomStatus = () => {
  return useMutation({
    mutationFn: ({ roomId, data }) => updateRoomStatusApi(roomId, data),
    retry: false,
  });
};
