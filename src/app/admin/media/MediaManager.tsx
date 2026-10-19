"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Copy, RefreshCw, Save, Search, Trash2, Upload, ImageOff } from "lucide-react";
import Link from "next/link";
import { deleteMedia, replaceMedia, updateMedia, uploadMedia } from "@/admin/actions";
import { isImg, thumb } from "@/admin/MediaPicker";
import { Drawer, Switch, useConfirm, useRun, useToast } from "@/admin/ui";

export type MRow = { file: string; alt_it: string; alt_en: string; provisional: boolean; note: string; size: number; created: string; used: { title: string; href: string }[] };
type F = "" | "prov" | "noalt" | "unused";

export function MediaManager({ rows, initial }: { rows: MRow[]; initial?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<F>(initial === "prov" ? "prov" : "");
  const [q, setQ] = useState("");
  const [over, setOver] = useState(false);
  const [sel, setSel] = useState<string | null>(initial && initial !== "prov" ? initial : null);
  const toast = useToast();
  const cur = rows.find((r) => r.file === sel);
  const shown = rows.filter((r) => (!q || (r.file + r.alt_it).toLowerCase().includes(q.toLowerCase())) && (!filter || (filter === "prov" && r.provisional) || (filter === "noalt" && (!r.alt_it || !r.alt_en)) || (filter === "unused" && !r.used.length)));
  const up = (files: FileList | File[]) => {
    const fd = new FormData(); Array.from(files).forEach((f) => fd.append("files", f));
    start(async () => { const n = await uploadMedia(fd); toast(n.length ? `${n.length} file caricati.` : "Nessun file valido (JPG, PNG, WebP, AVIF, GIF, SVG, PDF, MP4 · max 25 MB).", n.length ? "ok" : "err"); router.refresh(); });
  };
  const counts: Record<F, number> = { "": rows.length, prov: rows.filter((r) => r.provisional).length, noalt: rows.filter((r) => !r.alt_it || !r.alt_en).length, unused: rows.filter((r) => !r.used.length).length };
  return (
    <>
      <div className={`a-drop${over ? " over" : ""}`} style={{ marginBottom: 16 }} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); up(e.dataTransfer.files); }}>
        <Upload />{pending ? "Caricamento in corso…" : <>Trascina qui foto e PDF oppure <label style={{ color: "var(--a-accent-ink)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>sfoglia<input type="file" multiple hidden accept="image/*,.pdf,video/mp4,video/webm" onChange={(e) => e.target.files && up(e.target.files)} /></label></>}
      </div>
      <div className="a-card">
        <div className="a-tabs" role="tablist">
          {([["", "Tutte"], ["prov", "Provvisorie"], ["noalt", "Senza testo alternativo"], ["unused", "Non usate"]] as const).map(([v, l]) => (<button key={v} className="a-tab" role="tab" aria-selected={filter === v} onClick={() => setFilter(v)}>{l}<span className="n">{counts[v]}</span></button>))}
        </div>
        <div className="a-toolbar"><div className="a-in-ico" style={{ flex: "1 1 260px", maxWidth: 360 }}><Search /><input className="a-in" placeholder="Cerca per nome o testo alternativo" value={q} onChange={(e) => setQ(e.target.value)} /></div><span className="a-num" style={{ marginLeft: "auto" }}>{shown.length} file</span></div>
        <div className="a-card-b">
          {shown.length ? (
            <div className="a-media-grid">
              {shown.map((r) => (
                <button key={r.file} className={`a-mcard${r.file === sel ? " on" : ""}`} onClick={() => setSel(r.file)}>
                  {isImg(r.file) ? <img src={thumb(r.file)} alt="" loading="lazy" /> : <span className="a-pdf">{r.file.split(".").pop()?.toUpperCase()}</span>}
                  <span className="cap"><span>{r.file}</span><span className="a-row" style={{ gap: 4 }}>{r.provisional && <b className="a-pill warn">provvisoria</b>}{!r.used.length && <b className="a-pill plain">non usata</b>}{(!r.alt_it || !r.alt_en) && <b className="a-pill plain">no alt</b>}</span></span>
                </button>
              ))}
            </div>
          ) : <div className="a-empty"><ImageOff /><b>Nessun file con questo filtro</b></div>}
        </div>
      </div>
      {cur && <MediaDrawer key={cur.file} r={cur} onClose={() => setSel(null)} />}
    </>
  );
}

function MediaDrawer({ r, onClose }: { r: MRow; onClose: () => void }) {
  const [f, setF] = useState(r);
  const [v, setV] = useState(Date.now());
  const run = useRun(); const confirm = useConfirm(); const toast = useToast(); const router = useRouter();
  const [pending, start] = useTransition();
  const rep = useRef<HTMLInputElement>(null);
  useEffect(() => setF(r), [r]);
  const url = typeof window !== "undefined" ? `${location.origin}/media/${r.file}` : `/media/${r.file}`;
  const save = () => start(async () => { const x = await run(updateMedia(f.file, f.alt_it, f.alt_en, f.provisional, f.note), "Dati dell'immagine salvati."); if (x.ok) router.refresh(); });
  const replace = (file?: File) => { if (!file) return; const fd = new FormData(); fd.set("file", file); start(async () => { const x = await run(replaceMedia(r.file, fd), "Immagine sostituita ovunque è usata."); if (x.ok) { setV(Date.now()); router.refresh(); } }); };
  const del = async () => {
    if (r.used.length) return toast(`È usata in ${r.used.length} contenuti: toglila da lì prima di eliminarla.`, "err");
    if (!(await confirm({ title: `Eliminare ${r.file}?`, body: "Il file viene cancellato dal server.", ok: "Elimina", danger: true }))) return;
    const x = await run(deleteMedia(r.file), "Immagine eliminata."); if (x.ok) { onClose(); router.refresh(); }
  };
  return (
    <Drawer title={r.file} onClose={onClose} footer={<><button className="a-btn danger" onClick={del} style={{ marginRight: "auto" }}><Trash2 />Elimina</button><button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button></>}>
      {isImg(r.file) ? <img src={`${thumb(r.file, 640)}&v=${v}`} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "var(--a-sunk)", border: "1px solid var(--a-line)", borderRadius: 8 }} /> : <a className="a-btn sec" href={`/media/${r.file}`} target="_blank" rel="noopener">Apri il file</a>}
      <div className="a-row">
        <button className="a-btn sec sm" onClick={() => rep.current?.click()}><RefreshCw />Sostituisci file</button><input ref={rep} type="file" hidden onChange={(e) => replace(e.target.files?.[0])} />
        <button className="a-btn sec sm" onClick={() => { navigator.clipboard.writeText(url); toast("Link copiato."); }}><Copy />Copia link</button>
        <span className="a-num" style={{ marginLeft: "auto" }}>{(r.size / 1024).toFixed(0)} KB</span>
      </div>
      <div className="a-field"><label className="a-lbl">Testo alternativo italiano</label><input className="a-in" value={f.alt_it} onChange={(e) => setF({ ...f, alt_it: e.target.value })} placeholder="Descrivi cosa si vede: prodotto, impianto, dettaglio" /><p className="a-help">Lo leggono Google e chi usa uno screen reader.</p></div>
      <div className="a-field"><label className="a-lbl">Testo alternativo inglese</label><input className="a-in" value={f.alt_en} onChange={(e) => setF({ ...f, alt_en: e.target.value })} /></div>
      <div className="a-field"><label className="a-lbl">Nota interna</label><input className="a-in" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Fonte, fotografo, diritti" /></div>
      <Switch checked={f.provisional} onChange={(x) => setF({ ...f, provisional: x })} label="Foto provvisoria, da sostituire" />
      <div><label className="a-lbl">Dove è usata</label>
        {r.used.length ? <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>{r.used.map((u) => <li key={u.href}><Link href={u.href}>{u.title}</Link></li>)}</ul> : <p className="a-help" style={{ margin: 0 }}>Non è usata in nessun contenuto.</p>}
      </div>
      <p className="a-help" style={{ margin: 0 }}>«Sostituisci file» mantiene lo stesso nome: tutte le pagine che usano questa immagine mostrano subito quella nuova. Il formato deve essere lo stesso.</p>
    </Drawer>
  );
}
