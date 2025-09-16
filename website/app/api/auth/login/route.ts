import prisma from "@/lib/prisma";
import { getWalletAddressFromHeaders } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const headerAddress = getWalletAddressFromHeaders(request.headers);

    const body = await request.json().catch(() => ({}));
    const schema = z.object({ walletAddress: z.string().optional() });
    const parsed = schema.safeParse(body);
    const bodyWallet = parsed.success ? parsed.data.walletAddress : undefined;
    const walletAddress = (headerAddress || bodyWallet || "") as string;

    if (!walletAddress)
      return NextResponse.json(
        { error: "walletAddress required" },
        { status: 400 }
      );

    // Try to find existing user by wallet
    let user = await prisma.user.findUnique({ where: { walletAddress } });

    if (!user) {
      // If no users exist yet, make the first created user SUPER_ADMIN
      const userCount = await prisma.user.count();
      user = await prisma.user.create({
        data: {
          walletAddress,
          role: userCount === 0 ? "SUPER_ADMIN" : null,
        },
      });
    }

    return NextResponse.json({ success: true, user });
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
