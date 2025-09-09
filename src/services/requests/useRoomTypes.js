import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRoomTypeApi,
  getAllRoomTypesApi,
  getRoomTypeByIdApi,
  getRoomTypesByBranchIdApi,
  updateRoomTypeApi,
  updateRoomTypeStatusApi,
} from "../api/roomTypesApi";

// Query Keys
export const ROOM_TYPES_QUERY_KEYS = {
  all: ["roomTypes"],
  lists: () => [...ROOM_TYPES_QUERY_KEYS.all, "list"],
  list: (filters) => [...ROOM_TYPES_QUERY_KEYS.lists(), { filters }],
  details: () => [...ROOM_TYPES_QUERY_KEYS.all, "detail"],
  detail: (id) => [...ROOM_TYPES_QUERY_KEYS.details(), id],
  byBranch: (branchId) => [...ROOM_TYPES_QUERY_KEYS.all, "branch", branchId],
};

// Get all room types

export const useGetAllRoomTypesApi = () => {
  return useQuery({
    queryKey: ["getAllRoomTypesApi"],
    queryFn: getAllRoomTypesApi,
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    initialData: [],
    placeholderData: [],
    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });
};

export const useGetRoomTypeByIdApi = (roomTypeId) => {
  return useQuery({
    queryKey: ["getRoomTypeByIdApi"],
    queryFn: () => getRoomTypeByIdApi(roomTypeId),
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    initialData: {},
    placeholderData: {},
    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });
};

export const useGetRoomTypesByBranchIdApi = (branchId) => {
  return useQuery({
    queryKey: ["getRoomTypesByBranchIdApi"],
    queryFn: () => getRoomTypesByBranchIdApi(branchId),
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    initialData: {},
    placeholderData: {},
    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });
};

export const useAddRoomTypeApi = () => {
  return useMutation({
    mutationFn: addRoomTypeApi,
    retry: false,
  });
};

export const useUpdateRoomTypeApi = () => {
  return useMutation({
    mutationFn: updateRoomTypeApi,
    retry: false,
  });
};

export const useUpdateRoomTypeStatusApi = () => {
  return useMutation({
    mutationFn: updateRoomTypeStatusApi,
    retry: false,
  });
};

