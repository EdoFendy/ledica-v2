"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Copy, ExternalLink, Save, Trash2, RefreshCw } from "lucide-react";
import { FieldsEditor, useDoc } from "./Editor";
import { saveContent, deleteContent, duplicateContent } from "./actions";
import { useConfirm, useRun, Switch } from "./ui";
import type { Field } from "./schema";
import type { ContentType } from "@/lib/types";

type Rel = Record<string, { value: string; label: string }[]>;
type Init = { slug_it: string; slug_en: string; status: string; sort: number; data: any };

const SECTIONS: [string, string][] = [["text", "Testi"], ["data", "Dati e risultati"], ["link", "Collegamenti"], ["media", "Immagini e video"], ["seo", "SEO"], ["note", "Note interne"]];
const SECTION_OF: Record<string, string> = {
  tech: "link", techs: "link", products: "link", cases: "link", iso: "link", link: "link",
  images: "media", image: "media", videos: "media", seo: "seo", confirm: "note",
  specs: "data", perf: "data", benefits: "data", thickMin: "data", thickMax: "data", scope: "data", materials: "data", faq: "data", results: "data", headline: "data", year: "data", date: "data",
};
const ASIDE = ["badge", "featured", "key"];
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Percentuale di campi testuali con la versione inglese compilata. */
function enCompleteness(fields: Field[], data: any): { done: number; total: number } {
  let done = 0, total = 0;
  const walk = (fs: Field[], d: any) => fs.forEach((f) => {
    const v = d?.[f.name];
    if (f.i18n && f.kind !== "list") { if (v?.it) { total++; if (v?.en) done++; } }
    else if (f.kind === "group") walk(f.fields ?? [], v);
    else if (f.kind === "list" && Array.isArray(v)) v.forEach((it: any) => { if (f.of === "i18n") { if (it?.it) { total++; if (it?.en) done++; } } else if (Array.isArray(f.of)) walk(f.of, it); });
  });
  walk(fields, data);
  return { done, total };
}

export function ContentForm({ type, id, fields, init, rel, label, plural, publicUrl, updated }: {
  type: ContentType; id: number | null; fields: Field[]; rel: Rel; label: string; plural: string; publicUrl: string | null; updated?: string; init: Init;
}) {
  const { doc, set, dirty, setDirty } = useDoc(init);
  const [pending, start] = useTransition();
  const run = useRun();
  const confirm = useConfirm();
  const router = useRouter();
  const slugTouched = useRef(!!id);
  const [active, setActive] = useState("text");

  const bySection = useMemo(() => {
    const m: Record<string, Field[]> = {};
    fields.filter((f) => !ASIDE.includes(f.name)).forEach((f) => { (m[SECTION_OF[f.name] ?? "text"] ??= []).push(f); });
    return m;
  }, [fields]);
  const asideFields = fields.filter((f) => ASIDE.includes(f.name));
  const en = enCompleteness(fields, doc.data);
  const title = (doc.data.name ?? doc.data.title)?.it || "";
  const desc = doc.data.seo?.description?.it || doc.data.summary?.it || doc.data.lead?.it || "";
  const seoTitle = doc.data.seo?.title?.it || title;

  // slug automatico finché non lo tocchi
  useEffect(() => {
    if (slugTouched.current) return;
    const n = doc.data.name ?? doc.data.title;
    if (n?.it) set(["slug_it"], slugify(n.it));
    if (n?.en) set(["slug_en"], slugify(n.en));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.data.name?.it, doc.data.name?.en, doc.data.title?.it, doc.data.title?.en]);

  const submit = () => start(async () => {
    const r = await run(saveContent(type, id, doc), "Modifiche salvate.");
    if (!r.ok) return;
    setDirty(false);
    if (!id) router.replace(`/admin/content/${type}/${r.id}`); else router.refresh();
  });

  // ⌘S salva; avviso se esci con modifiche non salvate
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); submit(); } };
    const leave = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener("keydown", k); window.addEventListener("beforeunload", leave);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("beforeunload", leave); };
  });
  // evidenzia la sezione visibile nell'indice
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("s-", ""))), { rootMargin: "-80px 0px -60% 0px" });
    document.querySelectorAll(".a-section").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const del = async () => {
    if (!id || !(await confirm({ title: `Eliminare «${title || doc.slug_it}»?`, body: "Il contenuto sparisce dal sito. L'operazione non si può annullare.", ok: "Elimina", danger: true }))) return;
    const r = await run(deleteContent(type, id), "Contenuto eliminato.");
    if (r.ok) router.push(`/admin/content/${type}`);
  };
  const dup = async () => { if (!id) return; const r = await run(duplicateContent(id), "Copia creata come bozza."); if (r.ok) router.push(`/admin/content/${type}/${r.id}`); };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="a-editor">
        <nav className="a-toc" aria-label="Sezioni">
          {SECTIONS.filter(([k]) => bySection[k]).map(([k, l]) => (<a key={k} href={`#s-${k}`} className={active === k ? "on" : ""}>{l}{k === "note" && doc.data.confirm ? <span className="dot" title="Ci sono dati da confermare" /> : null}</a>))}
        </nav>

        <div>
          {SECTIONS.filter(([k]) => bySection[k]).map(([k, l]) => (
            <section key={k} id={`s-${k}`} className="a-section a-card">
              <div className="a-card-h"><h2>{l}</h2></div>
              <div className="a-card-b"><FieldsEditor fields={bySection[k]} doc={doc.data} set={(p, v) => set(["data", ...p], v)} rel={rel} /></div>
            </section>
          ))}
        </div>

        <aside className="a-aside">
          <div className="a-card">
            <div className="a-card-h"><h2>Pubblicazione</h2><span className={`a-pill ${doc.status}`}>{doc.status === "published" ? "Online" : "Bozza"}</span></div>
            <div className="a-card-b" style={{ display: "grid", gap: 12 }}>
              <Switch checked={doc.status === "published"} onChange={(v) => set(["status"], v ? "published" : "draft")} label="Visibile sul sito" />
              <div><label className="a-lbl">Indirizzo italiano</label><input className="a-in mono" value={doc.slug_it} onChange={(e) => { slugTouched.current = true; set(["slug_it"], e.target.value); }} required /></div>
              <div><label className="a-lbl">Indirizzo inglese</label><input className="a-in mono" value={doc.slug_en} onChange={(e) => { slugTouched.current = true; set(["slug_en"], e.target.value); }} /></div>
              {asideFields.length > 0 && <FieldsEditor fields={asideFields} doc={doc.data} set={(p, v) => set(["data", ...p], v)} rel={rel} />}
              <div><label className="a-lbl">Posizione nell'elenco</label><input className="a-in mono" type="number" value={doc.sort} onChange={(e) => set(["sort"], Number(e.target.value))} /></div>
              <p className="a-help" style={{ margin: 0 }}>Se cambi l'indirizzo di un contenuto online, il vecchio link viene reindirizzato in automatico.</p>
              {publicUrl && <a className="a-btn sec sm" href={publicUrl} target="_blank" rel="noopener"><ExternalLink />Anteprima sul sito</a>}
              {updated && <span className="a-num">Ultima modifica {updated.slice(0, 16)}</span>}
            </div>
          </div>
          <div className="a-card">
            <div className="a-card-h"><h2>Inglese</h2><span className="a-num">{en.done}/{en.total}</span></div>
            <div className="a-card-b a-meter">
              <div className="a-progress"><span style={{ width: `${en.total ? (en.done / en.total) * 100 : 100}%` }} /></div>
              <span className="a-help" style={{ margin: 0 }}>{en.total - en.done > 0 ? `${en.total - en.done} campi ancora da tradurre.` : "Tutti i testi hanno la versione inglese."}</span>
            </div>
          </div>
          <div className="a-card">
            <div className="a-card-h"><h2>Anteprima Google</h2></div>
            <div className="a-card-b">
              <div className="a-serp"><div className="u">www.ledica.it › {doc.slug_it || "…"}</div><div className="t">{(seoTitle || "Titolo della pagina").slice(0, 62)} | LE.DI.CA.</div><div className="d">{(desc || "Scrivi un riassunto: comparirà qui sotto il titolo.").slice(0, 158)}</div></div>
            </div>
          </div>
          {id && (
            <div className="a-card"><div className="a-card-b a-row">
              <button type="button" className="a-btn sec sm" onClick={dup}><Copy />Duplica</button>
              <button type="button" className="a-btn danger sm" onClick={del}><Trash2 />Elimina</button>
            </div></div>
          )}
        </aside>
      </div>

      <div className="a-savebar">
        <span className={`state${dirty ? " dirty" : ""}`}>{dirty ? "Modifiche non salvate" : id ? "Tutto salvato" : `Nuovo ${label.toLowerCase()}`}</span>
        <Link className="a-btn ghost" href={`/admin/content/${type}`}>Torna a {plural.toLowerCase()}</Link>
        <button className="a-btn" disabled={pending}>{pending ? <RefreshCw className="spin" /> : <Save />}{pending ? "Salvo…" : "Salva"}<span className="a-kbd" style={{ background: "transparent", color: "#dfeeda", borderColor: "#6c9a58" }}>⌘S</span></button>
      </div>
    </form>
  );
}
