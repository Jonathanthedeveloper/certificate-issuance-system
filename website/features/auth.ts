import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Prisma, User } from "@/lib/generated/prisma";
import { useQuery } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (walletAddress: string) => {
      const response = await api.post<{
        success: boolean;
        message: string;
        user: User;
      }>("/api/auth/login", { walletAddress });

      return response.data;
    },
  });
}

type Profile = Prisma.UserGetPayload<{
  include: {
    student: {
      include: {
        institutions: true;
        certificates: true;
      };
    };
    institution: true;
  };
}>;

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<Profile>("/api/auth/profile");
      return response.data;
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (data: any) => {
      const response = await api.post("/api/auth/register", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
