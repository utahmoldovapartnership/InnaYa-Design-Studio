import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isEditPath(pathname: string): boolean {
  return pathname === "/edit" || pathname.startsWith("/edit/");
}

function isLocalePrefixedEditPath(pathname: string): boolean {
  return /^\/(en|uk|ru)\/edit(\/.*)?$/.test(pathname);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLocalePrefixedEditPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(en|uk|ru)/, "");
    return NextResponse.redirect(url);
  }

  if (isEditPath(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(en|uk|ru)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
