import Link from "next/link";
import { Img } from "@/components/Img";
import type { Lane } from "@/components/Ruler";
import { HeroStage } from "@/components/HeroStage";
import { Scope } from "@/views/Techs";
import { LionArt } from "@/components/LionArt";
import { WhyArt } from "@/components/WhyArt";
import { WorldMap } from "@/components/WorldMap";
import { CtaBand, L, JsonLd } from "@/components/Bits";
import { Arrow } from "@/components/Icons";
import { dict } from "@/lib/dict";
import { itemHref, sectionHref, abs } from "@/lib/routes";
import { allCases, allTechs, fmtDate, getSite, range, techByKey, loc } from "@/lib/site";
import { list } from "@/lib/content";
import { COUNTRY } from "@/lib/countries";
import { tr, type Lang } from "@/lib/types";

const LANES = ["laser-fibra", "tig-multicatodo", "combo-plasma-tig", "plasma-key-hole"];

export function Home({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const site = getSite();
  const techs = allTechs();
  const lanes: Lane[] = LANES.map((k) => techByKey(k)!).filter(Boolean).map((r) => ({
    key: r.data.key, name: tr(r.data.name, lang), href: itemHref(lang, r), min: r.data.thickMin, max: r.data.thickMax, summary: tr(r.data.summary, lang),
  }));
  const cases = allCases().slice(0, 4);
  const news = list("news").sort((a, b) => b.data.date.localeCompare(a.data.date)).slice(0, 3);
  const [h1a, h1b] = t.home_h1.split(/,\s*/);
  const n = site.numbers;
  const countries = site.countries;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "LE.DI.CA. Srl", url: abs("/"), logo: abs("/icon.svg"), foundingDate: "1989", vatID: site.company.vat,
        address: { "@type": "PostalAddress", streetAddress: site.company.address, postalCode: site.company.zip, addressLocality: "Rozzano", addressCountry: "IT" },
        telephone: site.company.phone, email: site.company.email, sameAs: Object.values(site.social).filter(Boolean) }} />

      <section className="hero">
        <HeroStage lanes={lanes} lang={lang}
          text={{ title: t.ruler_title, hint: t.ruler_hint, covers: t.ruler_covers, none: t.ruler_none, see: t.ruler_see }}
          labels={{ laser: L(lang, "Laser fibra · fascio focalizzato", "Fibre laser · focused beam"), tri: L(lang, "TIG tricatodo · tre archi in linea", "Tri-cathode TIG · three arcs in line"), keyhole: L(lang, "Plasma key-hole + TIG · una passata", "Plasma key-hole + TIG · single pass"), wall: L(lang, "parete", "wall") }}
          caption={L(lang, "illustrazione schematica", "schematic illustration")}
          photo={<Img src="tricathode-torch-tig-on-mill.jpg" lang={lang} sizes="(min-width: 980px) 38vw, 100vw" priority alt="Torcia tricatodo TIG su profilatrice" />}>
          <h1 className="d1">{h1a},<br /><em>{h1b}</em></h1>
          <p className="lead">{t.home_lead}</p>
          <div className="hero-cta">
            <Link href={sectionHref(lang, "rfq") + "?tipo=test"} className="btn">{t.cta_test}<Arrow /></Link>
            <Link href={sectionHref(lang, "technologies")} className="btn btn-line">{t.nav_tech}</Link>
          </div>
        </HeroStage>
      </section>

      <section className="sec brand">
        <div className="wrap brand-grid">
          <div>
            <p className="statement rv">
              {L(lang, "Nella saldatura dei tubi inox dal ", "In stainless tube welding since ")}<b>{n.since}</b>{L(lang, ". Oltre ", ". Over ")}<b>{n.plants}</b>{L(lang, " impianti installati in ", " plants installed in ")}<b>{countries.length}</b>{L(lang, " Paesi. Produttività TIG fino al ", " countries. TIG productivity up to ")}<b className="perf">+{n.gain}%</b>{L(lang, " sugli spessori da 0,8 a 3 mm.", " on walls from 0.8 to 3 mm.")}
            </p>
          </div>
          <LionArt />
        </div>
        <div className="wrap">
          <div className="clients" aria-label={t.clients}>
            {site.clients.filter((c) => c.show).map((c) => (<span key={c.name}>{c.name}</span>))}
          </div>
        </div>
      </section>

      <section className="sec rule-t" style={{ paddingTop: "clamp(48px,6vw,88px)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div><h2 className="d2">{t.tech_title}</h2><p className="muted" style={{ marginTop: 16, maxWidth: "56ch" }}>{L(lang, "La scelta parte da due dati: il materiale e lo spessore di parete. Ogni tecnologia LE.DI.CA. copre un campo preciso, sulla stessa scala del righello qui sopra.", "The choice starts from two facts: material and wall thickness. Each LE.DI.CA. technology covers a precise range, on the same scale as the ruler above.")}</p></div>
            <Link href={sectionHref(lang, "technologies")} className="link-arrow">{t.discover}<Arrow /></Link>
          </div>
          <div>
            {techs.map((r) => {
              return (
                <Link key={r.id} href={itemHref(lang, r)} className="trow has-img rv">
                  <div className="trow-img"><Img src={r.data.image} lang={lang} sizes="112px" quality={60} /></div>
                  <h3>{tr(r.data.name, lang)}</h3>
                  <p>{tr(r.data.summary, lang)}</p>
                  <Scope r={r} lang={lang} />
                  <Arrow className="arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap">
          <div className="sec-head">
            <div><h2 className="d2">{t.cases_title}</h2><p className="muted" style={{ marginTop: 16, maxWidth: "56ch" }}>{L(lang, "Consegne recenti a tubifici e costruttori di linee in Europa, Medio Oriente, India e Stati Uniti. Per ognuna: il problema di partenza, la configurazione installata, il risultato.", "Recent deliveries to tube makers and line builders in Europe, the Middle East, India and the United States. For each: the starting problem, the installed configuration, the result.")}</p></div>
            <Link href={sectionHref(lang, "cases")} className="link-arrow">{t.cases_all}<Arrow /></Link>
          </div>
          {cases[0] && (
            <Link href={itemHref(lang, cases[0])} className="case-lead" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="case-img"><Img src={cases[0].data.images[0]} lang={lang} sizes="(min-width: 900px) 55vw, 100vw" quality={85} /></div>
              <div style={{ alignSelf: "center" }}>
                <div className="case-meta"><span>{loc(cases[0], lang)}</span><span>{cases[0].data.year}</span></div>
                <div className="case-big">{cases[0].data.headline.value}</div>
                <p className="muted" style={{ margin: "6px 0 24px" }}>{tr(cases[0].data.headline.label, lang)}</p>
                <h3 className="d3">{tr(cases[0].data.title, lang)}</h3>
              </div>
            </Link>
          )}
          <div className="case-list">
            {cases.slice(1).map((c) => (
              <Link key={c.id} href={itemHref(lang, c)} className="case-row">
                <span className="case-v">{c.data.headline.value}</span>
                <span className="case-t">{tr(c.data.title, lang)}</span>
                <span className="mono muted" style={{ fontSize: ".85rem" }}>{loc(c, lang)} · {c.data.year}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <h2 className="d2" style={{ marginBottom: "clamp(32px,5vw,56px)" }}>{t.why_title}</h2>
          <div className="why">
            <div className="rv"><WhyArt kind="retrofit" /><h3>{L(lang, "Progettati sulla tua linea", "Designed around your line")}</h3><p>{L(lang, "Torce, generatori e quadri nascono sulla profilatrice del cliente, non da un catalogo. Le torce tricatodo si collegano anche a impianti esistenti, con un blocco di connessione.", "Torches, power sources and controls are designed on the customer's tube mill, not taken from a catalogue. Tri-cathode torches also connect to existing plants, with a connection block.")}</p></div>
            <div className="rv"><WhyArt kind="range" /><h3>{L(lang, "Dal sottile al grosso spessore", "From thin to heavy wall")}</h3><p>{L(lang, "Laser da 0,2 mm, TIG multicatodo fino a 3,5 mm, plasma key-hole fino a 10–12 mm in una sola passata. Un unico fornitore per tutto il campo, quindi un consiglio non legato a una sola tecnologia.", "Laser from 0.2 mm, multi-cathode TIG up to 3.5 mm, plasma key-hole up to 10–12 mm in a single pass. One supplier for the whole range, so advice not tied to a single technology.")}</p></div>
            <div className="rv"><WhyArt kind="team" /><h3>{L(lang, "Dal progetto all'assistenza, le stesse persone", "From design to service, the same people")}</h3><p>{L(lang, "Chi progetta l'impianto lo installa, lo collauda e lo segue in produzione. Nella saldatura dei tubi dal 1967, come LE.DI.CA. dal 1989.", "The people who design the plant install it, commission it and support it in production. In tube welding since 1967, as LE.DI.CA. since 1989.")}</p></div>
          </div>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap">
          <div className="sec-head"><h2 className="d2">{t.numbers_countries}</h2><p className="muted">{L(lang, "Progettati e costruiti a Rozzano, gli impianti LE.DI.CA. lavorano nei Paesi evidenziati.", "Designed and built in Rozzano, LE.DI.CA. plants run in the highlighted countries.")}</p></div>
          <WorldMap on={countries} label={L(lang, "Mappa dei Paesi serviti", "Map of countries served")} />
          <ul className="map-list">{countries.map((id) => (<li key={id}>{COUNTRY[id]?.[lang]}</li>))}</ul>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><h2 className="d2">{t.news_title}</h2><Link href={sectionHref(lang, "news")} className="link-arrow">{t.news_all}<Arrow /></Link></div>
          <div>
            {news.map((r) => (
              <Link key={r.id} href={itemHref(lang, r)} className="nrow">
                <time dateTime={r.data.date}>{fmtDate(r.data.date, lang)}</time>
                <h3>{tr(r.data.title, lang)}</h3>
                <Arrow className="arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand lang={lang} href={sectionHref(lang, "rfq") + "?tipo=test"} tel={site.company.phone} />
    </>
  );
}
