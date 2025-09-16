import { z } from "zod";

export const createStudentSchema = z.object({
  institutionId: z.string().uuid("Invalid institution ID"),
  userId: z.string().uuid("Invalid user ID"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email").optional(),
  dateOfBirth: z.string().datetime("Invalid date of birth").optional(),
  matricNumber: z
    .string()
    .min(1, "Matric number is required")
    .max(50, "Matric number too long"),
  enrollmentDate: z.string().datetime("Invalid enrollment date").optional(),
  graduationDate: z.string().datetime("Invalid graduation date").optional(),
});

export const updateStudentSchema = z.object({
  id: z.string().uuid("Invalid student ID"),
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
  email: z.string().email("Invalid email").optional(),
  dateOfBirth: z.string().datetime("Invalid date of birth").optional(),
  matricNumber: z
    .string()
    .min(1, "Matric number is required")
    .max(50, "Matric number too long")
    .optional(),
  isActive: z.boolean().optional(),
});

export const studentQuerySchema = z.object({
  id: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(["firstName", "lastName", "matricNumber", "createdAt"])
    .default("lastName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateStudentData = z.infer<typeof createStudentSchema>;
export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
