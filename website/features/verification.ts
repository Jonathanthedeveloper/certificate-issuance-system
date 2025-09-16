import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface VerificationResponse {
  verified: boolean;
  certificate?: any;
  message: string;
  error?: string;
  revokedReason?: string;
  revokedDate?: string;
}

export function useVerifyCertificate() {
  return useMutation({
    mutationKey: ["verify-certificate"],
    mutationFn: async (query: string) => {
      const response = await api.post<VerificationResponse>(
        "/api/certificates/verify",
        { query }
      );
      return response.data;
    },
  });
}
