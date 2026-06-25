import { NextResponse } from "next/server";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";
import { getProjectMediaPreview } from "@/lib/admin-project-media";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const { slug } = await context.params;
  const project = await getProjectMediaPreview(slug);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
