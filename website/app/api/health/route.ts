import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Simple DB check
    await prisma.$queryRaw`SELECT 1`;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  }
}
