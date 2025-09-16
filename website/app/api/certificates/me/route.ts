import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (user.role === "SUPER_ADMIN") {
      const certificates = await prisma.certificate.findMany({
        orderBy: { issueDate: "desc" },
      });
      return NextResponse.json({ certificates });
    }

    if (user.role === "INSTITUTION_ADMIN" || user.role === "STAFF") {
      if (!user.institutionId) return NextResponse.json({ certificates: [] });

      const certificates = await prisma.certificate.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { issueDate: "desc" },
      });

      return NextResponse.json({ certificates });
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!student) return NextResponse.json({ certificates: [] });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: student.id },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
