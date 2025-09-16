import prisma from "@/lib/prisma";
import { User, Role } from "@/lib/generated/prisma";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function checkInstitutionAccess(
  user: User,
  targetInstitutionId: string
): void {
  if (user.role === "SUPER_ADMIN") {
    return; // Super admin has access to all institutions
  }

  if (!user.institutionId) {
    throw new AuthorizationError("User has no institution association");
  }

  if (user.institutionId !== targetInstitutionId) {
    throw new AuthorizationError("User cannot access this institution's data");
  }
}

export function checkPermission(user: User, requiredRoles: Role[]): void {
  if (!user.role) {
    throw new AuthorizationError("User has no role assigned");
  }

  if (!requiredRoles.includes(user.role)) {
    throw new AuthorizationError(
      `User role ${user.role} is not authorized for this action`
    );
  }
}

export async function checkStudentAccess(
  user: User,
  studentId: string
): Promise<void> {
  if (user.role === "SUPER_ADMIN") {
    return; // Super admin has access to all students
  }

  const studentInstitutionLink = await prisma.studentInstitution.findFirst({
    where: {
      studentId,
      institutionId: user.institutionId!,
    },
  });

  if (!studentInstitutionLink) {
    throw new AuthorizationError("User cannot access this student's data");
  }
}

export async function checkCertificateAccess(
  user: User,
  certificateId: string
): Promise<void> {
  if (user.role === "SUPER_ADMIN") {
    return; // Super admin has access to all certificates
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: { institutionId: true },
  });

  if (!certificate) {
    throw new ValidationError("Certificate not found");
  }

  if (certificate.institutionId !== user.institutionId) {
    throw new AuthorizationError("User cannot access this certificate");
  }
}

export function generateCertificateNumber(institutionId: string): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${institutionId.slice(0, 8).toUpperCase()}-${year}-${randomSuffix}`;
}

export function generateVerificationHash(
  certificateNumber: string,
  studentId: string
): string {
  const timestamp = Date.now();
  return `${certificateNumber}::${studentId}::${timestamp}`;
}
