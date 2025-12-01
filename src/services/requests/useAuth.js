import { useMutation } from "@tanstack/react-query";
import { Modal } from "antd";
import { loginAdminApi } from "../api/palarotaryApi";
import { userTypeAuth } from "../api/axios";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

export const useLoginAdminAuth = () => {
  const { setToken, setUserData } = useAdminAuthStore.getState();
  return useMutation({
    mutationFn: loginAdminApi,
    onSuccess: ({ data }) => {
      setToken(data.token);
      setUserData({ ...data.user, userTypeAuth: userTypeAuth.admin });
    },
    onSettled: () => {
      Modal.destroyAll();
    },
  });
};
