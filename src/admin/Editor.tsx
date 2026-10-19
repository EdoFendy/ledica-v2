"use client";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { Field } from "./schema";
import { MediaPicker, thumb } from "./MediaPicker";
import { Switch } from "./ui";

type Rel = Record<string, { value: string; label: string }[]>;
type Ctx = { rel: Rel; pick: (cb: (f: string) => void) => void };

const getIn = (o: any, p: (string | number)[]) => p.reduce((a, k) => (a == null ? a : a[k]), o);
const setIn = (o: any, p: (string | number)[], v: any): any => {
  if (!p.length) return v;
  const [k, ...rest] = p;
  const base = Array.isArray(o) ? [...o] : { ...(o ?? {}) };
  base[k as any] = setIn(o?.[k], rest, v);
  return base;
};
export const blank = (f: Field): any => {
  if (["list", "images", "multi", "tags"].includes(f.kind)) return [];
  if (f.kind === "group") return Object.fromEntries((f.fields ?? []).map((x) => [x.name, blank(x)]));
  if (f.kind === "bool") return false;
  if (f.kind === "number") return "";
  return f.i18n ? { it: "", en: "" } : "";
};
const move = <T,>(arr: T[], from: number, to: number) => { const n = [...arr]; const [x] = n.splice(from, 1); n.splice(to, 0, x); return n; };

export function useDoc<T>(initial: T) {
  const [doc, setDoc] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);
  const set = (p: (string | number)[], v: any) => { setDirty(true); setDoc((d) => setIn(d, p, v)); };
  return { doc, set, setDoc, dirty, setDirty };
}

export function FieldsEditor({ fields, doc, set, rel }: { fields: Field[]; doc: any; set: (p: (string | number)[], v: any) => void; rel: Rel }) {
  const [picker, setPicker] = useState<null | ((f: string) => void)>(null);
  const ctx: Ctx = useMemo(() => ({ rel, pick: (cb) => setPicker(() => cb) }), [rel]);
  return (
    <div className="a-fields">
      {fields.map((f) => (<FieldView key={f.name} f={f} path={[f.name]} doc={doc} set={set} ctx={ctx} />))}
      {picker && <MediaPicker onClose={() => setPicker(null)} onPick={(file) => { picker(file); setPicker(null); }} />}
    </div>
  );
}

function Label({ f }: { f: Field }) {
  return <label className="a-lbl">{f.label}{f.internal && <span className="a-tag">interno</span>}{f.i18n && <span className="a-tag">IT · EN</span>}</label>;
}

function FieldView({ f, path, doc, set, ctx }: { f: Field; path: (string | number)[]; doc: any; set: (p: (string | number)[], v: any) => void; ctx: Ctx }) {
  const val = getIn(doc, path);
  const help = f.help ? <p className="a-help">{f.help}</p> : null;
  const wideKinds = ["group", "list", "images", "multi", "md", "textarea"];
  const cls = `a-field${wideKinds.includes(f.kind) || f.i18n ? " a-wide" : ""}`;

  if (f.kind === "group") {
    return (
      <div className={cls}>
        <Label f={f} />{help}
        <div className="a-fields" style={{ padding: 14, background: "var(--a-sunk)", border: "1px solid var(--a-line)", borderRadius: 8, marginTop: 6 }}>
          {(f.fields ?? []).map((x) => (<FieldView key={x.name} f={x} path={[...path, x.name]} doc={doc} set={set} ctx={ctx} />))}
        </div>
      </div>
    );
  }
  if (f.kind === "list") return <ListField f={f} path={path} arr={val ?? []} doc={doc} set={set} ctx={ctx} cls={cls} help={help} />;
  if (f.kind === "image") {
    return (
      <div className={cls}><Label f={f} />
        <div className="a-img-field">
          {val ? <img src={thumb(val)} alt="" /> : <span className="a-noimg">Nessuna</span>}
          <div style={{ display: "grid", gap: 6 }}>
            <span className="a-num">{val || "Nessuna immagine scelta"}</span>
            <div className="a-row"><button type="button" className="a-btn sec sm" onClick={() => ctx.pick((file) => set(path, file))}><ImagePlus />Scegli</button>{val && <button type="button" className="a-btn ghost sm" onClick={() => set(path, "")}><X />Rimuovi</button>}</div>
          </div>
        </div>{help}
      </div>
    );
  }
  if (f.kind === "images") return <ImagesField f={f} arr={val ?? []} onChange={(v) => set(path, v)} ctx={ctx} cls={cls} help={help} />;
  if (f.kind === "multi") {
    const opts = f.rel ? ctx.rel[f.rel] ?? [] : f.options ?? [];
    const arr: string[] = val ?? [];
    return (
      <div className={cls}><Label f={f} />
        <div className="a-chips">{opts.map((o) => { const on = arr.includes(o.value); return <button type="button" key={o.value} className={`a-chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => set(path, on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}>{o.label}</button>; })}</div>{help}
      </div>
    );
  }
  if (f.kind === "select") {
    const opts = f.rel ? ctx.rel[f.rel] ?? [] : f.options ?? [];
    return (<div className={cls}><Label f={f} /><select className="a-in" value={val ?? ""} onChange={(e) => set(path, e.target.value)}>{f.rel && <option value="">—</option>}{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}</div>);
  }
  if (f.kind === "bool") return (<div className={cls} style={{ alignSelf: "end", paddingBottom: 8 }}><Switch checked={!!val} onChange={(v) => set(path, v)} label={f.label} />{help}</div>);
  if (f.kind === "number") return (<div className={cls}><Label f={f} /><input className="a-in mono" type="number" step="any" value={val ?? ""} onChange={(e) => set(path, e.target.value === "" ? null : Number(e.target.value))} />{help}</div>);
  if (f.kind === "date") return (<div className={cls}><Label f={f} /><input className="a-in" type="date" value={val ?? ""} onChange={(e) => set(path, e.target.value)} />{help}</div>);
  if (f.i18n) return (<div className={cls}><Label f={f} /><I18n v={val} kind={f.kind} onChange={(v) => set(path, v)} max={f.max} />{help}</div>);
  return (<div className={cls}><Label f={f} />{f.kind === "textarea" ? <textarea className="a-in" rows={3} value={val ?? ""} onChange={(e) => set(path, e.target.value)} /> : <input className="a-in" value={val ?? ""} onChange={(e) => set(path, e.target.value)} />}{help}</div>);
}

function ListField({ f, path, arr, doc, set, ctx, cls, help }: { f: Field; path: (string | number)[]; arr: any[]; doc: any; set: (p: (string | number)[], v: any) => void; ctx: Ctx; cls: string; help: React.ReactNode }) {
  const drag = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const mk = () => (f.of === "text" ? "" : f.of === "i18n" ? { it: "", en: "" } : Object.fromEntries((f.of as Field[]).map((x) => [x.name, blank(x)])));
  return (
    <div className={cls}><Label f={f} />{help}
      <div className="a-list" style={{ marginTop: 6 }}>
        {arr.map((_, i) => (
          <div key={i} className={`a-item${over === i ? " drag-over" : ""}`} draggable onDragStart={() => (drag.current = i)} onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); if (drag.current != null && drag.current !== i) set(path, move(arr, drag.current, i)); drag.current = null; }}>
            <span className="a-grip" title="Trascina per riordinare"><GripVertical /></span>
            <div style={{ minWidth: 0 }}>
              {f.of === "text" ? <input className="a-in" value={arr[i] ?? ""} onChange={(e) => set([...path, i], e.target.value)} />
                : f.of === "i18n" ? <I18n v={arr[i]} kind="text" onChange={(v) => set([...path, i], v)} />
                : <div className="a-fields">{(f.of as Field[]).map((x) => (<FieldView key={x.name} f={x} path={[...path, i, x.name]} doc={doc} set={set} ctx={ctx} />))}</div>}
            </div>
            <div className="a-item-act">
              <button type="button" className="a-btn ghost icon" aria-label="Sposta su" disabled={i === 0} onClick={() => set(path, move(arr, i, i - 1))}><ArrowUp /></button>
              <button type="button" className="a-btn ghost icon" aria-label="Sposta giù" disabled={i === arr.length - 1} onClick={() => set(path, move(arr, i, i + 1))}><ArrowDown /></button>
              <button type="button" className="a-btn ghost icon" aria-label="Elimina riga" onClick={() => set(path, arr.filter((_, k) => k !== i))} style={{ color: "var(--a-err)" }}><Trash2 /></button>
            </div>
          </div>
        ))}
        <div><button type="button" className="a-btn sec sm" onClick={() => set(path, [...arr, mk()])}><Plus />Aggiungi</button></div>
      </div>
    </div>
  );
}

function ImagesField({ f, arr, onChange, ctx, cls, help }: { f: Field; arr: string[]; onChange: (v: string[]) => void; ctx: Ctx; cls: string; help: React.ReactNode }) {
  const drag = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  return (
    <div className={cls}><Label f={f} />{help}
      <div className="a-imgs" style={{ marginTop: 6 }}>
        {arr.map((file, i) => (
          <div key={file + i} className={`a-imgcard${over === i ? " drag-over" : ""}`} draggable onDragStart={() => (drag.current = i)} onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); if (drag.current != null && drag.current !== i) onChange(move(arr, drag.current, i)); drag.current = null; }}>
            <img src={thumb(file)} alt="" />
            <div className="bar"><span className={`a-pill plain${i === 0 ? " ok" : ""}`}>{i === 0 ? "Principale" : `#${i + 1}`}</span>
              <button type="button" className="a-btn ghost icon" aria-label="Rimuovi immagine" onClick={() => onChange(arr.filter((_, k) => k !== i))}><X /></button></div>
          </div>
        ))}
        <button type="button" className="a-add" onClick={() => ctx.pick((file) => onChange([...arr, file]))}><ImagePlus /><span>Aggiungi immagine</span></button>
      </div>
      {arr.length > 1 && <p className="a-help">Trascina le immagini per cambiare l'ordine: la prima è quella principale.</p>}
    </div>
  );
}

function I18n({ v, onChange, kind, max }: { v: any; onChange: (v: any) => void; kind: Field["kind"]; max?: number }) {
  const cur = { it: v?.it ?? "", en: v?.en ?? "" };
  const area = kind === "textarea" || kind === "md";
  return (
    <div className="a-i18n">
      {(["it", "en"] as const).map((l) => {
        const missing = l === "en" && !cur.en && !!cur.it;
        return (
          <div key={l}>
            <span className={`a-flag${missing ? " warn" : ""}`}><span>{l === "it" ? "Italiano" : "English"}{missing ? " · da tradurre" : ""}</span>{max && <span className={`a-count-c${cur[l].length > max ? " over" : ""}`}>{cur[l].length}/{max}</span>}</span>
            {area ? <textarea className={`a-in${kind === "md" ? " a-mono" : ""}`} rows={kind === "md" ? 14 : 3} value={cur[l]} onChange={(e) => onChange({ ...cur, [l]: e.target.value })} lang={l} />
              : <input className="a-in" value={cur[l]} onChange={(e) => onChange({ ...cur, [l]: e.target.value })} lang={l} />}
          </div>
        );
      })}
    </div>
  );
}
