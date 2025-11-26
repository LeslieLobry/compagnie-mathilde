// app/api/admin/login/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.json();
  const { password } = data;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // cookie très simple (à sécuriser en prod)
  res.cookies.set("admin", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4, // 4h
  });

  return res;
}
