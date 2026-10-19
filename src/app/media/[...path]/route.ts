import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { MEDIA_DIR } from "@/lib/db";

export const runtime = "nodejs";
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm" };

export async function GET(_: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = path.resolve(MEDIA_DIR, ...parts.map(decodeURIComponent));
  if (!file.startsWith(MEDIA_DIR + path.sep) || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const buf = fs.readFileSync(file);
  return new Response(buf, { headers: { "content-type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
