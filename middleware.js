// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // on protège tout ce qui commence par /admin (sauf /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminCookie = req.cookies.get("admin");

    if (!adminCookie || adminCookie.value !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
