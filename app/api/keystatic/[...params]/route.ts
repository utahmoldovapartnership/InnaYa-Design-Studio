import { makeRouteHandler } from "@keystatic/next/route-handler";
import { preserveProjectMediaInUpdateRequest } from "@/lib/preserve-project-media-on-save";
import config from "../../../../keystatic.config";

const keystatic = makeRouteHandler({ config });

export const GET = keystatic.GET;

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (url.pathname.endsWith("/update")) {
    const body = await request.json();
    const patched = await preserveProjectMediaInUpdateRequest(body);

    request = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(patched),
    });
  }

  return keystatic.POST(request);
}
