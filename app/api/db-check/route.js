import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("DB CHECK ERROR", err);
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}
