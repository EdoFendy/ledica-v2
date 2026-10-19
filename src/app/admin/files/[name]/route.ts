import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

/** Allegati delle richieste: solo per l'admin loggato. */
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { name } = await params;
  const dir = path.join(DATA_DIR, "uploads", "leads");
  const file = path.resolve(dir, path.basename(decodeURIComponent(name)));
  if (!file.startsWith(dir + path.sep) || !fs.existsSync(file)) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(fs.readFileSync(file), { headers: { "content-disposition": `attachment; filename="${path.basename(file)}"` } });
}
