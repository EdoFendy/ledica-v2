import { db } from "./db";
import type { ContentType, Lang, Row } from "./types";

const parse = (r: any): Row => ({ ...r, data: JSON.parse(r.data || "{}") });

export function list(type: ContentType, opts: { all?: boolean } = {}): Row[] {
  const q = opts.all
    ? "SELECT * FROM content WHERE type=? ORDER BY sort, id"
    : "SELECT * FROM content WHERE type=? AND status='published' ORDER BY sort, id";
  return (db().prepare(q).all(type) as any[]).map(parse);
}
export function byId(id: number): Row | null {
  const r = db().prepare("SELECT * FROM content WHERE id=?").get(id);
  return r ? parse(r) : null;
}
export function bySlug(type: ContentType, lang: Lang, slug: string, all = false): Row | null {
  const col = lang === "en" ? "slug_en" : "slug_it";
  const r = db().prepare(`SELECT * FROM content WHERE type=? AND ${col}=? ${all ? "" : "AND status='published'"}`).get(type, slug);
  return r ? parse(r) : null;
}
export function byKey(type: ContentType, slug_it: string): Row | null {
  const r = db().prepare("SELECT * FROM content WHERE type=? AND slug_it=?").get(type, slug_it);
  return r ? parse(r) : null;
}
export function save(row: { id?: number; type: ContentType; slug_it: string; slug_en: string; data: any; status: string; sort: number }) {
  const d = JSON.stringify(row.data);
  if (row.id) {
    db().prepare("UPDATE content SET slug_it=?, slug_en=?, data=?, status=?, sort=?, updated=datetime('now') WHERE id=?")
      .run(row.slug_it, row.slug_en, d, row.status, row.sort, row.id);
    return row.id;
  }
  const r = db().prepare("INSERT INTO content(type,slug_it,slug_en,data,status,sort) VALUES(?,?,?,?,?,?)")
    .run(row.type, row.slug_it, row.slug_en, d, row.status, row.sort);
  return Number(r.lastInsertRowid);
}
export function remove(id: number) { db().prepare("DELETE FROM content WHERE id=?").run(id); }
export const countByType = () =>
  db().prepare("SELECT type, COUNT(*) n, SUM(status='draft') drafts FROM content GROUP BY type").all() as { type: string; n: number; drafts: number }[];
