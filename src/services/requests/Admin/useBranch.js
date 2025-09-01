import { useMutation } from "@tanstack/react-query";
import { createBranchApi } from "../../api/Admin/BranchApi";

export const useCreateBranch = () => {
  return useMutation({
    mutationFn: createBranchApi,
    retry: false,
  });
};
