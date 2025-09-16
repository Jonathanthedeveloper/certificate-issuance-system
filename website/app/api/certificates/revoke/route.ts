import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";
import { revokeCertificateSchema } from "@/lib/validations";
import { revokeCertificate } from "@/lib/services/certificate";
import { AuthorizationError, ValidationError } from "@/lib/services/auth";

export async function PATCH(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validation = revokeCertificateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const certificate = await revokeCertificate(
      validation.data,
      user.institutionId,
      user.role === "SUPER_ADMIN"
    );

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("PATCH /api/certificates/revoke error:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
