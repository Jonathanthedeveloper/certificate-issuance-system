import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Certificate, Prisma } from "@/lib/generated/prisma";
import {
  transformCertificateData,
  transformCertificatesData,
} from "@/lib/utils";
import { useCertIssuer } from "@/lib/solana";

import { useConnection } from "@solana/wallet-adapter-react";

type CertificateWithRelations = Prisma.CertificateGetPayload<{
  include: {
    institution: true;
    student: true;
  };
}>;

export function useCertificates(filters?: {
  institutionId?: string;
  studentId?: string;
}) {
  return useQuery({
    queryKey: ["certificates", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.institutionId)
        params.set("institutionId", filters.institutionId);
      if (filters?.studentId) params.set("studentId", filters.studentId);
      const qs = params.toString();
      const url = qs ? `/api/certificates?${qs}` : "/api/certificates";
      const res = await api.get<{ certificates: CertificateWithRelations[] }>(
        url
      );
      return transformCertificatesData(res.data.certificates);
    },
  });
}

type CertificateDetails = CertificateWithRelations;

export function useCertificate(id?: string) {
  return useQuery({
    queryKey: ["certificate", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<{ certificate: CertificateDetails }>(
        `/api/certificates?id=${id}`
      );
      return transformCertificateData(res.data.certificate);
    },
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  const { issueCertificate } = useCertIssuer();
  return useMutation({
    mutationKey: ["certificate", "create"],
    mutationFn: async (payload: {
      studentId: string;
      title: string;
      description: string;
      completionDate: string | undefined;
      gpa?: number | string | undefined;
      honors?: string | undefined;
      institutionId: string;
      certificateNumber: string;
      issueDate: string;
    }) => {
      // Coerce and normalize before calling on-chain and backend
      const issueDateNum = Date.parse(payload.issueDate);
      const completionDateIso = payload.completionDate
        ? new Date(payload.completionDate).toISOString()
        : undefined;

      const completionDateNum = completionDateIso
        ? Date.parse(completionDateIso)
        : undefined;

      const gpaNum =
        payload.gpa === undefined || payload.gpa === null || payload.gpa === ""
          ? undefined
          : Number(payload.gpa);

      // Call on-chain issuance
      const cert = await issueCertificate({
        certificate_number: payload.certificateNumber,
        title: payload.title,
        description: payload.description,
        issue_date: issueDateNum,
        completion_date: completionDateNum ?? issueDateNum,
        gpa: gpaNum ?? undefined,
        honors: payload.honors ?? undefined,
      });

      // Prepare body for API (match server validation schema)
      const postBody: any = {
        studentId: payload.studentId,
        title: payload.title,
        description: payload.description || undefined,
        completionDate: completionDateIso,
        gpa: gpaNum,
        honors: payload.honors,
        institutionId: payload.institutionId,
        certificateNumber: payload.certificateNumber,
        issueDate: new Date(payload.issueDate).toISOString(),
      };

      // If the on-chain call returned PDA and signature, include them so the
      // server can persist the on-chain id and the transaction hash.
      if (cert?.pda)
        postBody.onChainId = (cert.pda as any).toBase58?.() || String(cert.pda);
      if (cert?.signature) postBody.latestTxHash = cert.signature;

      try {
        const res = await api.post("/api/certificates", postBody);
        return res.data;
      } catch (err: any) {
        // Surface server validation details in the console for easier debugging
        if (err?.response?.data) {
          console.error(
            "POST /api/certificates validation error:",
            err.response.data
          );
        }
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificates"] }),
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["certificate", "update"],
    mutationFn: async (payload: any) => {
      const res = await api.put("/api/certificates", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificates"] }),
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["certificate", "delete"],
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/certificates?id=${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificates"] }),
  });
}

export function useRevokeCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["certificate", "revoke"],
    mutationFn: async (payload: { id: string; reason: string }) => {
      const res = await api.patch("/api/certificates/revoke", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificates"] }),
  });
}

export function useUserCertificates() {
  return useQuery({
    queryKey: ["certificates", "user"],
    queryFn: async () => {
      const res = await api.get<{ certificates: Certificate[] }>(
        "/api/certificates/me"
      );
      return res.data.certificates;
    },
  });
}
