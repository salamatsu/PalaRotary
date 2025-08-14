import { useMutation } from "@tanstack/react-query";
import {
  useAdminAuthStore,
  useReceptionistAuthStore,
  useSuperAdminAuthStore,
} from "../../store/hotelStore";
import { loginAdminApi, loginApi, loginSuperAdminApi } from "../api/auth";
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
      Modal.destroyAll();
    },
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

export const useLoginSuperAdminAuth = () => {
  const { setToken, setUserData } = useSuperAdminAuthStore.getState();
  return useMutation({
    mutationFn: loginSuperAdminApi,
    onSuccess: ({ data }) => {
      setToken(data.token);
      setUserData(data.user);
    },
    onError: (error) => {
      message.error(error.response?.data?.message);
    },
  });
};
