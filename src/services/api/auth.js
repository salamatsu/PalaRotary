import { axiosInstance } from "./axios";

export const loginApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", payload);
    return response.data;
  } catch (error) {
    throw error
  }
};

export const loginAdminApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/auth/loginAdmin", payload);
    return response.data;
  } catch (error) {
    throw error
  }
};

export const loginSuperAdminApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/auth/loginSuperAdmin", payload);
    return response.data;
  } catch (error) {
    throw error
  }
};
