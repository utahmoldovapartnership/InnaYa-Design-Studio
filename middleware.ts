import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|uk|ru)/:path*",
    "/((?!api|edit|_next|_vercel|.*\\..*).*)",
  ],
};
