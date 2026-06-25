import { NextResponse } from "next/server";
import { getAllProjectMediaPreviews } from "@/lib/admin-project-media";

export async function GET() {
  const projects = await getAllProjectMediaPreviews();
  return NextResponse.json(projects);
}
