import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";
import {
  certificateQuerySchema,
  createCertificateSchema,
  updateCertificateSchema,
} from "@/lib/validations";
import {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/services/certificate";
import { AuthorizationError, ValidationError } from "@/lib/services/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = certificateQuerySchema.safeParse(queryParams);

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.issues },
        { status: 400 }
      );
    }

    // For single certificate lookup by ID, allow public access
    if (query.data.id) {
      try {
        const certificate = await getCertificateById(query.data.id);
        if (!certificate) {
          return NextResponse.json(
            { error: "Certificate not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ certificate });
      } catch (error) {
        if (error instanceof AuthorizationError) {
          return NextResponse.json({ error: error.message }, { status: 403 });
        }
        throw error;
      }
    }

    // For listing certificates, require authentication
    const user = await authenticate(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { certificates, total } = await getCertificates(
      query.data,
      user.institutionId,
      user.role === "SUPER_ADMIN"
    );

    return NextResponse.json({
      certificates,
      pagination: {
        page: query.data.page,
        limit: query.data.limit,
        total,
        totalPages: Math.ceil(total / query.data.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/certificates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validation = createCertificateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const certificate = await createCertificate(
      validation.data,
      user.institutionId,
      user.role === "SUPER_ADMIN"
    );

    return NextResponse.json({ success: true, certificate }, { status: 201 });
  } catch (error) {
    console.error("POST /api/certificates error:", error);

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

export async function PUT(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validation = updateCertificateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const certificate = await updateCertificate(
      validation.data,
      user.institutionId,
      user.role === "SUPER_ADMIN"
    );

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("PUT /api/certificates error:", error);

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

export async function DELETE(request: Request) {
  try {
    const user = await authenticate(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await deleteCertificate(
      id,
      user.institutionId,
      user.role === "SUPER_ADMIN"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/certificates error:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
