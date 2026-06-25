import { NextResponse } from "next/server";
import { assertKeystaticAdminAccess } from "@/lib/keystatic-admin-access";
import { getAllProjectMediaPreviews } from "@/lib/admin-project-media";

export async function GET() {
  const denied = assertKeystaticAdminAccess();
  if (denied) return denied;

  const projects = await getAllProjectMediaPreviews();
  return NextResponse.json(projects);
}
