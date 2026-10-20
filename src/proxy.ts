import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api")) return NextResponse.next();
  const loggedIn = Boolean(request.auth);
  if (!loggedIn && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (loggedIn && path === "/login") {
    return NextResponse.redirect(new URL("/today", request.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|icon-192.png|icon-512.png|manifest.webmanifest).*)"],
};
