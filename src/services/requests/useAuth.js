import { useMutation } from "@tanstack/react-query";
import {
  useAdminAuthStore,
  useReceptionistAuthStore,
} from "../../store/hotelStore";
import { loginAdminApi, loginApi } from "../api/auth";
import { message, Modal } from "antd";

export const useLoginAuth = () => {
  const { setToken, setUserData } = useReceptionistAuthStore.getState();
  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ data }) => {
      setToken(data.token);
      setUserData(data.user);
    },
    onSettled: () => {
      Modal.destroyAll()
    }
  });
};

export const useLoginAdminAuth = () => {
  const { setToken, setUserData } = useAdminAuthStore.getState();
  return useMutation({
    mutationFn: loginAdminApi,
    onSuccess: ({ data }) => {
      setToken(data.token);
      setUserData(data.user);
    },
    onError: (error) => {
      message.error(error.response?.data?.message);
    },
  });
};
