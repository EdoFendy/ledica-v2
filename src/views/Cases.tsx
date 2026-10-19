import Link from "next/link";
import { Img } from "@/components/Img";
import { VideoFacade } from "@/components/VideoFacade";
import { CtaBand, PageHead, JsonLd, crumbLd } from "@/components/Bits";
import { Arrow } from "@/components/Icons";
import { dict } from "@/lib/dict";
import { abs, itemHref, sectionHref } from "@/lib/routes";
import { allCases, allProducts, getSite, techByKey, loc } from "@/lib/site";
import { tr, type Lang, type Row } from "@/lib/types";

export function CaseList({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const cases = allCases();
  return (
    <>
      <PageHead lang={lang} crumbs={[{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_cases }]} title={t.nav_cases}
        lead={lang === "it" ? "Impianti consegnati: il problema di partenza, la configurazione installata, il risultato." : "Plants delivered: the starting problem, the installed configuration, the result."} />
      <section className="sec dark" style={{ borderTop: "1px solid var(--rule-d)" }}><div className="wrap">
        <div className="imgs" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 40 }}>
          {cases.map((c) => (
            <Link key={c.id} href={itemHref(lang, c)} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="case-img" style={{ marginBottom: 18 }}><Img src={c.data.images[0]} lang={lang} sizes="(min-width: 900px) 30vw, 100vw" /></div>
              <div className="case-meta"><span>{loc(c, lang)}</span><span>{c.data.year}</span><span>{tr(c.data.sector, lang)}</span></div>
              {c.data.headline?.value && <div className="case-big" style={{ fontSize: "2.2rem" }}>{c.data.headline.value}</div>}
              <h2 className="d3" style={{ marginTop: 10 }}>{tr(c.data.title, lang)}</h2>
            </Link>
          ))}
        </div>
      </div></section>
    </>
  );
}

export function CaseDetail({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const site = getSite();
  const d = row.data;
  const title = tr(d.title, lang);
  const prods = allProducts().filter((p) => d.products?.includes(p.slug_it));
  const crumbs = [{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_cases, href: sectionHref(lang, "cases") }, { label: title }];
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: title, datePublished: d.date, inLanguage: lang, image: d.images.map((i: string) => abs(`/media/${i}`)), author: { "@type": "Organization", name: "LE.DI.CA. Srl" }, publisher: { "@type": "Organization", name: "LE.DI.CA. Srl" } }} />
      <JsonLd data={crumbLd([{ name: "LE.DI.CA.", path: sectionHref(lang) }, { name: t.nav_cases, path: sectionHref(lang, "cases") }, { name: title, path: itemHref(lang, row) }])} />
      <PageHead lang={lang} crumbs={crumbs} title={title}
        aside={d.headline?.value ? <div style={{ maxWidth: 380 }}><div className="case-big">{d.headline.value}</div><p className="muted" style={{ marginTop: 8 }}>{tr(d.headline.label, lang)}</p></div> : undefined} />
      <div className="dark" style={{ paddingBottom: 56 }}><div className="wrap">
        <dl className="facts" style={{ marginTop: 0, borderTop: 0 }}>
          <div><dt>{t.sector}</dt><dd>{tr(d.sector, lang)}</dd></div>
          <div><dt>{t.country}</dt><dd>{tr(d.country, lang)}</dd></div>
          <div><dt>{t.year}</dt><dd className="mono">{d.year}</dd></div>
          <div><dt>{lang === "it" ? "Cliente" : "Client"}</dt><dd>{tr(d.client, lang)}</dd></div>
        </dl>
      </div></div>
      <section className="sec"><div className="wrap">
        <div className="split">
          <div><h2 className="d3" style={{ marginBottom: 14 }}>{t.challenge}</h2><p className="lead">{tr(d.challenge, lang)}</p></div>
          <div><h2 className="d3" style={{ marginBottom: 14 }}>{t.solution}</h2><p className="lead">{tr(d.solution, lang)}</p></div>
        </div>
        <h2 className="d3" style={{ margin: "clamp(48px,6vw,88px) 0 20px" }}>{t.case_results}</h2>
        <div className="res">{d.results.map((r: any, i: number) => (<div key={i}><b>{r.value}</b><span>{tr(r.label, lang)}</span></div>))}</div>
        {d.quote && <blockquote className="quote" style={{ margin: "clamp(48px,6vw,88px) 0 0" }}>“{tr(d.quote.text, lang)}”<cite>{d.quote.who}</cite></blockquote>}
      </div></section>
      <section className="sec-s"><div className="wrap">
        <div className="imgs">{d.images.map((src: string) => (<div key={src} className="im"><Img src={src} lang={lang} sizes="(min-width: 900px) 33vw, 100vw" alt={title} /></div>))}</div>
      </div></section>
      {d.videos?.length > 0 && <section className="sec-s"><div className="wrap"><div className="videos">{d.videos.map((id: string) => (<VideoFacade key={id} id={id} title={title} label={t.play_video} />))}</div><p className="vid-note">{t.video_privacy}</p></div></section>}
      {prods.length > 0 && (
        <section className="sec alt"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 28 }}>{t.used_products}</h2>
          {prods.map((p) => (<Link key={p.id} href={itemHref(lang, p)} className="nrow" style={{ gridTemplateColumns: "1fr 40px" }}><h3>{tr(p.data.name, lang)}</h3><Arrow className="arrow" /></Link>))}
        </div></section>
      )}
      <CtaBand lang={lang} href={`${sectionHref(lang, "rfq")}?tipo=test`} tel={site.company.phone} />
    </>
  );
}
