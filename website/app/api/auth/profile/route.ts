import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await authenticate((request as any).headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const full = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        institution: true,
        student: {
          include: {
            institutions: true,
            certificates: true,
          },
        },
      },
    });
    if (!full)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json(full);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
