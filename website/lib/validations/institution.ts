import { z } from "zod";

export const createInstitutionSchema = z.object({
  name: z
    .string()
    .min(1, "Institution name is required")
    .max(200, "Name too long"),
  type: z
    .string()
    .min(1, "Institution type is required")
    .max(100, "Type too long"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country too long"),
  state: z.string().min(1, "State is required").max(100, "State too long"),
  city: z.string().min(1, "City is required").max(100, "City too long"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address too long"),
  website: z.string().url("Invalid website URL").optional(),
  phoneNumber: z.string().max(20, "Phone number too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  licenseNumber: z.string().max(100, "License number too long").optional(),
  accreditationBody: z
    .string()
    .max(200, "Accreditation body too long")
    .optional(),
});

export const updateInstitutionSchema = z.object({
  id: z.string().uuid("Invalid institution ID"),
  name: z
    .string()
    .min(1, "Institution name is required")
    .max(200, "Name too long")
    .optional(),
  type: z
    .string()
    .min(1, "Institution type is required")
    .max(100, "Type too long")
    .optional(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country too long")
    .optional(),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State too long")
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City too long")
    .optional(),
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address too long")
    .optional(),
  website: z.string().url("Invalid website URL").optional(),
  phoneNumber: z.string().max(20, "Phone number too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  licenseNumber: z.string().max(100, "License number too long").optional(),
  accreditationBody: z
    .string()
    .max(200, "Accreditation body too long")
    .optional(),
  isActive: z.boolean().optional(),
});

export const institutionQuerySchema = z.object({
  id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["name", "type", "country", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateInstitutionData = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionData = z.infer<typeof updateInstitutionSchema>;
export type InstitutionQuery = z.infer<typeof institutionQuerySchema>;
