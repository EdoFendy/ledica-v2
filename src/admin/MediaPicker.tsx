"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Upload, X } from "lucide-react";
import { uploadMedia } from "./actions";

type M = { file: string; alt_it: string; provisional: number };
export const thumb = (f: string, w = 256) => `/_next/image?url=${encodeURIComponent("/media/" + f)}&w=${w}&q=60`;
export const isImg = (f: string) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f);

/** Libreria media in finestra: cerca, scegli, oppure carica trascinando i file. */
export function MediaPicker({ onPick, onClose }: { onPick: (file: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<M[]>([]);
  const [q, setQ] = useState("");
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();
  const dlg = useRef<HTMLDialogElement>(null);
  const load = () => fetch("/admin/api/media").then((r) => r.json()).then(setItems);
  useEffect(() => { dlg.current?.showModal(); load(); }, []);
  const up = (files: FileList | File[]) => { const fd = new FormData(); Array.from(files).forEach((f) => fd.append("files", f)); start(async () => { const names = await uploadMedia(fd); await load(); if (names[0]) onPick(names[0]); }); };
  const shown = items.filter((m) => !q || (m.file + m.alt_it).toLowerCase().includes(q.toLowerCase()));
  return (
    <dialog ref={dlg} className="a-dialog wide adm" onCancel={(e) => { e.preventDefault(); onClose(); }} onClose={onClose}>
      <div className="a-drawer-h"><h2>Libreria media</h2><button className="a-btn ghost icon" onClick={onClose} aria-label="Chiudi"><X /></button></div>
      <div className="d-b" style={{ display: "grid", gap: 12, maxHeight: "70vh", overflow: "auto" }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); up(e.dataTransfer.files); }}>
        <div className="a-row">
          <div className="a-in-ico" style={{ flex: 1 }}><Search /><input className="a-in" placeholder="Cerca per nome o testo alternativo" value={q} onChange={(e) => setQ(e.target.value)} autoFocus /></div>
          <label className="a-btn sec"><Upload />{pending ? "Carico…" : "Carica"}<input type="file" multiple hidden accept="image/*,.pdf" onChange={(e) => e.target.files && up(e.target.files)} /></label>
        </div>
        {over && <div className="a-drop over"><Upload />Rilascia i file per caricarli</div>}
        <div className="a-media-grid">
          {shown.map((m) => (
            <button type="button" key={m.file} className="a-mcard" onClick={() => onPick(m.file)} title={m.file}>
              {isImg(m.file) ? <img src={thumb(m.file)} alt="" loading="lazy" /> : <span className="a-pdf">PDF</span>}
              <span className="cap"><span>{m.file}</span></span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
