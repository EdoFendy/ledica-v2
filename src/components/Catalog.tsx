"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type CatItem = { slug: string; href: string; name: string; subtitle: string; tech: string; min: number | null; max: number | null; image: string; alt: string; badge: boolean; meta: string[] };
export type CatLabels = { tech: string; all: string; search: string; thickness: string; results: string; none: string; newTag: string };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function Catalog({ items, techs, labels, lang }: { items: CatItem[]; techs: { key: string; name: string }[]; labels: CatLabels; lang: "it" | "en" }) {
  const [tech, setTech] = useState("");
  const [q, setQ] = useState("");
  const [mm, setMm] = useState("");

  useEffect(() => { const t = new URLSearchParams(location.search).get("t"); if (t) setTech(t); }, []);
  useEffect(() => {
    const u = new URL(location.href);
    tech ? u.searchParams.set("t", tech) : u.searchParams.delete("t");
    history.replaceState(null, "", u);
  }, [tech]);

  const shown = useMemo(() => {
    const n = parseFloat(mm.replace(",", "."));
    const nq = norm(q.trim());
    return items.filter((p) =>
      (!tech || p.tech === tech) &&
      (!nq || norm(p.name + " " + p.subtitle).includes(nq)) &&
      (isNaN(n) || (p.max != null && n >= (p.min ?? 0) && n <= p.max)));
  }, [items, tech, q, mm]);

  const f = (n: number) => String(n).replace(".", lang === "it" ? "," : ".");
  return (
    <div className="cat">
      <div className="filters">
        <div>
          <label htmlFor="q">{labels.search}</label>
          <input id="q" className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mm">{labels.thickness}</label>
          <input id="mm" className="input mono" inputMode="decimal" placeholder="2,0" value={mm} onChange={(e) => setMm(e.target.value)} />
        </div>
        <div role="group" aria-labelledby="tl">
          <span id="tl" style={{ display: "block", fontWeight: 700, fontSize: ".92rem", marginBottom: 8 }}>{labels.tech}</span>
          <div className="chips">
            <button className="chip" aria-pressed={!tech} onClick={() => setTech("")}>{labels.all}</button>
            {techs.map((t) => (<button key={t.key} className="chip" aria-pressed={tech === t.key} onClick={() => setTech(t.key)}>{t.name}</button>))}
          </div>
        </div>
      </div>
      <div>
        <p className="count" aria-live="polite">{shown.length} {labels.results}</p>
        {shown.length ? (
          <div className="pgrid">
            {shown.map((p, i) => (
              <Link key={p.slug} href={p.href} className="ptile">
                <div className="ptile-img">
                  {p.badge && <span className="tag-new">{labels.newTag}</span>}
                  <Image src={`/media/${p.image}`} alt={p.alt} fill sizes="(min-width: 1200px) 28vw, (min-width: 560px) 45vw, 100vw" priority={i < 3} />
                </div>
                <div className="ptile-body">
                  <h3>{p.name}</h3>
                  <p>{p.subtitle}</p>
                  <div className="meta">{p.meta.map((m) => (<span key={m}>{m}</span>))}{p.max != null && <span>{p.min != null ? `${f(p.min)}–${f(p.max)}` : `${lang === "it" ? "fino a" : "up to"} ${f(p.max)}`} mm</span>}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="empty">{labels.none}</p>}
      </div>
    </div>
  );
}
