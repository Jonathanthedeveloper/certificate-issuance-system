import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const q = Object.fromEntries(url.searchParams.entries());
    const querySchema = z.object({
      id: z.string().optional(),
      institutionId: z.string().optional(),
    });
    const qParsed = querySchema.safeParse(q);
    const id = qParsed.success ? qParsed.data.id : undefined;
    const institutionId = qParsed.success
      ? qParsed.data.institutionId
      : undefined;

    if (id) {
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          institutions: {
            include: {
              institution: true,
            },
          },
          certificates: true,
          user: true,
        },
      });
      if (!student)
        return NextResponse.json({ error: "not_found" }, { status: 404 });

      // institution-scoped users can only fetch students that are linked to their institution
      if (user.role !== "SUPER_ADMIN") {
        const hasInstitutionAccess = student.institutions.some(
          (si) => si.institutionId === user.institutionId
        );
        if (!hasInstitutionAccess)
          return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }

      return NextResponse.json({ student });
    }

    // Build a relation-based filter: students that have a StudentInstitution link
    const where: any = {};
    if (institutionId) {
      where.institutions = { some: { institutionId } };
    }

    if (user.role !== "SUPER_ADMIN") {
      // limit to their institution
      if (!user.institutionId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      where.institutions = { some: { institutionId: user.institutionId } };
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { lastName: "asc" },
      include: {
        user: true,
      },
    });
    return NextResponse.json({ students });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const createSchema = z.object({
      institutionId: z.string(),
      userId: z.string(),
      matricNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      dateOfBirth: z.string(),
      enrollmentDate: z.string(),
      graduationDate: z.string().optional(),
    });
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    const {
      institutionId: bodyInstitutionId,
      userId,
      firstName,
      lastName,
      email,
      dateOfBirth,
      enrollmentDate,
      graduationDate,
    } = parsed.data;

    // institution-scoped users can only create students for their own institution
    if (
      user.role !== "SUPER_ADMIN" &&
      bodyInstitutionId !== user.institutionId
    ) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Create the core Student record (linked to a User via userId)
    const student = await prisma.student.create({
      data: {
        userId,
        firstName,
        lastName,
        email,
        dateOfBirth: new Date(dateOfBirth),
        matricNumber: parsed.data.matricNumber,
      },
    });

    // Create the StudentInstitution link
    await prisma.studentInstitution.create({
      data: {
        studentId: student.id,
        institutionId: bodyInstitutionId,
        enrollmentDate: new Date(enrollmentDate),
        graduationDate: graduationDate ? new Date(graduationDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const idSchema = z.object({ id: z.string() });
    const idParsed = idSchema.safeParse(body);
    if (!idParsed.success)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    const { id } = idParsed.data;

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    // If user is institution-scoped, ensure the student is linked to their institution
    if (user.role !== "SUPER_ADMIN") {
      const link = await prisma.studentInstitution.findFirst({
        where: { studentId: id, institutionId: user.institutionId! },
      });
      if (!link)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const updateSchema = z.object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      isActive: z.boolean().optional(),
      dateOfBirth: z.string().optional(),
      enrollmentDate: z.string().optional(),
      graduationDate: z.string().optional().nullable(),
    });
    const parsedUpdate = updateSchema.safeParse(body);
    if (!parsedUpdate.success)
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    const data: any = {};
    const updatable = ["firstName", "lastName", "email", "isActive"];
    updatable.forEach((k) => {
      if (k in parsedUpdate.data) data[k] = (parsedUpdate.data as any)[k];
    });
    if (parsedUpdate.data.dateOfBirth)
      data.dateOfBirth = new Date(parsedUpdate.data.dateOfBirth);
    if (parsedUpdate.data.enrollmentDate)
      data.enrollmentDate = new Date(parsedUpdate.data.enrollmentDate);
    if (Object.hasOwn(parsedUpdate.data, "graduationDate"))
      data.graduationDate = parsedUpdate.data.graduationDate
        ? new Date(parsedUpdate.data.graduationDate)
        : null;

    const updated = await prisma.student.update({ where: { id }, data });
    return NextResponse.json({ success: true, student: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    if (user.role !== "SUPER_ADMIN") {
      const link = await prisma.studentInstitution.findFirst({
        where: { studentId: id, institutionId: user.institutionId! },
      });
      if (!link)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Delete student (will cascade StudentInstitution due to schema onDelete: Cascade)
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
