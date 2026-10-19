import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { SCHEMA } from "@/admin/schema";
import type { ContentType } from "@/lib/types";

/** Indice per la ricerca rapida (⌘K): contenuti, richieste, immagini. */
export async function GET() {
  if (!(await currentUser())) return new NextResponse("Unauthorized", { status: 401 });
  const out: { group: string; label: string; href: string; hint?: string }[] = [];
  for (const r of db().prepare("SELECT id, type, slug_it, data, status FROM content ORDER BY type, sort").all() as any[]) {
    const sc = SCHEMA[r.type as ContentType]; const d = JSON.parse(r.data);
    out.push({ group: sc.plural, label: sc.title(d) || r.slug_it, href: `/admin/content/${r.type}/${r.id}`, hint: r.status === "draft" ? "bozza" : r.slug_it });
  }
  for (const l of db().prepare("SELECT id, name, company, kind FROM leads ORDER BY id DESC LIMIT 200").all() as any[])
    out.push({ group: "Richieste", label: `${l.name}${l.company ? " · " + l.company : ""}`, href: `/admin/leads/${l.id}`, hint: l.kind });
  for (const m of db().prepare("SELECT file FROM media ORDER BY file").all() as any[]) out.push({ group: "Media", label: m.file, href: `/admin/media?f=${encodeURIComponent(m.file)}` });
  return NextResponse.json(out);
}
