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

// Get all users
export const getAllPromotions = async () => {
  try {
    const result = await axiosDefault.get("/api/promotions");
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPromotionsByMyBranch = async () => {
  try {
    const result = await axiosDefault.get(`/api/promotions/myBranch`);
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPromotionByPromoCode = async ({ promoCode, roomTypeId }) => {
  try {
    const result = await axiosDefault.get(
      `/api/promotions/validate/${promoCode}?roomTypeId=${roomTypeId}`
    );
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};
