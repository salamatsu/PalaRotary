import { message } from "antd";
import axios from "axios";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export const createAxiosInstanceWithInterceptor = (type = "data") => {
  const auth = useAdminAuthStore.getState();
  const token = auth.token;

  if (!token) {
    message.warning("Authentication required");
    return null;
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
  };

  if (type === "data") {
    headers["Content-Type"] = "application/json";
  } else {
    headers["content-type"] = "multipart/form-data";
  }

  const instance = axios.create({
    headers,
  });

  instance.interceptors.request.use(
    async (config) => {
      try {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          throw new Error("Authorization token not found.");
        }
      } catch (error) {
        console.error({ error });
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errMessage = error.response?.data;

      if (
        errMessage?.message === "Invalid token." ||
        errMessage?.message === "No token provided" ||
        errMessage?.message === "Token expired" ||
        errMessage?.code == 300
      ) {
        message.warning(
          "Unable to process transaction. You have to login again."
        );

        // Logout user
        const auth = useAdminAuthStore.getState();
        auth.logout();
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
