import { message } from "antd";
import axios from "axios";
import {
  useAdminAuthStore,
  useCurrentActiveUserToken,
} from "../../store/useAdminAuthStore";
import { useCsrfStore } from "../../store/useCsrfStore";

export const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export const userTypeAuth = {
  admin: "admin",
};

export const tokens = {
  [userTypeAuth.admin]: useAdminAuthStore,
};

export const getUserToken = (user = getUsersValues.receptionist) => {
  return tokens[user].getState();
};

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

// Add response interceptor for CSRF token refetch
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for CSRF validation failure
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "CSRF_VALIDATION_FAILED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Fetch new CSRF token
        const response = await axiosInstance.get("/api/v1/users/csrf-token");
        const newCsrfToken = response.data.csrfToken;

        // Update the store with the new token
        useCsrfStore.getState().setCsrfToken(newCsrfToken);

        // Update the original request with the new token
        if (!originalRequest.url?.includes("/csrf-token")) {
          originalRequest.headers["x-csrf-token"] = newCsrfToken;
        }

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refetchError) {
        console.error("Failed to refetch CSRF token:", refetchError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const createAxiosInstanceWithInterceptor = (type = "data") => {
  const { token, user } = useCurrentActiveUserToken.getState();

  // if (!token) {
  //   message.warning("Authentication required");
  //   return null;
  // }

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
    async (error) => {
      const errMessage = error.response?.data;
      const originalRequest = error.config;

      // Check for CSRF validation failure
      if (
        error.response?.status === 403 &&
        errMessage?.code === "CSRF_VALIDATION_FAILED" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Fetch new CSRF token
          const response = await axiosInstance.get("/api/v1/users/csrf-token");
          const newCsrfToken = response.data.csrfToken;

          // Update the store with the new token
          useCsrfStore.getState().setCsrfToken(newCsrfToken);

          // Update the original request with the new token
          if (!originalRequest.url?.includes("/csrf-token")) {
            originalRequest.headers["x-csrf-token"] = newCsrfToken;
          }

          // Retry the original request
          return instance(originalRequest);
        } catch (refetchError) {
          console.error("Failed to refetch CSRF token:", refetchError);
          return Promise.reject(error);
        }
      }

      // Handle authentication errors
      if (
        errMessage?.message === "Invalid token." ||
        errMessage?.message === "No token provided" ||
        errMessage?.message === "Token expired" ||
        errMessage?.code == 300
      ) {
        message.warning(
          "Unable to process transaction. You have to login again."
        );

        const { reset } = getUserToken(user);
        // Logout user
        reset();
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
