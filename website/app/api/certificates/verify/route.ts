import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const verifySchema = z.object({
  query: z.string().min(1, "Query is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error?.issues ?? [] },
        { status: 400 }
      );
    }

    const { query } = parsed.data;

    // Try to find certificate by certificate number, verification hash,
    // or by on-chain identifiers (PDA pubkey or latest transaction signature).
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: query },
          { verificationHash: query },
          { onChainId: query },
          { latestTxHash: query },
        ],
      },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
            country: true,
            state: true,
            city: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            matricNumber: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          verified: false,
          error: "Certificate not found",
          message: "No certificate found with the provided number or hash",
        },
        { status: 404 }
      );
    }

    // Check if certificate is revoked
    if (certificate.isRevoked) {
      return NextResponse.json({
        verified: false,
        certificate: {
          ...certificate,
          // Serialize dates to ISO strings for client
          issueDate: certificate.issueDate?.toISOString(),
          completionDate: certificate.completionDate?.toISOString(),
          revokedDate: certificate.revokedDate?.toISOString(),
          createdAt: certificate.createdAt?.toISOString(),
          updatedAt: certificate.updatedAt?.toISOString(),
          status: "revoked",
        },
        message: "This certificate has been revoked",
        revokedReason: certificate.revokedReason,
        revokedDate: certificate.revokedDate?.toISOString(),
      });
    }

    // Certificate is valid
    return NextResponse.json({
      verified: true,
      certificate: {
        ...certificate,
        issueDate: certificate.issueDate?.toISOString(),
        completionDate: certificate.completionDate?.toISOString(),
        createdAt: certificate.createdAt?.toISOString(),
        updatedAt: certificate.updatedAt?.toISOString(),
        status: "valid",
      },
      message: "Certificate is valid and authentic",
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET method for URL-based verification (e.g., /api/certificates/verify?q=certificate_number)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Use the same logic as POST
    const fakeRequest = new Request(request.url, {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: { "Content-Type": "application/json" },
    });

    return POST(fakeRequest);
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
