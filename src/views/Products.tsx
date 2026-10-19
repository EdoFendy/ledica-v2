import Link from "next/link";
import { Catalog, type CatItem } from "@/components/Catalog";
import { Gallery } from "@/components/Gallery";
import { VideoFacade } from "@/components/VideoFacade";
import { PTile } from "@/components/PTile";
import { RangeGauge } from "@/components/RangeGauge";
import { Arrow } from "@/components/Icons";
import { CtaBand, PageHead, JsonLd, crumbLd } from "@/components/Bits";
import { dict } from "@/lib/dict";
import { abs, itemHref, sectionHref } from "@/lib/routes";
import { allCases, allProducts, allTechs, altFor, getSite, range, techByKey, loc } from "@/lib/site";
import { tr, type Lang, type Row } from "@/lib/types";

const PHOTO = /on-mill|img-\d|impianto|saldatura|15khz|ppt-torch|internal-tig|press-|dscn|unnamed|home|inside-the-tube|diameter|scaled|laser|mac-weld|plasma-tig-inclinabile|pttt|saldatrice|ledica-pulseweld|whatsapp|foto-articolo/i;

export function ProductList({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const techs = allTechs();
  const techName = (k: string) => tr(techByKey(k)?.data.name, lang);
  const items: CatItem[] = allProducts().map((r) => {
    const cur = r.data.specs?.find((s: any) => s.label.en === "Current" || s.label.en === "TIG current");
    return { slug: r.slug_it, href: itemHref(lang, r), name: tr(r.data.name, lang), subtitle: tr(r.data.subtitle, lang), tech: r.data.tech, min: r.data.thickMin ?? null, max: r.data.thickMax ?? null,
      image: r.data.images[0], alt: altFor(r.data.images[0], lang, tr(r.data.name, lang)), badge: r.data.badge === "new", meta: cur ? [tr(cur.value, lang)] : [] };
  });
  return (
    <>
      <PageHead lang={lang} crumbs={[{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_products }]} title={t.nav_products} lead={lang === "it" ? "Torce, generatori e accessori per saldare tubi in linea. Filtra per tecnologia o per lo spessore che devi saldare." : "Torches, power sources and accessories for in-line tube welding. Filter by technology or by the wall thickness you need to weld."} />
      <section className="sec-s" style={{ paddingBottom: 96 }}><div className="wrap">
        <Catalog items={items} lang={lang} techs={techs.map((r) => ({ key: r.data.key, name: techName(r.data.key) }))}
          labels={{ tech: t.filter_tech, all: t.all, search: t.filter_search, thickness: t.filter_thickness, results: t.results, none: t.no_results, newTag: lang === "it" ? "Novità" : "New" }} />
      </div></section>
    </>
  );
}

export function ProductDetail({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const site = getSite();
  const d = row.data;
  const name = tr(d.name, lang);
  const tech = techByKey(d.tech);
  const same = allProducts().filter((p) => p.data.tech === d.tech && p.id !== row.id).slice(0, 3);
  const cases = allCases().filter((c) => c.data.products?.includes(row.slug_it));
  const rfq = `${sectionHref(lang, "rfq")}?tipo=quote&prodotto=${row.slug_it}`;
  const crumbs = [{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: t.nav_products, href: sectionHref(lang, "products") }, ...(tech ? [{ label: tr(tech.data.name, lang), href: itemHref(lang, tech) }] : []), { label: name }];
  const gallery = d.images.map((src: string) => ({ src, alt: altFor(src, lang, name), photo: PHOTO.test(src) }));
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name, description: tr(d.summary, lang), brand: { "@type": "Brand", name: "LE.DI.CA." }, manufacturer: { "@type": "Organization", name: "LE.DI.CA. Srl" },
        image: d.images.map((i: string) => abs(`/media/${i}`)), url: abs(itemHref(lang, row)),
        additionalProperty: d.specs.map((s: any) => ({ "@type": "PropertyValue", name: tr(s.label, lang), value: tr(s.value, lang) })) }} />
      <JsonLd data={crumbLd(crumbs.map((c, i) => ({ name: c.label, path: c.href ?? itemHref(lang, row) })))} />
      <PageHead lang={lang} crumbs={crumbs} title={name} lead={tr(d.subtitle, lang)} badge={d.badge === "new" ? (lang === "it" ? "Novità" : "New") : undefined} />
      <section className="sec-s" style={{ paddingTop: "clamp(32px,5vw,64px)" }}><div className="wrap pdp">
        <Gallery items={gallery} />
        <div>
          <p className="lead" style={{ marginBottom: 28 }}>{tr(d.summary, lang)}</p>
          <h2 className="d3" style={{ marginBottom: 12 }}>{t.tech_data}</h2>
          <table className="spec"><tbody>
            {d.specs.map((s: any, i: number) => (<tr key={i}><th scope="row">{tr(s.label, lang)}</th><td>{tr(s.value, lang)}</td></tr>))}
            {range(d.thickMin, d.thickMax, lang) && <tr><th scope="row">{t.thickness}</th><td>{range(d.thickMin, d.thickMax, lang)}</td></tr>}
          </tbody></table>
          {d.thickMin != null && d.thickMax != null && <RangeGauge min={d.thickMin} max={d.thickMax} label={t.thickness} lang={lang} />}
          <div className="pdp-cta">
            <Link href={rfq} className="btn">{t.cta_quote}<Arrow /></Link>
            <Link href={`/scheda/${lang}/${row.slug_it}`} className="btn btn-line" style={{ color: "var(--ink)" }} target="_blank" rel="noopener">{t.datasheet}</Link>
          </div>
          <p className="vid-note" style={{ marginTop: -12 }}>{t.datasheet_note}</p>
          {d.perf?.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 className="d3" style={{ marginBottom: 12 }}>{lang === "it" ? "Velocità di saldatura" : "Welding speed"}</h2>
              <div className="perf">{d.perf.map((p: any, i: number) => (<div key={i} className="perf-row"><span>{tr(p.label, lang)}</span><b>{p.value}</b></div>))}</div>
            </div>
          )}
        </div>
      </div></section>

      <section className="sec-s"><div className="wrap split">
        <div>
          <h2 className="d3" style={{ marginBottom: 8 }}>{t.benefits}</h2>
          <ul className="benefits">{d.benefits.map((b: any, i: number) => (<li key={i}>{tr(b, lang)}</li>))}</ul>
        </div>
        {tr(d.body, lang) && <div className="prose"><p>{tr(d.body, lang)}</p></div>}
      </div></section>

      {d.videos?.length > 0 && (
        <section className="sec-s"><div className="wrap">
          <h2 className="d3" style={{ marginBottom: 20 }}>{t.video}</h2>
          <div className="videos">{d.videos.map((id: string, i: number) => (<VideoFacade key={id} id={id} title={`${name} — ${t.video} ${i + 1}`} label={t.play_video} />))}</div>
          <p className="vid-note">{t.video_privacy}</p>
        </div></section>
      )}

      {cases.length > 0 && (
        <section className="sec dark"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 28 }}>{t.related_cases}</h2>
          <div className="case-list">{cases.map((c) => (<Link key={c.id} href={itemHref(lang, c)} className="case-row"><span className="case-v">{c.data.headline.value}</span><span className="case-t">{tr(c.data.title, lang)}</span><span className="mono muted" style={{ fontSize: ".85rem" }}>{loc(c, lang)} · {c.data.year}</span></Link>))}</div>
        </div></section>
      )}
      {same.length > 0 && (
        <section className="sec alt"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 36 }}>{t.related_products}</h2>
          <div className="pgrid">{same.map((p) => <PTile key={p.id} r={p} lang={lang} />)}</div>
        </div></section>
      )}
      <CtaBand lang={lang} href={rfq} title={t.quote_for} body={t.quote_body} label={t.cta_quote} tel={site.company.phone} />
    </>
  );
}
