import { message } from "antd";
import axios from "axios";
import {
  useAdminAuthStore,
  useReceptionistAuthStore,
  useSuperAdminAuthStore,
} from "../../store/hotelStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// export const axiosInstance = (baseURL) => {
//   return axios.create({
//     baseURL: baseURL || import.meta.env.VITE_BASEURL,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
// };

export const getUsersValues = {
  superAdmin: "superAdmin",
  admin: "admin",
  receptionist: "receptionist",
};

export const tokens = {
  [getUsersValues.admin]: useAdminAuthStore,
  [getUsersValues.receptionist]: useReceptionistAuthStore, // Fixed: was frontdesk
  [getUsersValues.superAdmin]: useSuperAdminAuthStore,
};

export const getUserToken = (user = getUsersValues.receptionist) => {
  // Fixed: was frontdesk
  return tokens[user].getState();
};

export const createAxiosInstanceWithInterceptor = (type = "data", user) => {
  if (!user) {
    return message.warning("No user provided");
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
    // baseURL: baseURL,
    headers,
  });

  instance.interceptors.request.use(async (config) => {
    try {
      const { token } = getUserToken(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("Authorization token not found.");
      }
    } catch (error) {
      console.log({ error });
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    },
    function (error) {
      const { reset } = getUserToken(user);
      const errMessage = error.response?.data;

      if (
        errMessage?.message === "Invalid token." ||
        errMessage.message === "No token provided" ||
        errMessage?.code == 300
      ) {
        message.warning(
          "Unable to process transaction. You have to login again."
        );
        reset();
      }
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    }
  );

  return instance;
};
