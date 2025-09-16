import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";
import type { Student } from "@/lib/generated/prisma";

export async function GET(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    let students: Student[] = [];
    if (user.role === "SUPER_ADMIN")
      students = await prisma.student.findMany({
        include: {
          institutions: true,
          certificates: true,
          user: true,
        },
      });

    if (
      (user.role === "STAFF" || user.role === "INSTITUTION_ADMIN") &&
      user.institutionId
    ) {
      const studentInstitutions = await prisma.studentInstitution.findMany({
        where: {
          institutionId: user.institutionId,
        },
        include: {
          student: {
            include: {
              institutions: true,
              certificates: true,
              user: true,
            },
          },
        },
      });

      students = studentInstitutions.map((si) => si.student);
    }

    return NextResponse.json({ students });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
