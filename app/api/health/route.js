import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    dbHost: process.env.DATABASE_URL?.split("@")?.[1]?.split("/")?.[0],
  });
}
