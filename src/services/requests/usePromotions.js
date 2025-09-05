import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPromotionByPromoCode,
  getPromotionsByMyBranch
} from "../api/promotions";

export const useGetPromotionsByMyBranch = () => {
  return useQuery({
    queryKey: ["getPromotionsByMyBranch"],
    queryFn: () => getPromotionsByMyBranch(),
    placeholderData: [],
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });
};

export const useGetPromotionByPromoCode = () => {
  return useMutation({
    mutationFn: getPromotionByPromoCode,
    retry: false,
  });
};
