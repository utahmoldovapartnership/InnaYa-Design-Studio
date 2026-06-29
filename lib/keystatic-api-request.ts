import fs from "fs";
import path from "path";

const API_GENERIC_FILE = path.join(
  process.cwd(),
  "node_modules",
  "@keystatic",
  "core",
  "dist",
  "keystatic-core-api-generic.node.react-server.js",
);

function keystaticApiUsesLegacyEditParser(): boolean {
  try {
    const source = fs.readFileSync(API_GENERIC_FILE, "utf8");
    return source.includes("pathname.replace(/^\\/api\\/edit");
  } catch {
    return false;
  }
}

const useLegacyEditApiPrefix = keystaticApiUsesLegacyEditParser();

export function normalizeKeystaticApiRequest(request: Request): Request {
  const url = new URL(request.url);

  if (
    useLegacyEditApiPrefix &&
    url.pathname.startsWith("/api/keystatic/")
  ) {
    url.pathname = url.pathname.replace(
      /^\/api\/keystatic/,
      "/api/edit",
    );
    return new Request(url.toString(), request);
  }

  return request;
}
