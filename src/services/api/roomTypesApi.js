import { handleApiError } from "../../utils/handlers";
import { createAxiosInstanceWithInterceptor } from "./axios";

const axiosDefault = createAxiosInstanceWithInterceptor("data");
const axiosMultipartDefault = createAxiosInstanceWithInterceptor("data");

// GET /roomTypes - Get all room types
export const getAllRoomTypesApi = async () => {
  console.log("result1");
  try {
    const result = await axiosDefault.get(`/api/roomTypes`);
    console.log("result", result);
    return result.data;
  } catch (error) {
    console.log("errresult");
    throw handleApiError(error);
  }
};

// GET /roomTypes/:roomTypeId - Get room type by ID
export const getRoomTypeByIdApi = async (roomTypeId) => {
  try {
    const result = await axiosDefault.get(`/api/roomTypes/${roomTypeId}`);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// GET /roomTypes/branch/:branchId - Get room types by branch ID
export const getRoomTypesByBranchIdApi = async (branchId) => {
  try {
    const result = await axiosDefault.get(`/api/roomTypes/branch/${branchId}`);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// POST /roomTypes - Add new room type
export const addRoomTypeApi = async (payload) => {
  try {


    const result = await axiosMultipartDefault.post("/api/roomTypes/add", payload);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// PUT /roomTypes/:roomTypeId - Update room type
export const updateRoomTypeApi = async ({ roomTypeId, ...payload }) => {
  try {
    const result = await axiosMultipartDefault.put(
      `/api/roomTypes/${roomTypeId}/update`,
      payload,
    );
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// PATCH /roomTypes/:roomTypeId/status - Update room type status
export const updateRoomTypeStatusApi = async ({ roomTypeId, ...payload }) => {
  try {
    const result = await axiosDefault.patch(
      `/api/roomTypes/${roomTypeId}/status`,
      payload
    );
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// DELETE /roomTypes/:roomTypeId - Delete room type (soft delete)
export const deleteRoomTypeApi = async (roomTypeId) => {
  try {
    const result = await axiosDefault.delete(`/api/roomTypes/${roomTypeId}`);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Utility function to create FormData for room type with image
export const createRoomTypeFormData = (roomTypeData, imageFile = null) => {
  const formData = new FormData();

  // Add all room type fields to FormData
  Object.keys(roomTypeData).forEach((key) => {
    const value = roomTypeData[key];

    if (value !== null && value !== undefined) {
      // Handle arrays (amenities, features) - stringify them
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add image file if provided
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
};

// Utility function to prepare room type data for API
export const prepareRoomTypeData = (formValues, imageFile = null) => {
  const { amenities = [], features = [], ...otherData } = formValues;

  const roomTypeData = {
    ...otherData,
    amenities,
    features,
    maxOccupancy: parseInt(formValues.maxOccupancy),
    roomSize: formValues.roomSize ? parseFloat(formValues.roomSize) : null,
    branchId: parseInt(formValues.branchId),
  };

  // If there's an image file, create FormData
  if (imageFile) {
    return createRoomTypeFormData(roomTypeData, imageFile);
  }

  // Otherwise, return regular object (arrays will be stringified by the backend)
  return roomTypeData;
};
