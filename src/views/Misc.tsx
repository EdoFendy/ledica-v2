import Link from "next/link";
import { Img } from "@/components/Img";
import { LionArt } from "@/components/LionArt";
import { ItalyMap } from "@/components/ItalyMap";
import { WhyArt } from "@/components/WhyArt";
import { Md } from "@/components/Md";
import { RfqForm } from "@/components/RfqForm";
import { CtaBand, PageHead, L } from "@/components/Bits";
import { Arrow } from "@/components/Icons";
import { dict } from "@/lib/dict";
import { itemHref, sectionHref } from "@/lib/routes";
import { allCases, allProducts, allTechs, fmtDate, getSite, techByKey, loc } from "@/lib/site";
import { list } from "@/lib/content";
import { tr, type Lang, type Row } from "@/lib/types";

function LogoOnPaper() { return <img src="/media/logo-ledica.png" alt="LE.DI.CA." width={1400} height={444} style={{ width: "min(80%, 420px)", height: "auto" }} />; }
const root = (lang: Lang) => ({ label: "LE.DI.CA.", href: sectionHref(lang) });

export function AppList({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.applications }]} title={t.applications} lead={L(lang, "Il settore cambia le priorità: numero di passate, cordone interno, ripetibilità. Ecco come le affrontiamo.", "Each sector sets different priorities: number of passes, inside bead, repeatability. Here is how we address them.")} />
      <section className="sec"><div className="wrap">
        {list("application").map((r) => (
          <Link key={r.id} href={itemHref(lang, r)} className="trow has-img">
            <div className="trow-img"><Img src={allCases().find((c) => c.slug_it === r.data.cases[0])?.data.images[0] ?? ""} lang={lang} sizes="112px" quality={60} /></div>
            <h2 className="d3" style={{ fontSize: "clamp(1.5rem,2.8vw,2.2rem)" }}>{tr(r.data.name, lang)}</h2><p>{tr(r.data.summary, lang)}</p><span /><Arrow className="arrow" />
          </Link>
        ))}
      </div></section>
    </>
  );
}

export function AppDetail({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const d = row.data;
  const techs = allTechs().filter((x) => d.techs.includes(x.data.key));
  const cases = allCases().filter((c) => d.cases.includes(c.slug_it));
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.applications, href: sectionHref(lang, "applications") }, { label: tr(d.name, lang) }]} title={tr(d.name, lang)} lead={tr(d.summary, lang)} />
      <section className="sec-s"><div className="wrap"><div className="band">
        {cases.slice(0, 3).map((c, i) => (<div key={c.id} className={`ph${i === 0 ? " tall" : ""}`}><Img src={c.data.images[0]} lang={lang} sizes="(min-width: 800px) 50vw, 100vw" /><span className="cap">{loc(c, lang)} · {c.data.year}</span></div>))}
      </div></div></section>
      <section className="sec"><div className="wrap split">
        <div className="prose"><p style={{ fontSize: "1.2rem" }}>{tr(d.body, lang)}</p></div>
        <div>
          <h2 className="d3" style={{ marginBottom: 12 }}>{t.nav_tech}</h2>
          {techs.map((x) => (<Link key={x.id} href={itemHref(lang, x)} className="nrow" style={{ gridTemplateColumns: "1fr 40px" }}><h3>{tr(x.data.name, lang)}</h3><Arrow className="arrow" /></Link>))}
          <h2 className="d3" style={{ margin: "40px 0 12px" }}>{t.related_cases}</h2>
          {cases.map((x) => (<Link key={x.id} href={itemHref(lang, x)} className="nrow" style={{ gridTemplateColumns: "1fr 40px" }}><h3>{tr(x.data.title, lang)}</h3><Arrow className="arrow" /></Link>))}
        </div>
      </div></section>
      <CtaBand lang={lang} href={`${sectionHref(lang, "rfq")}?tipo=test`} tel={getSite().company.phone} />
    </>
  );
}

export function NewsList({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const news = list("news").sort((a, b) => b.data.date.localeCompare(a.data.date));
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.nav_news }]} title={t.nav_news} />
      <section className="sec"><div className="wrap">
        {news.length ? news.map((r) => (
          <Link key={r.id} href={itemHref(lang, r)} className="nrow has-img">
            <time dateTime={r.data.date}>{fmtDate(r.data.date, lang)}</time>
            <div className="row-thumb">{r.data.image && <Img src={r.data.image} lang={lang} sizes="120px" quality={60} />}</div>
            <div><h2 style={{ fontSize: "1.3rem", fontStretch: "90%" }}>{tr(r.data.title, lang)}</h2><p className="muted" style={{ margin: "6px 0 0", maxWidth: "62ch" }}>{tr(r.data.summary, lang)}</p></div>
            <Arrow className="arrow" />
          </Link>
        )) : <p className="empty">{t.news_empty}</p>}
      </div></section>
    </>
  );
}

export function NewsDetail({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const d = row.data;
  const link = d.link?.slug ? (d.link.kind === "case" ? allCases() : allProducts()).find((r) => r.slug_it === d.link.slug) : null;
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.nav_news, href: sectionHref(lang, "news") }, { label: tr(d.title, lang) }]} title={tr(d.title, lang)} lead={`${t.published} ${fmtDate(d.date, lang)}`} />
      <section className="sec"><div className="wrap split">
        <div>
          <p className="lead">{tr(d.summary, lang)}</p>
          {tr(d.body, lang) && <Md text={tr(d.body, lang)} />}
          {link && <p style={{ marginTop: 32 }}><Link href={itemHref(lang, link)} className="btn">{t.read_more}: {tr(link.data.title ?? link.data.name, lang)}<Arrow /></Link></p>}
        </div>
        {d.image && <div className="case-img" style={{ aspectRatio: "4/3" }}><Img src={d.image} lang={lang} sizes="(min-width: 900px) 45vw, 100vw" /></div>}
      </div></section>
    </>
  );
}

export function Company({ lang, row }: { lang: Lang; row: Row | null }) {
  const t = dict(lang);
  const site = getSite();
  const fairs = site.fairs.filter((f) => f.show);
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.nav_company }]} title={row ? tr(row.data.title, lang) : t.nav_company} lead={row ? tr(row.data.lead, lang) : undefined} lion />
      <section className="sec-s"><div className="wrap"><div className="band">
        <div className="ph tall"><Img src="home1ok.jpg" lang={lang} sizes="(min-width: 800px) 55vw, 100vw" priority alt={L(lang, "Quadro di comando LE.DI.CA. su una profilatrice", "LE.DI.CA. control panel on a tube mill")} /><span className="cap">{L(lang, "Quadro di comando e torcia tricatodo su linea", "Control panel and tri-cathode torch on a line")}</span></div>
        <div className="ph"><Img src="tricathode-torch-tig-on-mill.jpg" lang={lang} sizes="(min-width: 800px) 40vw, 100vw" /></div>
        <div className="ph" style={{ display: "grid", placeItems: "center", background: "var(--ink)" }}><LogoOnPaper /></div>
      </div></div></section>
      <section className="sec"><div className="wrap split">
        <div>{row && <Md text={tr(row.data.body, lang)} />}</div>
        <div>
          <h2 className="d3" style={{ marginBottom: 12 }}>{t.timeline}</h2>
          <div className="tl">{site.timeline.map((e) => (<div key={e.year}><span className="y">{e.year}</span><p style={{ margin: 0 }}>{tr(e.text, lang)}</p></div>))}</div>
        </div>
      </div></section>
      <section className="sec alt"><div className="wrap">
        <h2 className="d2" style={{ marginBottom: 36 }}>{t.team}</h2>
        <div className="team">{site.team.map((p) => (
          <div key={p.name} className="person">
            <div className="avatar" aria-hidden="true">{p.photo ? <Img src={p.photo} lang={lang} sizes="72px" alt={p.name} /> : p.name.split(" ").map((w) => w[0]).join("")}</div>
            <div><h3>{p.name}</h3><p>{tr(p.role, lang)}</p><p className="since">{t.since} {p.since}</p></div>
          </div>
        ))}</div>
      </div></section>
      {fairs.length > 0 && (
        <section className="sec"><div className="wrap">
          <h2 className="d2" style={{ marginBottom: 28 }}>{t.fairs}</h2>
          {fairs.map((f) => (<div key={f.name} className="nrow" style={{ gridTemplateColumns: "220px 1fr" }}><time>{tr(f.dates, lang)}</time><h3>{f.name} · {f.place}</h3></div>))}
        </div></section>
      )}
      <CtaBand lang={lang} href={sectionHref(lang, "contact")} title={L(lang, "Parliamo della tua linea", "Let's talk about your line")} body={L(lang, "Raccontaci materiale, spessori e velocità attuali: ti rispondiamo con una proposta tecnica.", "Tell us your material, wall thicknesses and current speed: we reply with a technical proposal.")} label={t.nav_contact} tel={site.company.phone} />
    </>
  );
}

export function Contact({ lang, products }: { lang: Lang; products: { slug: string; name: string }[] }) {
  const t = dict(lang);
  const { company: c, routing } = getSite();
  const tel = c.phone.replace(/\s/g, "");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.address}, ${c.zip} ${c.city}`)}`;
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.nav_contact }]} title={t.contact_title} lead={t.contact_lead} />
      <section className="sec"><div className="wrap cgrid">
        <dl className="clist">
          <div><dt>{t.c_phone}</dt><dd><a href={`tel:${tel}`} className="mono">{c.phone}</a></dd></div>
          <div><dt>{t.c_mail}</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd></div>
          {c.pec && <div><dt>PEC</dt><dd><a href={`mailto:${c.pec}`}>{c.pec}</a></dd></div>}
          <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(t.c_wa_msg)}`} rel="noopener">{t.c_wa}</a></dd></div>
          <div><dt>{t.c_where}</dt><dd>{c.address}<br />{c.zip} {c.city}<br /><a href={maps} rel="noopener" style={{ fontSize: ".95rem", fontWeight: 400 }}>Google Maps →</a></dd></div>
          {tr(c.hours, lang) && <div><dt>{t.c_hours}</dt><dd>{tr(c.hours, lang)}</dd></div>}
          {routing.sales !== routing.service && (<><div><dt>{t.c_sales}</dt><dd><a href={`mailto:${routing.sales}`}>{routing.sales}</a></dd></div><div><dt>{t.c_service}</dt><dd><a href={`mailto:${routing.service}`}>{routing.service}</a></dd></div></>)}
          <div><dt>{L(lang, "Dati societari", "Company data")}</dt><dd style={{ fontSize: ".95rem", fontWeight: 400 }}>{c.legal} · P. IVA {c.vat}<br />Cap. soc. {c.capital}{c.rea ? ` · REA ${c.rea}` : ""}</dd></div>
        </dl>
        <div>
          <ItalyMap label={L(lang, "Mappa dell'Italia con la sede di Rozzano", "Map of Italy with the Rozzano site")} city="Rozzano (MI)" />
          <h2 className="d3" style={{ margin: "36px 0 20px" }}>{t.nav_contact}</h2>
          <RfqForm lang={lang} products={products} initialKind="info" />
        </div>
      </div></section>
    </>
  );
}

export function RfqPage({ lang, products, kind, product }: { lang: Lang; products: { slug: string; name: string }[]; kind?: string; product?: string }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: t.cta_quote_short }]} title={t.cta_quote} lead={L(lang, "Più dati tecnici inserisci, più precisa sarà la risposta del nostro ufficio tecnico.", "The more technical data you enter, the more precise our engineering office's answer will be.")} />
      <section className="sec"><div className="wrap"><RfqForm lang={lang} products={products} initialKind={kind} initialProduct={product} /></div></section>
    </>
  );
}

export function PageView({ lang, row }: { lang: Lang; row: Row }) {
  const t = dict(lang);
  const site = getSite();
  const isService = row.slug_it === "assistenza";
  return (
    <>
      <PageHead lang={lang} crumbs={[root(lang), { label: tr(row.data.title, lang) }]} title={tr(row.data.title, lang)} lead={tr(row.data.lead, lang)} />
      {isService && (<section className="sec-s"><div className="wrap"><div className="band">
        <div className="ph tall"><Img src="cofano-comando-multicatodo-pptt.jpg" lang={lang} sizes="(min-width: 800px) 55vw, 100vw" /><span className="cap">{L(lang, "Cofano di comando multicatodo", "Multi-cathode control cabinet")}</span></div>
        <div className="ph"><Img src="id-tig-torch-magnetic-arc-oscillator-inside-the-tube-1.jpg" lang={lang} sizes="40vw" /></div>
        <div className="ph" style={{ display: "grid", placeItems: "center", background: "var(--paper-2)", padding: 16 }}><WhyArt kind="retrofit" /></div>
      </div></div></section>)}
      <section className="sec"><div className="wrap"><Md text={tr(row.data.body, lang)} /></div></section>
      {isService && <CtaBand lang={lang} href={`${sectionHref(lang, "rfq")}?tipo=retrofit`} title={L(lang, "Retrofit o ricambi?", "Retrofit or spare parts?")} body={L(lang, "Indicaci la linea o il codice del pezzo.", "Tell us your line or the part code.")} label={t.f_type_retrofit} tel={site.company.phone} />}
    </>
  );
}

export function NotFoundView({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="phead"><div className="phead-lion" aria-hidden="true"><LionArt /></div><div className="wrap nf">
      <p className="mono muted">404</p>
      <h1 className="d1">{t.not_found}</h1>
      <p className="lead">{t.not_found_body}</p>
      <p><Link href={sectionHref(lang)} className="btn">{t.go_home}<Arrow /></Link></p>
    </div></div>
  );
}
