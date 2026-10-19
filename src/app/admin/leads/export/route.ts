import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;
export async function GET() {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const rows = db().prepare("SELECT * FROM leads ORDER BY id DESC").all() as any[];
  const head = ["id", "data", "tipo", "lingua", "nome", "azienda", "email", "telefono", "paese", "stato", "newsletter", "dati", "messaggio", "note"];
  const csv = [head.join(","), ...rows.map((l) => [l.id, l.created, l.kind, l.lang, l.name, l.company, l.email, l.phone, l.country, l.status, l.marketing, l.data, l.message, l.notes].map(q).join(","))].join("\n");
  return new NextResponse("﻿" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="richieste-ledica.csv"' } });
}
