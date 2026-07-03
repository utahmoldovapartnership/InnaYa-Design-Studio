import { NextResponse } from "next/server";
import {
  getGithubDeployStatus,
  getGithubTokenFromRequest,
} from "@/lib/github-deploy-status";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";

export async function GET(request: Request) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const sha = new URL(request.url).searchParams.get("sha")?.trim();
  if (!sha) {
    return NextResponse.json({ error: "sha is required" }, { status: 400 });
  }

  const status = await getGithubDeployStatus(sha, getGithubTokenFromRequest(request));
  return NextResponse.json(status);
}
