import { NextResponse } from "next/server";

export function isKeystaticGithubStorage(): boolean {
  const repo = process.env.KEYSTATIC_GITHUB_REPO;
  return Boolean(repo?.includes("/"));
}

export function hasKeystaticGithubSecrets(): boolean {
  return Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
      process.env.KEYSTATIC_SECRET,
  );
}

/** Admin is only public in local dev. Production requires GitHub OAuth. */
export function isKeystaticAdminEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return isKeystaticGithubStorage() && hasKeystaticGithubSecrets();
}

export function adminAccessDeniedResponse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

export function assertKeystaticAdminAccess():
  | NextResponse
  | undefined {
  if (!isKeystaticAdminEnabled()) {
    return adminAccessDeniedResponse();
  }
}
