import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/utils";
import { z } from "zod";

const querySchema = z.object({
  id: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // Parse search params into a plain object for zod to validate
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.safeParse(params);
    const id = parsed.success ? parsed.data.id : undefined;

    if (id) {
      const institution = await prisma.institution.findUnique({
        where: { id },
      });

      if (!institution)
        return NextResponse.json({ error: "not_found" }, { status: 404 });

      return NextResponse.json({ institution });
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ institutions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string(),
  type: z.string().default("Other"),
  country: z.string().default(""),
  state: z.string().default(""),
  city: z.string().default(""),
  phoneNumber: z.string().optional().default(""),
  address: z.string().optional().default(""),
  website: z.string().optional().default(""),
  walletAddress: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await authenticate((request as any).headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (user.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = await request.json().catch(() => ({}));

    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const {
      name,
      type,
      country,
      state,
      city,
      phoneNumber,
      address,
      website,
      walletAddress,
    } = parsed.data;

    const institution = await prisma.institution.create({
      data: {
        name,
        type,
        country,
        state,
        city,
        phoneNumber: phoneNumber ?? undefined,
        address,
        website,
      },
    });

    // If a wallet address is provided, create an institution admin user for it
    let createdUser = null;
    if (walletAddress) {
      try {
        createdUser = await prisma.user.create({
          data: {
            walletAddress,
            // store role as string matching the enum in the schema
            role: "INSTITUTION_ADMIN",
            firstName: "Institution",
            lastName: "Admin",
            institutionId: institution.id,
          },
        });
      } catch (e) {
        console.warn("failed creating admin user for institution", e);
      }
    }

    return NextResponse.json({ success: true, institution, user: createdUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticate((request as any).headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (user.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const updateSchema = z.object({
      id: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      website: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    const { id } = parsed.data;
    const name = parsed.data.name;
    const type = parsed.data.type;
    const country = parsed.data.country;
    const state = parsed.data.state;
    const city = parsed.data.city;
    const phoneNumber = parsed.data.phoneNumber;
    const address = parsed.data.address;
    const website = parsed.data.website;

    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    try {
      const updated = await prisma.institution.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          type: type ?? existing.type,
          country: country ?? existing.country,
          state: state ?? existing.state,
          city: city ?? existing.city,
          phoneNumber: phoneNumber ?? existing.phoneNumber,
          address: address ?? existing.address,
          website: website ?? existing.website,
        },
      });
      return NextResponse.json({ success: true, institution: updated });
    } catch (err: any) {
      console.error(err);
      if (err?.code === "P2002") {
        return NextResponse.json({ error: "code_conflict" }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticate((request as any).headers);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (user.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // Accept ?id= or JSON body { id }
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    if (!id) {
      const body = await request.json().catch(() => ({}));
      const delSchema = z.object({ id: z.string() });
      const parsedDel = delSchema.safeParse(body);
      if (!parsedDel.success)
        return NextResponse.json({ error: "id required" }, { status: 400 });
      id = parsedDel.data.id;
    }

    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    await prisma.institution.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
