"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ArrowUpDown, Eye, EyeOff, GripVertical, Plus, Search, Trash2, FileText } from "lucide-react";
import { bulkContent, reorderContent } from "./actions";
import { thumb } from "./MediaPicker";
import { useConfirm, useRun } from "./ui";

export type CRow = { id: number; title: string; slug: string; status: string; updated: string; image?: string; group?: string; en: boolean; confirm: boolean; href: string; extra?: string };
type Sort = "sort" | "title" | "updated" | "status";

export function ContentTable({ type, rows, groups, groupLabel, singular, initialStatus }: { type: string; rows: CRow[]; groups?: string[]; groupLabel?: string; singular: string; initialStatus?: string }) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState<"" | "published" | "draft" | "todo">((["published", "draft", "todo"].includes(initialStatus ?? "") ? initialStatus : "") as any);
  const [g, setG] = useState("");
  const [sort, setSort] = useState<{ k: Sort; d: 1 | -1 }>({ k: "sort", d: 1 });
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [order, setOrder] = useState(rows.map((r) => r.id));
  const drag = useRef<number | null>(null);
  const run = useRun(); const confirm = useConfirm(); const router = useRouter();

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let list = order.map((id) => byId.get(id)!).filter(Boolean).filter((r) =>
    (!q || norm(r.title + " " + r.slug).includes(norm(q))) && (!g || r.group === g) &&
    (!st || (st === "todo" ? r.confirm || !r.en : r.status === st)));
  if (sort.k !== "sort") { const k = sort.k as Exclude<Sort, "sort">; list = [...list].sort((a, b) => String(a[k]).localeCompare(String(b[k])) * sort.d); }
  const canDrag = sort.k === "sort" && !q && !st && !g;
  const counts = { all: rows.length, published: rows.filter((r) => r.status === "published").length, draft: rows.filter((r) => r.status === "draft").length, todo: rows.filter((r) => r.confirm || !r.en).length };
  const allOn = list.length > 0 && list.every((r) => sel.has(r.id));
  const toggle = (id: number) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const sortBy = (k: Sort) => setSort((s) => ({ k, d: s.k === k ? (s.d === 1 ? -1 : 1) : 1 }));

  const bulk = async (op: "publish" | "draft" | "delete") => {
    const ids = [...sel];
    if (op === "delete" && !(await confirm({ title: `Eliminare ${ids.length} contenuti?`, body: "Spariscono dal sito. L'operazione non si può annullare.", ok: "Elimina", danger: true }))) return;
    const r = await run(bulkContent(ids, op)); if (r.ok) { setSel(new Set()); router.refresh(); }
  };
  const drop = async (target: number) => {
    const from = drag.current; drag.current = null;
    if (from == null || from === target) return;
    const n = [...order]; const i = n.indexOf(from), j = n.indexOf(target); n.splice(i, 1); n.splice(j, 0, from); setOrder(n);
    await run(reorderContent(n), "Ordine aggiornato.");
  };

  const Th = ({ k, children }: { k: Sort; children: React.ReactNode }) => (<th><button onClick={() => sortBy(k)}>{children}<ArrowUpDown /></button></th>);
  return (
    <div className="a-card">
      <div className="a-tabs" role="tablist">
        {([["", "Tutti", counts.all], ["published", "Online", counts.published], ["draft", "Bozze", counts.draft], ["todo", "Da completare", counts.todo]] as const).map(([v, l, n]) => (
          <button key={v} className="a-tab" role="tab" aria-selected={st === v} onClick={() => setSt(v)}>{l}<span className="n">{n}</span></button>
        ))}
      </div>
      <div className="a-toolbar">
        <div className="a-in-ico" style={{ flex: "1 1 260px", maxWidth: 360 }}><Search /><input className="a-in" placeholder="Cerca per titolo o indirizzo" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {groups && groups.length > 1 && <select className="a-in" style={{ width: "auto" }} value={g} onChange={(e) => setG(e.target.value)} aria-label={groupLabel}><option value="">{groupLabel}: tutte</option>{groups.map((x) => <option key={x}>{x}</option>)}</select>}
        <span className="a-num" style={{ marginLeft: "auto" }}>{list.length} di {rows.length}</span>
      </div>
      {sel.size > 0 && (
        <div className="a-bulk">{sel.size} selezionati
          <button className="a-btn sec sm" onClick={() => bulk("publish")}><Eye />Pubblica</button>
          <button className="a-btn sec sm" onClick={() => bulk("draft")}><EyeOff />Metti in bozza</button>
          <button className="a-btn danger sm" onClick={() => bulk("delete")}><Trash2 />Elimina</button>
          <button className="a-btn ghost sm" onClick={() => setSel(new Set())} style={{ marginLeft: "auto" }}>Annulla selezione</button>
        </div>
      )}
      {list.length ? (
        <div className="a-tablewrap">
          <table className="a-table">
            <thead><tr>
              <th style={{ width: 34 }}><input type="checkbox" aria-label="Seleziona tutti" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(list.map((r) => r.id)))} /></th>
              {canDrag && <th style={{ width: 24 }} />}
              <th style={{ width: 56 }} />
              <Th k="title">Titolo</Th>
              {groups && <th>{groupLabel}</th>}
              <th>Inglese</th><Th k="status">Stato</Th><Th k="updated">Modificato</Th>
            </tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className={sel.has(r.id) ? "sel" : ""} draggable={canDrag} onDragStart={() => (drag.current = r.id)} onDragOver={(e) => canDrag && e.preventDefault()} onDrop={() => drop(r.id)}>
                  <td><input type="checkbox" aria-label={`Seleziona ${r.title}`} checked={sel.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  {canDrag && <td className="a-grip" title="Trascina per riordinare" style={{ paddingTop: 9 }}><GripVertical /></td>}
                  <td>{r.image ? <img className="a-thumb-s" src={thumb(r.image, 96)} alt="" loading="lazy" /> : <span className="a-thumb-s" style={{ display: "grid", placeItems: "center" }}><FileText style={{ width: 16, color: "var(--a-faint)" }} /></span>}</td>
                  <td><Link className="t-title" href={r.href}>{r.title || r.slug}</Link><div className="t-meta">/{r.slug}{r.extra ? ` · ${r.extra}` : ""}</div>{r.confirm && <span className="a-pill warn" style={{ marginTop: 4 }}>Dati da confermare</span>}</td>
                  {groups && <td>{r.group}</td>}
                  <td>{r.en ? <span className="a-pill ok">Tradotto</span> : <span className="a-pill draft">Da tradurre</span>}</td>
                  <td><span className={`a-pill ${r.status}`}>{r.status === "published" ? "Online" : "Bozza"}</span></td>
                  <td className="a-num">{r.updated.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-empty"><Search /><b>{rows.length ? "Nessun risultato con questi filtri" : `Ancora nessun ${singular.toLowerCase()}`}</b><span>{rows.length ? "Cambia la ricerca o la scheda in alto." : "Crea il primo: comparirà qui e sul sito quando lo pubblichi."}</span>
          {!rows.length && <Link className="a-btn" href={`/admin/content/${type}/new`}><Plus />Crea {singular.toLowerCase()}</Link>}</div>
      )}
      {canDrag && list.length > 1 && <p className="a-help" style={{ padding: "8px 12px", margin: 0, borderTop: "1px solid var(--a-line)" }}>Trascina le righe per cambiare l'ordine in cui compaiono sul sito.</p>}
    </div>
  );
}
