import { z } from "zod";

export const createCertificateSchema = z.object({
  institutionId: z.string().uuid("Invalid institution ID"),
  studentId: z.string().uuid("Invalid student ID"),
  certificateNumber: z.string().min(1, "Certificate number is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  issueDate: z.string().datetime("Invalid issue date"),
  completionDate: z.string().datetime("Invalid completion date"),
  gpa: z.number().min(0).max(4).optional(),
  honors: z.enum(["cumLaude", "magnaCumLaude", "summaCumLaude"]).optional(),
  onChainId: z.string().optional(),
  latestTxHash: z.string().optional(),
});

export const updateCertificateSchema = z.object({
  id: z.string().uuid("Invalid certificate ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  completionDate: z.string().datetime("Invalid completion date").optional(),
  gpa: z.number().min(0).max(4).optional(),
  honors: z.enum(["cumLaude", "magnaCumLaude", "summaCumLaude"]).optional(),
  isRevoked: z.boolean().optional(),
});

export const revokeCertificateSchema = z.object({
  id: z.string().uuid("Invalid certificate ID"),
  reason: z
    .string()
    .min(1, "Revocation reason is required")
    .max(500, "Reason too long"),
});

export const certificateQuerySchema = z.object({
  id: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["issueDate", "title", "certificateNumber"])
    .default("issueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCertificateData = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateData = z.infer<typeof updateCertificateSchema>;
export type RevokeCertificateData = z.infer<typeof revokeCertificateSchema>;
export type CertificateQuery = z.infer<typeof certificateQuerySchema>;
