import { message } from "antd";
import axios from "axios";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";
import { useCsrfStore } from "../../store/useCsrfStore";

export const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add CSRF token interceptor to axiosInstance
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip CSRF token for the CSRF endpoint itself
    if (!config.url?.includes("/csrf-token")) {
      const csrfToken = useCsrfStore.getState().csrfToken;
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

        // Add CSRF token to authenticated requests (skip for CSRF endpoint)
        if (!config.url?.includes("/csrf-token")) {
          const csrfToken = useCsrfStore.getState().csrfToken;
          if (csrfToken) {
            config.headers["x-csrf-token"] = csrfToken;
          }
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
