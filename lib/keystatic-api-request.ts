const LEGACY_API_PREFIX = "/api/edit";

function rewriteToLegacyEditPrefix(request: Request): Request {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/keystatic/")) {
    return request;
  }

  url.pathname = url.pathname.replace(/^\/api\/keystatic/, LEGACY_API_PREFIX);
  return new Request(url.toString(), request);
}

function isGithubAuthPath(pathname: string): boolean {
  return pathname.startsWith("/api/keystatic/github/");
}

export async function callKeystaticApi(
  handler: (request: Request) => Promise<Response>,
  request: Request,
): Promise<Response> {
  const response = await handler(request);

  if (response.status !== 404) {
    return response;
  }

  const pathname = new URL(request.url).pathname;
  if (!isGithubAuthPath(pathname)) {
    return response;
  }

  const legacyRequest = rewriteToLegacyEditPrefix(request);
  if (legacyRequest.url === request.url) {
    return response;
  }

  return handler(legacyRequest);
}
