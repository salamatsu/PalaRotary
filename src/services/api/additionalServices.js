import { createAxiosInstanceWithInterceptor } from "./axios";

const axiosDefault = createAxiosInstanceWithInterceptor("data");

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

// Get all users
export const getAllAdditionalServices = async () => {
  try {
    const result = await axiosDefault.get("/api/additionalServices");
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const addAdditionalServices = async (payload) => {
  try {
    const result = await axiosDefault.post("/api/additionalServices", payload);
    return result.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
