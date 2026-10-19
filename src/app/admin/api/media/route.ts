import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json(db().prepare("SELECT file, alt_it, provisional FROM media ORDER BY created DESC, file").all());
}
