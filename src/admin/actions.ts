"use server";
import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MEDIA_DIR, db, setSetting, getSetting } from "@/lib/db";
import { byId, remove, save } from "@/lib/content";
import { checkLogin, hashPassword, logAction, makeSession, requireAdmin, sessionCookie, type Role } from "@/lib/auth";
import { SCHEMA } from "./schema";
import type { ContentType } from "@/lib/types";

type Res = { ok: true; id?: number; msg?: string } | { ok: false; error: string };
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const BASE: Record<string, string> = { product: "prodotti", tech: "tecnologie", case: "casi-studio", news: "news", application: "applicazioni" };
const all = () => revalidatePath("/", "layout");

// ---------- sessione
export async function login(_: unknown, fd: FormData) {
  const u = checkLogin(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
  if (!u) { await new Promise((r) => setTimeout(r, 800)); return { error: "Email o password non corretti." }; }
  if (u.id) db().prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").run(u.id);
  (await cookies()).set(sessionCookie(await makeSession(u.id)));
  logAction(u, "ha effettuato l'accesso");
  redirect("/admin");
}
export async function logout() {
  (await cookies()).delete("ld_admin");
  redirect("/admin/login");
}

// ---------- contenuti
export async function saveContent(type: ContentType, id: number | null, payload: { slug_it: string; slug_en: string; status: string; sort: number; data: any }): Promise<Res> {
  const u = await requireAdmin();
  const slug_it = slugify(payload.slug_it), slug_en = slugify(payload.slug_en) || slug_it;
  if (!slug_it) return { ok: false, error: "Lo slug italiano è obbligatorio." };
  const dup = db().prepare("SELECT id FROM content WHERE type=? AND (slug_it=? OR slug_en=?) AND id<>?").get(type, slug_it, slug_en, id ?? 0);
  if (dup) return { ok: false, error: "Questo slug è già usato da un altro contenuto." };
  const prev = id ? byId(id) : null;
  const nid = save({ id: id ?? undefined, type, slug_it, slug_en, data: payload.data, status: payload.status === "draft" ? "draft" : "published", sort: Number(payload.sort) || 0 });
  if (prev && BASE[type] && prev.slug_it !== slug_it)
    db().prepare("INSERT OR REPLACE INTO redirects(from_path,to_path,code,note) VALUES(?,?,301,?)").run(`/${BASE[type]}/${prev.slug_it}`, `/${BASE[type]}/${slug_it}`, "cambio slug dall'admin");
  logAction(u, id ? "ha modificato" : "ha creato", `${SCHEMA[type].label}: ${SCHEMA[type].title(payload.data) || slug_it}`, `/admin/content/${type}/${nid}`);
  all();
  return { ok: true, id: nid };
}
export async function deleteContent(type: ContentType, id: number): Promise<Res> {
  const u = await requireAdmin();
  const r = byId(id);
  if (!r) return { ok: false, error: "Contenuto non trovato." };
  remove(id);
  logAction(u, "ha eliminato", `${SCHEMA[type].label}: ${SCHEMA[type].title(r.data) || r.slug_it}`);
  all();
  return { ok: true };
}
export async function duplicateContent(id: number): Promise<Res> {
  const u = await requireAdmin();
  const r = byId(id);
  if (!r) return { ok: false, error: "Contenuto non trovato." };
  let n = 2, si = `${r.slug_it}-copia`, se = `${r.slug_en}-copy`;
  while (db().prepare("SELECT 1 FROM content WHERE type=? AND (slug_it=? OR slug_en=?)").get(r.type, si, se)) { si = `${r.slug_it}-copia-${n}`; se = `${r.slug_en}-copy-${n}`; n++; }
  const nid = save({ type: r.type, slug_it: si, slug_en: se, data: r.data, status: "draft", sort: r.sort + 1 });
  logAction(u, "ha duplicato", `${SCHEMA[r.type].label}: ${SCHEMA[r.type].title(r.data)}`, `/admin/content/${r.type}/${nid}`);
  return { ok: true, id: nid };
}
export async function bulkContent(ids: number[], op: "publish" | "draft" | "delete"): Promise<Res> {
  const u = await requireAdmin();
  if (!ids.length) return { ok: false, error: "Nessun elemento selezionato." };
  const q = op === "delete" ? db().prepare("DELETE FROM content WHERE id=?") : db().prepare("UPDATE content SET status=?, updated=datetime('now') WHERE id=?");
  db().transaction(() => ids.forEach((id) => (op === "delete" ? q.run(id) : q.run(op === "publish" ? "published" : "draft", id))))();
  logAction(u, op === "delete" ? "ha eliminato" : op === "publish" ? "ha pubblicato" : "ha messo in bozza", `${ids.length} contenuti`);
  all();
  return { ok: true, msg: `${ids.length} elementi aggiornati.` };
}
export async function reorderContent(ids: number[]): Promise<Res> {
  await requireAdmin();
  const q = db().prepare("UPDATE content SET sort=? WHERE id=?");
  db().transaction(() => ids.forEach((id, i) => q.run(i, id)))();
  all();
  return { ok: true };
}

// ---------- impostazioni (solo admin)
export async function saveSite(patch: Record<string, unknown>): Promise<Res> {
  const u = await requireAdmin("admin");
  setSetting("site", { ...getSetting<Record<string, unknown>>("site", {}), ...patch });
  logAction(u, "ha modificato le impostazioni", Object.keys(patch).join(", "), "/admin/settings");
  all();
  return { ok: true };
}

// ---------- media
const OK = /\.(jpe?g|png|webp|avif|gif|svg|pdf|mp4|webm)$/i;
export async function uploadMedia(fd: FormData): Promise<string[]> {
  const u = await requireAdmin();
  const out: string[] = [];
  for (const f of fd.getAll("files") as File[]) {
    if (!f || !f.size || !OK.test(f.name) || f.size > 25 * 1024 * 1024) continue;
    const ext = path.extname(f.name).toLowerCase();
    const base = slugify(path.basename(f.name, ext)) || "file";
    let name = base + ext, i = 2;
    while (fs.existsSync(path.join(MEDIA_DIR, name))) name = `${base}-${i++}${ext}`;
    fs.writeFileSync(path.join(MEDIA_DIR, name), Buffer.from(await f.arrayBuffer()));
    db().prepare("INSERT OR IGNORE INTO media(file,size,provisional) VALUES(?,?,0)").run(name, f.size);
    out.push(name);
  }
  if (out.length) logAction(u, "ha caricato", out.length === 1 ? out[0] : `${out.length} file`, "/admin/media");
  revalidatePath("/admin/media");
  return out;
}
/** Sostituisce il file mantenendo lo stesso nome: tutte le pagine che lo usano si aggiornano. */
export async function replaceMedia(file: string, fd: FormData): Promise<Res> {
  const u = await requireAdmin();
  const f = fd.get("file") as File | null;
  if (!f || !f.size) return { ok: false, error: "Nessun file." };
  if (path.extname(f.name).toLowerCase() !== path.extname(file).toLowerCase()) return { ok: false, error: `Il nuovo file deve avere lo stesso formato (${path.extname(file)}).` };
  const p = path.resolve(MEDIA_DIR, file);
  if (!p.startsWith(MEDIA_DIR + path.sep)) return { ok: false, error: "Percorso non valido." };
  fs.writeFileSync(p, Buffer.from(await f.arrayBuffer()));
  // le versioni ridimensionate in cache mostrerebbero ancora la foto vecchia
  fs.rmSync(path.join(process.cwd(), ".next", "cache", "images"), { recursive: true, force: true });
  db().prepare("UPDATE media SET size=?, provisional=0 WHERE file=?").run(f.size, file);
  logAction(u, "ha sostituito l'immagine", file, "/admin/media");
  all();
  return { ok: true };
}
export async function updateMedia(file: string, alt_it: string, alt_en: string, provisional: boolean, note: string): Promise<Res> {
  const u = await requireAdmin();
  db().prepare("UPDATE media SET alt_it=?, alt_en=?, provisional=?, note=? WHERE file=?").run(alt_it, alt_en, provisional ? 1 : 0, note, file);
  logAction(u, "ha modificato i testi alternativi", file, "/admin/media");
  all();
  return { ok: true };
}
export async function deleteMedia(file: string): Promise<Res> {
  const u = await requireAdmin();
  const used = (db().prepare("SELECT COUNT(*) n FROM content WHERE data LIKE ?").get(`%"${file}"%`) as { n: number }).n;
  if (used) return { ok: false, error: `È usata in ${used} contenuti: toglila da lì prima di eliminarla.` };
  const p = path.resolve(MEDIA_DIR, file);
  if (p.startsWith(MEDIA_DIR + path.sep) && fs.existsSync(p)) fs.unlinkSync(p);
  db().prepare("DELETE FROM media WHERE file=?").run(file);
  logAction(u, "ha eliminato l'immagine", file);
  revalidatePath("/admin/media");
  return { ok: true };
}

// ---------- richieste
const LEAD_FIELDS = ["kind", "lang", "name", "company", "email", "phone", "country", "message", "status", "notes"] as const;
export async function saveLead(id: number | null, v: Record<string, string>): Promise<Res> {
  const u = await requireAdmin();
  if (!v.name?.trim()) return { ok: false, error: "Il nome è obbligatorio." };
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) return { ok: false, error: "Email non valida." };
  const row = Object.fromEntries(LEAD_FIELDS.map((k) => [k, (v[k] ?? "").trim()]));
  if (id) {
    db().prepare(`UPDATE leads SET ${LEAD_FIELDS.map((k) => `${k}=@${k}`).join(", ")} WHERE id=@id`).run({ ...row, id });
  } else {
    const r = db().prepare(`INSERT INTO leads(${LEAD_FIELDS.join(",")},page) VALUES(${LEAD_FIELDS.map((k) => "@" + k).join(",")},'inserita a mano')`).run({ ...row, kind: row.kind || "info", lang: row.lang || "it", status: row.status || "new" });
    id = Number(r.lastInsertRowid);
  }
  logAction(u, "ha aggiornato la richiesta", v.name, `/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  return { ok: true, id };
}
export async function setLeadStatus(id: number, status: string): Promise<Res> {
  const u = await requireAdmin();
  db().prepare("UPDATE leads SET status=? WHERE id=?").run(status, id);
  logAction(u, `ha spostato la richiesta in «${status}»`, `#${id}`, `/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  return { ok: true };
}
export async function deleteLeads(ids: number[]): Promise<Res> {
  const u = await requireAdmin();
  const q = db().prepare("DELETE FROM leads WHERE id=?");
  db().transaction(() => ids.forEach((id) => q.run(id)))();
  logAction(u, "ha eliminato", `${ids.length} richieste`);
  revalidatePath("/admin/leads");
  return { ok: true };
}

// ---------- redirect
const normPath = (p: string) => "/" + p.trim().replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "");
export async function saveRedirect(orig: string | null, v: { from: string; to: string; code: number; note: string }): Promise<Res> {
  const u = await requireAdmin();
  const from = normPath(v.from), code = [301, 302, 410].includes(Number(v.code)) ? Number(v.code) : 301, to = v.to.trim();
  if (from === "/") return { ok: false, error: "Indica il percorso di partenza." };
  if (code !== 410 && !to) return { ok: false, error: "Indica la destinazione (o scegli 410)." };
  db().transaction(() => {
    if (orig && orig !== from) db().prepare("DELETE FROM redirects WHERE from_path=?").run(orig);
    db().prepare("INSERT OR REPLACE INTO redirects(from_path,to_path,code,note) VALUES(?,?,?,?)").run(from, code === 410 ? "" : to, code, v.note ?? "");
  })();
  logAction(u, orig ? "ha modificato il redirect" : "ha aggiunto il redirect", from, "/admin/redirects");
  revalidatePath("/admin/redirects");
  return { ok: true };
}
export async function deleteRedirects(froms: string[]): Promise<Res> {
  const u = await requireAdmin();
  const q = db().prepare("DELETE FROM redirects WHERE from_path=?");
  db().transaction(() => froms.forEach((f) => q.run(f)))();
  logAction(u, "ha eliminato", `${froms.length} redirect`, "/admin/redirects");
  revalidatePath("/admin/redirects");
  return { ok: true };
}
/** Import: una riga per redirect, «vecchio-percorso nuovo-percorso [codice]». */
export async function importRedirects(text: string): Promise<Res> {
  const u = await requireAdmin();
  const rows = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => l.split(/[\s,;]+/));
  const q = db().prepare("INSERT OR REPLACE INTO redirects(from_path,to_path,code,note) VALUES(?,?,?,'import')");
  let n = 0;
  db().transaction(() => rows.forEach(([a, b, c]) => {
    const code = Number(c) || (b === "410" ? 410 : 301);
    if (!a) return;
    q.run(normPath(a), code === 410 ? "" : b ?? "", code); n++;
  }))();
  logAction(u, "ha importato", `${n} redirect`, "/admin/redirects");
  revalidatePath("/admin/redirects");
  return { ok: true, msg: `${n} redirect importati.` };
}

// ---------- checklist
export async function saveTodo(id: number | null, v: { grp: string; text: string; note: string; done?: boolean }): Promise<Res> {
  const u = await requireAdmin();
  if (!v.text.trim()) return { ok: false, error: "Scrivi il testo della voce." };
  if (id) db().prepare("UPDATE todo SET grp=?, text=?, note=?, done=? WHERE id=?").run(v.grp || "Altro", v.text.trim(), v.note ?? "", v.done ? 1 : 0, id);
  else id = Number(db().prepare("INSERT INTO todo(grp,text,note) VALUES(?,?,?)").run(v.grp || "Altro", v.text.trim(), v.note ?? "").lastInsertRowid);
  logAction(u, "ha aggiornato la checklist", v.text.slice(0, 60), "/admin/todo");
  revalidatePath("/admin/todo"); revalidatePath("/admin");
  return { ok: true, id };
}
export async function toggleTodo(id: number, done: boolean): Promise<Res> {
  const u = await requireAdmin();
  db().prepare("UPDATE todo SET done=? WHERE id=?").run(done ? 1 : 0, id);
  if (done) logAction(u, "ha chiuso una voce della checklist", String((db().prepare("SELECT text FROM todo WHERE id=?").get(id) as any)?.text ?? "").slice(0, 60), "/admin/todo");
  revalidatePath("/admin/todo"); revalidatePath("/admin");
  return { ok: true };
}
export async function deleteTodo(id: number): Promise<Res> {
  await requireAdmin();
  db().prepare("DELETE FROM todo WHERE id=?").run(id);
  revalidatePath("/admin/todo");
  return { ok: true };
}

// ---------- utenti (solo admin)
export async function saveUser(id: number | null, v: { email: string; name: string; role: Role; password?: string }): Promise<Res> {
  const u = await requireAdmin("admin");
  const email = v.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Email non valida." };
  if (v.password && v.password.length < 10) return { ok: false, error: "La password deve avere almeno 10 caratteri." };
  if (!id && !v.password) return { ok: false, error: "Imposta una password per il nuovo utente." };
  const role: Role = v.role === "admin" ? "admin" : "editor";
  if (db().prepare("SELECT 1 FROM users WHERE email=? AND id<>?").get(email, id ?? 0)) return { ok: false, error: "Esiste già un utente con questa email." };
  if (id) {
    db().prepare("UPDATE users SET email=?, name=?, role=? WHERE id=?").run(email, v.name.trim(), role, id);
    if (v.password) db().prepare("UPDATE users SET hash=? WHERE id=?").run(hashPassword(v.password), id);
  } else id = Number(db().prepare("INSERT INTO users(email,name,role,hash) VALUES(?,?,?,?)").run(email, v.name.trim(), role, hashPassword(v.password!)).lastInsertRowid);
  logAction(u, "ha aggiornato l'utente", email, "/admin/users");
  revalidatePath("/admin/users");
  return { ok: true, id };
}
export async function deleteUser(id: number): Promise<Res> {
  const u = await requireAdmin("admin");
  if (id === u.id) return { ok: false, error: "Non puoi eliminare il tuo account." };
  const row = db().prepare("SELECT email FROM users WHERE id=?").get(id) as { email: string } | undefined;
  db().prepare("DELETE FROM users WHERE id=?").run(id);
  logAction(u, "ha eliminato l'utente", row?.email ?? "");
  revalidatePath("/admin/users");
  return { ok: true };
}
export async function changeOwnPassword(current: string, next: string): Promise<Res> {
  const u = await requireAdmin();
  if (!u.id) return { ok: false, error: "L'account di emergenza si cambia in .env.local (ADMIN_PASSWORD)." };
  if (!checkLogin(u.email, current)) return { ok: false, error: "La password attuale non è corretta." };
  if (next.length < 10) return { ok: false, error: "La nuova password deve avere almeno 10 caratteri." };
  db().prepare("UPDATE users SET hash=? WHERE id=?").run(hashPassword(next), u.id);
  logAction(u, "ha cambiato la propria password");
  return { ok: true };
}
