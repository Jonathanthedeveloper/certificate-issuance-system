import { z } from "zod";

export const loginSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
});

export const registerSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .optional(),
  role: z
    .enum(["SUPER_ADMIN", "INSTITUTION_ADMIN", "STAFF", "STUDENT"])
    .optional(),
  institutionId: z.string().uuid("Invalid institution ID").optional(),
});

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
