import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Institution } from "@/lib/generated/prisma";

export function useInstitutions() {
  return useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const res = await api.get<{ institutions: Institution[] }>(
        "/api/institutions"
      );
      return res.data.institutions;
    },
  });
}

export function useInstitution(id?: string | null) {
  return useQuery({
    queryKey: ["institution", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<{ institution: Institution }>(
        `/api/institutions?id=${id}`
      );
      return res.data.institution;
    },
  });
}

export function useCreateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["institution", "create"],
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/institutions", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
}

export function useUpdateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["institution", "update"],
    mutationFn: async (payload: any) => {
      const res = await api.put("/api/institutions", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
}

export function useDeleteInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["institution", "delete"],
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/institutions?id=${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
}

export function useOnboardInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["institution", "onboard"],
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/onboarding/institutions", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
}

export function useUserInstitutions() {
  return useQuery({
    queryKey: ["institutions", "user"],
    queryFn: async () => {
      const res = await api.get<{ institutions: Institution[] }>(
        "/api/institutions/me"
      );
      return res.data.institutions;
    },
  });
}
