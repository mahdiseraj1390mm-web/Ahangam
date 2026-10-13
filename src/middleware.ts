import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes at the HTTP protocol layer
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("ahangam_session")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl, 307);
    }

    try {
      const parts = sessionCookie.split(".");
      if (parts.length !== 3) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl, 307);
      }
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const session = JSON.parse(jsonPayload);
      if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url), 307);
      }
    } catch {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
