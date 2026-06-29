import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";
import { callKeystaticApi } from "@/lib/keystatic-api-request";
import { createKeystaticRouteHandler } from "@/lib/keystatic-route-handler";
import { preserveProjectMediaInUpdateRequest } from "@/lib/preserve-project-media-on-save";

const keystatic = createKeystaticRouteHandler();

export async function GET(request: Request) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  return callKeystaticApi(keystatic.GET, request);
}

export async function POST(request: Request) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const url = new URL(request.url);

  if (url.pathname.endsWith("/update")) {
    const body = await request.json();
    const patched = await preserveProjectMediaInUpdateRequest(body, request);

    request = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(patched),
    });
  }

  return callKeystaticApi(keystatic.POST, request);
}
