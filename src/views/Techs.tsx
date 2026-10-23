import Link from "next/link";
import { Img } from "@/components/Img";
import { Md } from "@/components/Md";
import { PTile } from "@/components/PTile";
import type { Lane } from "@/components/Ruler";
import { TorchLab, TechProcess } from "@/components/TorchLab";
import { CtaBand, PageHead, JsonLd, crumbLd } from "@/components/Bits";
import { Arrow } from "@/components/Icons";
import { dict } from "@/lib/dict";
import { itemHref, sectionHref } from "@/lib/routes";
import { allCases, allProducts, allTechs, getSite, hasRange, range, techByKey, loc } from "@/lib/site";
import { tr, type Lang, type Row } from "@/lib/types";

export function TechList({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const techs = allTechs();
  const lanes: Lane[] = ["laser-fibra", "tig-multicatodo", "combo-plasma-tig", "plasma-key-hole"].map((k) => techByKey(k)!).map((r) => ({
    key: r.data.key, name: tr(r.data.name, lang), href: itemHref(lang, r), min: r.data.thickMin, max: r.data.thickMax, summary: "",
  }));
  return (
    <>
      <PageHead lang={lang} crumbs={[{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_tech }]} title={t.tech_title} />
      <div style={{ marginTop: -1 }}><TorchLab lang={lang} lanes={lanes} /></div>
      <section className="sec"><div className="wrap">
        {techs.map((r) => (
          <Link key={r.id} href={itemHref(lang, r)} className="trow has-img">
            <div className="trow-img"><Img src={r.data.image} lang={lang} sizes="112px" quality={60} /></div>
            <h2 className="d3" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)" }}>{tr(r.data.name, lang)}</h2>
            <p>{tr(r.data.summary, lang)}</p>
            <Scope r={r} lang={lang} />
            <Arrow className="arrow" />
          </Link>
        ))}
      </div></section>
    </>
  );
}

export function TechDetail({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const site = getSite();
  const d = row.data;
  const prods = allProducts().filter((p) => p.data.tech === d.key);
  const cases = allCases().filter((c) => c.data.techs?.includes(d.key));
  const crumbs = [{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_tech, href: sectionHref(lang, "technologies") }, { label: tr(d.name, lang) }];
  return (
    <>
      <JsonLd data={crumbLd([{ name: "LE.DI.CA.", path: sectionHref(lang) }, { name: t.nav_tech, path: sectionHref(lang, "technologies") }, { name: tr(d.name, lang), path: itemHref(lang, row) }])} />
      <PageHead lang={lang} crumbs={crumbs} title={tr(d.name, lang)} lead={tr(d.subtitle, lang)}
        aside={hasRange(d) ? <div><div className="mono muted" style={{ fontSize: ".85rem" }}>{t.thickness}</div><div className="case-big">{range(d.thickMin, d.thickMax, lang)}</div></div> : <div className="case-big" style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)" }}>{tr(d.scope, lang)}</div>} />
      <TechProcess lang={lang} tech={d.key} />
      <section className="sec"><div className="wrap split">
        <div><Md text={tr(d.body, lang)} /></div>
        <aside>
          <div className="spec" style={{ borderTop: "2px solid var(--ink)" }}>
            <table><tbody>
              <tr><th scope="row">{hasRange(d) ? t.thickness : t.range}</th><td>{hasRange(d) ? range(d.thickMin, d.thickMax, lang) : tr(d.scope, lang)}</td></tr>
              <tr><th scope="row">{t.materials}</th><td style={{ fontFamily: "inherit" }}>{d.materials.map((m: any) => tr(m, lang)).join(" · ")}</td></tr>
              <tr><th scope="row">{t.nav_products}</th><td>{prods.length}</td></tr>
            </tbody></table>
          </div>
          <div className="pdp-cta"><Link href={`${sectionHref(lang, "rfq")}?tipo=test`} className="btn">{t.cta_test}<Arrow /></Link></div>
          <div className="imgs" style={{ gridTemplateColumns: "1fr" }}><div className="im" style={{ aspectRatio: "4/3" }}><Img src={d.image} lang={lang} sizes="(min-width: 900px) 40vw, 100vw" quality={85} /></div></div>
        </aside>
      </div></section>
      {prods.length > 0 && (
        <section className="sec alt"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 40 }}>{t.products_of_tech}</h2>
          <div className="pgrid">{prods.map((p) => <PTile key={p.id} r={p} lang={lang} />)}</div>
        </div></section>
      )}
      {cases.length > 0 && (
        <section className="sec dark"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 32 }}>{t.related_cases}</h2>
          <div className="case-list">{cases.map((c) => (<Link key={c.id} href={itemHref(lang, c)} className="case-row"><span className="case-v">{c.data.headline.value}</span><span className="case-t">{tr(c.data.title, lang)}</span><span className="mono muted" style={{ fontSize: ".85rem" }}>{loc(c, lang)} · {c.data.year}</span></Link>))}</div>
        </div></section>
      )}
      {d.faq?.length > 0 && (
        <section className="sec"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 32 }}>{t.qa}</h2>
          <div className="faq">{d.faq.map((f: any, i: number) => (<details key={i}><summary>{tr(f.q, lang)}</summary><p>{tr(f.a, lang)}</p></details>))}</div>
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: d.faq.map((f: any) => ({ "@type": "Question", name: tr(f.q, lang), acceptedAnswer: { "@type": "Answer", text: tr(f.a, lang) } })) }} />
        </div></section>
      )}
      <CtaBand lang={lang} href={`${sectionHref(lang, "rfq")}?tipo=test`} tel={site.company.phone} />
    </>
  );
}

/** Mini-scala 0–12 mm per le tecnologie con campo dichiarato, altrimenti l'ambito d'uso. */
export function Scope({ r, lang }: { r: Row; lang: Lang }) {
  const d = r.data;
  if (!hasRange(d)) return <div className="mini-range mono" style={{ alignSelf: "center" }}>{tr(d.scope, lang)}</div>;
  return (
    <div>
      <div className="mini-scale" aria-hidden="true"><span className="mini-bar" style={{ left: `${(d.thickMin / 12.7) * 100}%`, width: `${((d.thickMax - d.thickMin) / 12.7) * 100}%` }} /></div>
      <div className="mini-range mono">{range(d.thickMin, d.thickMax, lang)}</div>
    </div>
  );
}
