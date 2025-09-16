import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import {
  CreateCertificateData,
  UpdateCertificateData,
  RevokeCertificateData,
  CertificateQuery,
} from "@/lib/validations/certificate";
import {
  generateCertificateNumber,
  generateVerificationHash,
  AuthorizationError,
  ValidationError,
} from "./auth";

export type CertificateWithRelations = Prisma.CertificateGetPayload<{
  include: {
    institution: true;
    student: true;
  };
}>;

export async function getCertificates(
  query: CertificateQuery,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<{ certificates: CertificateWithRelations[]; total: number }> {
  const { page, limit, sortBy, sortOrder, institutionId, studentId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CertificateWhereInput = {};

  // Apply filters
  if (studentId) where.studentId = studentId;
  if (institutionId) where.institutionId = institutionId;

  // Apply institution scoping for non-super admins
  if (!isSuperAdmin && userInstitutionId) {
    where.institutionId = userInstitutionId;
  }

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: {
        institution: true,
        student: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.certificate.count({ where }),
  ]);

  return { certificates, total };
}

export async function getCertificateById(
  id: string,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<CertificateWithRelations | null> {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      institution: true,
      student: true,
    },
  });

  if (!certificate) return null;

  // Check access for non-super admins
  if (
    !isSuperAdmin &&
    userInstitutionId &&
    certificate.institutionId !== userInstitutionId
  ) {
    throw new AuthorizationError("Access denied to this certificate");
  }

  return certificate;
}

export async function createCertificate(
  data: CreateCertificateData,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<CertificateWithRelations> {
  // Check institution access
  if (
    !isSuperAdmin &&
    userInstitutionId &&
    data.institutionId !== userInstitutionId
  ) {
    throw new AuthorizationError(
      "Cannot create certificate for this institution"
    );
  }

  // Verify that student exists and is linked to the institution
  const studentLink = await prisma.studentInstitution.findFirst({
    where: {
      studentId: data.studentId,
      institutionId: data.institutionId,
    },
  });

  if (!studentLink) {
    throw new ValidationError("Student is not enrolled in this institution");
  }

  // Generate certificate number and verification hash
  const certificateNumber =
    data.certificateNumber || generateCertificateNumber(data.institutionId);
  const verificationHash = generateVerificationHash(
    certificateNumber,
    data.studentId
  );

  try {
    const certificate = await prisma.certificate.create({
      data: {
        ...data,
        certificateNumber,
        verificationHash,
        issueDate: new Date(data.issueDate),
        completionDate: new Date(data.completionDate),
        // Optional on-chain tracking fields
        onChainId: (data as any).onChainId || undefined,
        latestTxHash: (data as any).latestTxHash || undefined,
      },
      include: {
        institution: true,
        student: true,
      },
    });

    return certificate;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ValidationError("Certificate number already exists");
    }
    throw error;
  }
}

export async function updateCertificate(
  data: UpdateCertificateData,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<CertificateWithRelations> {
  const existing = await prisma.certificate.findUnique({
    where: { id: data.id },
  });

  if (!existing) {
    throw new ValidationError("Certificate not found");
  }

  // Check access
  if (
    !isSuperAdmin &&
    userInstitutionId &&
    existing.institutionId !== userInstitutionId
  ) {
    throw new AuthorizationError("Access denied to this certificate");
  }

  const updateData: Prisma.CertificateUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.gpa !== undefined) updateData.gpa = data.gpa;
  if (data.honors !== undefined) updateData.honors = data.honors;
  if (data.isRevoked !== undefined) updateData.isRevoked = data.isRevoked;
  if (data.completionDate !== undefined) {
    updateData.completionDate = new Date(data.completionDate);
  }

  const certificate = await prisma.certificate.update({
    where: { id: data.id },
    data: updateData,
    include: {
      institution: true,
      student: true,
    },
  });

  return certificate;
}

export async function revokeCertificate(
  data: RevokeCertificateData,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<CertificateWithRelations> {
  const existing = await prisma.certificate.findUnique({
    where: { id: data.id },
  });

  if (!existing) {
    throw new ValidationError("Certificate not found");
  }

  // Check access
  if (
    !isSuperAdmin &&
    userInstitutionId &&
    existing.institutionId !== userInstitutionId
  ) {
    throw new AuthorizationError("Access denied to this certificate");
  }

  if (existing.isRevoked) {
    throw new ValidationError("Certificate is already revoked");
  }

  const certificate = await prisma.certificate.update({
    where: { id: data.id },
    data: {
      isRevoked: true,
      revokedReason: data.reason,
      revokedDate: new Date(),
    },
    include: {
      institution: true,
      student: true,
    },
  });

  return certificate;
}

export async function deleteCertificate(
  id: string,
  userInstitutionId?: string | null,
  isSuperAdmin: boolean = false
): Promise<void> {
  const existing = await prisma.certificate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ValidationError("Certificate not found");
  }

  // Check access
  if (
    !isSuperAdmin &&
    userInstitutionId &&
    existing.institutionId !== userInstitutionId
  ) {
    throw new AuthorizationError("Access denied to this certificate");
  }

  await prisma.certificate.delete({
    where: { id },
  });
}
