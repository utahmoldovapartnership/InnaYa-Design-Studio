import { NextResponse } from "next/server";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";
import { fetchProjectYamlFromGithub } from "@/lib/github-project-yaml";
import { isProjectYamlPath } from "@/lib/merge-project-media";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const { path: pathParts } = await context.params;
  const relativePath = pathParts.join("/");

  if (!isProjectYamlPath(relativePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const branch = url.searchParams.get("branch") ?? "main";
  const yamlText = await fetchProjectYamlFromGithub(
    relativePath,
    branch,
    request,
  );

  if (!yamlText) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(yamlText, {
    headers: { "Content-Type": "text/yaml; charset=utf-8" },
  });
}
