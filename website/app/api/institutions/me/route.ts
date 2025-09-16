import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (user.role === "SUPER_ADMIN") {
      const institutions = await prisma.institution.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ institutions });
    }

    if (user.role === "INSTITUTION_ADMIN" || user.role === "STAFF") {
      if (!user.institutionId) return NextResponse.json({ institutions: [] });

      const institution = await prisma.institution.findUnique({
        where: { id: user.institutionId },
      });

      return NextResponse.json({
        institutions: institution ? [institution] : [],
      });
    }

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { institutions: true },
      });

      if (!student) return NextResponse.json({ institutions: [] });

      const studentInstitutions = await prisma.studentInstitution.findMany({
        where: {
          studentId: student.id,
        },
        include: {
          institution: true,
        },
      });
      return NextResponse.json({
        institutions: studentInstitutions.map((si) => si.institution),
      });
    }

    return NextResponse.json({ institutions: [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
