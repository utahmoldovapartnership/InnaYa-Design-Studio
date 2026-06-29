import { serialize } from "cookie";
import { NextResponse } from "next/server";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";

const KEYSTATIC_ROUTE =
  /^branch\/[^]+(\/collection\/[^/]+(|\/(create|item\/[^/]+))|\/singleton\/[^/]+)?$/;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const reqUrl = new URL(request.url);
  const rawFrom = reqUrl.searchParams.get("from");
  const from =
    typeof rawFrom === "string" && KEYSTATIC_ROUTE.test(rawFrom) ? rawFrom : "/";

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set(
    "redirect_uri",
    `${reqUrl.origin}/api/keystatic/github/oauth/callback`,
  );

  if (from === "/") {
    return NextResponse.redirect(authorize.toString());
  }

  const state = toHex(crypto.getRandomValues(new Uint8Array(10)));
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.headers.append(
    "Set-Cookie",
    serialize(`ks-${state}`, from, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
      path: "/",
      httpOnly: true,
    }),
  );

  return response;
}
