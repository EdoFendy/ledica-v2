"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, FileUp, Pencil, Plus, Save, Search, Trash2, ArrowRightLeft } from "lucide-react";
import { deleteRedirects, importRedirects, saveRedirect } from "./actions";
import { Drawer, useConfirm, useRun } from "./ui";

export type RRow = { from_path: string; to_path: string; code: number; note: string };
const CODE: Record<number, string> = { 301: "301 permanente", 302: "302 temporaneo", 410: "410 rimossa" };

export function RedirectsTable({ rows }: { rows: RRow[] }) {
  const [q, setQ] = useState(""); const [code, setCode] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [edit, setEdit] = useState<RRow | "new" | null>(null);
  const [imp, setImp] = useState(false);
  const run = useRun(); const confirm = useConfirm(); const router = useRouter();
  const list = rows.filter((r) => (!q || (r.from_path + r.to_path + r.note).toLowerCase().includes(q.toLowerCase())) && (!code || r.code === code));
  const shown = list.slice(0, 300);
  const allOn = shown.length > 0 && shown.every((r) => sel.has(r.from_path));
  const del = async (froms: string[]) => {
    if (!(await confirm({ title: froms.length === 1 ? `Eliminare il redirect ${froms[0]}?` : `Eliminare ${froms.length} redirect?`, body: "Chi apre il vecchio indirizzo vedrà la pagina 404.", ok: "Elimina", danger: true }))) return;
    const r = await run(deleteRedirects(froms), "Redirect eliminati."); if (r.ok) { setSel(new Set()); router.refresh(); }
  };
  return (
    <>
      <div className="a-card">
        <div className="a-tabs" role="tablist">
          {[0, 301, 302, 410].map((c) => (<button key={c} className="a-tab" role="tab" aria-selected={code === c} onClick={() => setCode(c)}>{c ? CODE[c] : "Tutti"}<span className="n">{c ? rows.filter((r) => r.code === c).length : rows.length}</span></button>))}
        </div>
        <div className="a-toolbar">
          <div className="a-in-ico" style={{ flex: "1 1 260px", maxWidth: 360 }}><Search /><input className="a-in" placeholder="Cerca un percorso" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="a-row" style={{ marginLeft: "auto" }}>
            <button className="a-btn sec sm" onClick={() => setImp(true)}><FileUp />Importa elenco</button>
            <button className="a-btn sm" onClick={() => setEdit("new")}><Plus />Nuovo redirect</button>
          </div>
        </div>
        {sel.size > 0 && <div className="a-bulk">{sel.size} selezionati<button className="a-btn danger sm" onClick={() => del([...sel])}><Trash2 />Elimina</button><button className="a-btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => setSel(new Set())}>Annulla selezione</button></div>}
        {shown.length ? (
          <div className="a-tablewrap"><table className="a-table">
            <thead><tr><th style={{ width: 34 }}><input type="checkbox" aria-label="Seleziona tutti" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(shown.map((r) => r.from_path)))} /></th><th>Vecchio indirizzo</th><th>Destinazione</th><th>Tipo</th><th>Nota</th><th /></tr></thead>
            <tbody>{shown.map((r) => (
              <tr key={r.from_path} className={sel.has(r.from_path) ? "sel" : ""}>
                <td><input type="checkbox" aria-label={`Seleziona ${r.from_path}`} checked={sel.has(r.from_path)} onChange={() => setSel((s) => { const n = new Set(s); n.has(r.from_path) ? n.delete(r.from_path) : n.add(r.from_path); return n; })} /></td>
                <td className="a-mono">{r.from_path}</td>
                <td className="a-mono">{r.to_path || <span style={{ color: "var(--a-faint)" }}>—</span>}</td>
                <td><span className={`a-pill ${r.code === 410 ? "gone" : r.code === 302 ? "warn" : "ok"}`}>{r.code}</span></td>
                <td style={{ color: "var(--a-muted)" }}>{r.note}</td>
                <td className="t-actions">
                  {!r.from_path.endsWith("*") && <a className="a-btn ghost icon" href={r.from_path} target="_blank" rel="noopener" title="Prova il redirect" aria-label="Prova il redirect"><ExternalLink /></a>}
                  <button className="a-btn ghost icon" onClick={() => setEdit(r)} aria-label="Modifica"><Pencil /></button>
                  <button className="a-btn ghost icon" onClick={() => del([r.from_path])} aria-label="Elimina" style={{ color: "var(--a-err)" }}><Trash2 /></button>
                </td>
              </tr>))}</tbody>
          </table></div>
        ) : <div className="a-empty"><ArrowRightLeft /><b>Nessun redirect con questi filtri</b></div>}
        {list.length > shown.length && <p className="a-help" style={{ padding: "8px 12px", margin: 0 }}>Mostrati i primi {shown.length} di {list.length}: usa la ricerca per restringere.</p>}
      </div>
      {edit && <RedirectDrawer r={edit === "new" ? null : edit} onClose={() => setEdit(null)} />}
      {imp && <ImportDrawer onClose={() => setImp(false)} />}
    </>
  );
}

function RedirectDrawer({ r, onClose }: { r: RRow | null; onClose: () => void }) {
  const [v, setV] = useState({ from: r?.from_path ?? "", to: r?.to_path ?? "", code: r?.code ?? 301, note: r?.note ?? "" });
  const [pending, start] = useTransition(); const run = useRun(); const router = useRouter();
  const save = () => start(async () => { const x = await run(saveRedirect(r?.from_path ?? null, v), "Redirect salvato."); if (x.ok) { onClose(); router.refresh(); } });
  return (
    <Drawer title={r ? "Modifica redirect" : "Nuovo redirect"} onClose={onClose} footer={<><button className="a-btn sec" onClick={onClose}>Annulla</button><button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button></>}>
      <div className="a-field"><label className="a-lbl">Vecchio indirizzo</label><input className="a-in mono" value={v.from} onChange={(e) => setV({ ...v, from: e.target.value })} placeholder="/vecchia-pagina" autoFocus /><p className="a-help">Puoi incollare anche l'URL completo. Termina con * per un intero prefisso.</p></div>
      <div className="a-field"><label className="a-lbl">Tipo</label><select className="a-in" value={v.code} onChange={(e) => setV({ ...v, code: Number(e.target.value) })}>{Object.entries(CODE).map(([c, l]) => <option key={c} value={c}>{l}</option>)}</select>
        <p className="a-help">301 per le pagine spostate per sempre, 302 per spostamenti temporanei, 410 per le pagine eliminate (Google le toglie dall'indice).</p></div>
      {v.code !== 410 && <div className="a-field"><label className="a-lbl">Nuovo indirizzo</label><input className="a-in mono" value={v.to} onChange={(e) => setV({ ...v, to: e.target.value })} placeholder="/prodotti/…" /></div>}
      <div className="a-field"><label className="a-lbl">Nota</label><input className="a-in" value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></div>
    </Drawer>
  );
}

function ImportDrawer({ onClose }: { onClose: () => void }) {
  const [t, setT] = useState(""); const [pending, start] = useTransition(); const run = useRun(); const router = useRouter();
  const go = () => start(async () => { const x = await run(importRedirects(t)); if (x.ok) { onClose(); router.refresh(); } });
  return (
    <Drawer title="Importa redirect" onClose={onClose} footer={<><button className="a-btn sec" onClick={onClose}>Annulla</button><button className="a-btn" disabled={pending || !t.trim()} onClick={go}><FileUp />Importa</button></>}>
      <p className="a-help" style={{ margin: 0 }}>Una riga per redirect: vecchio indirizzo, nuovo indirizzo e (facoltativo) il codice. Separatori: spazio, virgola o punto e virgola. Le righe che iniziano con # vengono ignorate.</p>
      <textarea className="a-in a-mono" rows={14} value={t} onChange={(e) => setT(e.target.value)} placeholder={"/vecchio-prodotto /prodotti/nuovo-prodotto\n/pagina-demo 410\n/promo /news 302"} />
    </Drawer>
  );
}
