import { NextResponse } from "next/server";
import {
  getPageMediaPreview,
  type PageId,
} from "@/lib/admin-page-media";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";

type RouteContext = {
  params: Promise<{ page: string }>;
};

function isPageId(value: string): value is PageId {
  return value === "home" || value === "about" || value === "technologies";
}

export async function GET(_request: Request, context: RouteContext) {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const { page } = await context.params;
  if (!isPageId(page)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(await getPageMediaPreview(page));
}
