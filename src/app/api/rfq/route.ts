import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { DATA_DIR, db } from "@/lib/db";
import { getSite } from "@/lib/site";
import { sendMail } from "@/lib/mail";
import { dict } from "@/lib/dict";

export const runtime = "nodejs";
const MAX_FILES = 3, MAX_SIZE = 8 * 1024 * 1024;
const OK_EXT = /\.(pdf|dwg|dxf|stp|step|jpe?g|png|webp|avif|heic)$/i;
const s = (v: FormDataEntryValue | null, n = 2000) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  // honeypot / troppo veloce: rispondiamo ok senza salvare
  if (s(fd.get("website")) || Number(s(fd.get("elapsed"))) < 2500) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const now = Date.now();
  db().prepare("DELETE FROM rate WHERE ts < ?").run(now - 3600_000);
  const n = (db().prepare("SELECT COUNT(*) n FROM rate WHERE ip=?").get(ipHash) as { n: number }).n;
  if (n >= 6) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  db().prepare("INSERT INTO rate(ip,ts) VALUES(?,?)").run(ipHash, now);

  const lang = s(fd.get("lang")) === "en" ? "en" : "it";
  const kind = ["test", "quote", "retrofit", "spare", "info", "contact"].includes(s(fd.get("kind"))) ? s(fd.get("kind")) : "info";
  const name = s(fd.get("name"), 200), email = s(fd.get("email"), 200);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !s(fd.get("consent"))) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const data: Record<string, string> = {};
  for (const k of ["material", "thickness", "diameter", "product", "norm", "current", "speed", "goal", "mill"]) { const v = s(fd.get(k), 300); if (v) data[k] = v; }

  const files = (fd.getAll("files") as File[]).filter((f) => f && f.size > 0).slice(0, MAX_FILES);
  const saved: string[] = [];
  const dir = path.join(DATA_DIR, "uploads", "leads");
  fs.mkdirSync(dir, { recursive: true });
  for (const f of files) {
    if (f.size > MAX_SIZE || !OK_EXT.test(f.name)) continue;
    const fname = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}-${f.name.replace(/[^\w.\-]/g, "_").slice(-80)}`;
    fs.writeFileSync(path.join(dir, fname), Buffer.from(await f.arrayBuffer()));
    saved.push(fname);
  }
  if (saved.length) data.files = saved.join(", ");

  const r = db().prepare(`INSERT INTO leads(kind,lang,name,company,email,phone,country,message,data,page,marketing) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
    .run(kind, lang, name, s(fd.get("company"), 200), email, s(fd.get("phone"), 60), s(fd.get("country"), 100), s(fd.get("message")), JSON.stringify(data), s(fd.get("page"), 300), s(fd.get("marketing")) ? 1 : 0);

  // notifica interna + risposta automatica (solo se SMTP configurato; il lead è già salvato)
  const site = getSite();
  const to = kind === "spare" || kind === "retrofit" ? site.routing.service : site.routing.sales;
  const lines = [`Tipo: ${kind}`, `Lingua: ${lang}`, `Nome: ${name}`, `Azienda: ${s(fd.get("company"))}`, `Email: ${email}`, `Tel: ${s(fd.get("phone"))}`, `Paese: ${s(fd.get("country"))}`, ...Object.entries(data).map(([k, v]) => `${k}: ${v}`), "", s(fd.get("message")), "", `Admin: ${process.env.SITE_URL ?? ""}/admin/leads/${r.lastInsertRowid}`];
  try {
    await sendMail({ to, subject: `[Sito] Nuova richiesta ${kind} — ${name}`, text: lines.join("\n"), replyTo: email });
    const t = dict(lang);
    await sendMail({ to: email, subject: lang === "it" ? "LE.DI.CA. — abbiamo ricevuto la tua richiesta" : "LE.DI.CA. — we received your request", text: `${t.f_ok_title}\n\n${t.f_ok_body}\n\nLE.DI.CA. Srl\n${site.company.phone}` });
  } catch (e) { console.error("mail", e); }
  return NextResponse.json({ ok: true });
}
