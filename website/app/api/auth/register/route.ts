import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/utils";

const registerSchema = z
  .object({
    role: z.enum(Role),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    institutionId: z.string().optional(),
    email: z.email().optional(),
    matricNumber: z.string().min(2).max(100).optional(),
    institution: z
      .object({
        name: z.string().min(2).max(100),
        type: z.string().min(2).max(100),
        country: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        city: z.string().min(2).max(100),
        address: z.string().min(2).max(100),
        website: z.url(),
        phoneNumber: z.string().min(10).max(15).optional(),
        description: z.string().min(2).max(500).optional(),
        licenseNumber: z.string().min(2).max(100).optional(),
        accreditationBody: z.string().min(2).max(100).optional(),
      })
      .optional(),
  })
  .refine((data) => {
    if (data.role != Role.INSTITUTION_ADMIN) {
      return !!data.email && z.string().email().safeParse(data.email).success;
    }
    return true;
  });

export async function POST(request: Request) {
  try {
    const user = await authenticate(request.headers);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );

    const { data } = parsed;

    if (data.role === Role.STUDENT)
      await prisma.$transaction(async (tx) => {
        // Update User role
        await tx.user.update({
          where: { id: user.id },
          data: { role: Role.STUDENT },
        });

        // Create student Profile
        const student = await tx.student.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            matricNumber: data.matricNumber!,
            user: {
              connect: { id: user.id },
            },
          },
        });

        // Enroll user
        await tx.studentInstitution.create({
          data: {
            institutionId: data.institutionId!,
            studentId: student.id,
          },
        });
      });

    if (data.role === Role.INSTITUTION_ADMIN) {
      await prisma.$transaction(async (tx) => {
        if (!data.institution) {
          return NextResponse.json(
            { error: "institution_required" },
            { status: 400 }
          );
        }

        // Update User role
        await tx.user.update({
          where: { id: user.id },
          data: {
            role: Role.INSTITUTION_ADMIN,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        });

        // Create institution Profile
        await tx.institution.create({
          data: {
            name: data.institution.name,
            type: data.institution.type,
            country: data.institution.country,
            state: data.institution.state,
            city: data.institution.city,
            address: data.institution.address,
            website: data.institution.website,
            phoneNumber: data.institution.phoneNumber,
            description: data.institution.description,
            licenseNumber: data.institution.licenseNumber,
            accreditationBody: data.institution.accreditationBody,
            users: {
              connect: { id: user.id },
            },
          },
        });
      });
    }

    if (data.role === Role.STAFF) {
      await prisma.$transaction(async (tx) => {
        // Update User role
        await tx.user.update({
          where: { id: user.id },
          data: {
            role: Role.STAFF,
            firstName: data.firstName,
            lastName: data.lastName,
            institution: {
              connect: { id: data.institutionId! },
            },
          },
        });
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
    });
  } catch (err: any) {
    console.error(err);
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "wallet already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
