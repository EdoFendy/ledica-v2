import { notFound } from "next/navigation";
import { bySlug, byKey } from "@/lib/content";
import { dict } from "@/lib/dict";
import { getSite, range, techByKey } from "@/lib/site";
import { tr, type Lang } from "@/lib/types";
import { Img } from "@/components/Img";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

/** Scheda tecnica stampabile: generata dagli stessi campi della scheda prodotto (Ctrl/Cmd+P › Salva come PDF). */
export default async function Datasheet({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: l, slug } = await params;
  const lang: Lang = l === "en" ? "en" : "it";
  const row = bySlug("product", "it", slug);
  if (!row) notFound();
  void byKey;
  const t = dict(lang);
  const d = row.data;
  const { company: c } = getSite();
  const tech = techByKey(d.tech);
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 64px", background: "#fff", minHeight: "100vh" }}>
      <style>{`body{background:#fff} @page{margin:16mm} .ds h1{font-size:2rem;font-stretch:80%;font-weight:800;margin:0 0 4px} .ds td,.ds th{border-bottom:1px solid #d8d6cf;padding:8px 0;text-align:left;vertical-align:top;font-weight:400}.ds th{width:38%;color:#596068}.ds td{font-family:var(--font-mono);font-size:.92rem}`}</style>
      <div className="ds">
        <div className="no-print" style={{ marginBottom: 24 }}><PrintButton label={lang === "it" ? "Stampa / Salva PDF" : "Print / Save PDF"} /></div>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #14171a", paddingBottom: 14, marginBottom: 24 }}>
          <span style={{ background: "#161816", padding: "8px 12px", borderRadius: 4, lineHeight: 0, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}><img src="/media/logo-ledica-sm.png" alt="LE.DI.CA." width={170} height={54} /></span>
          <span className="mono" style={{ fontSize: ".8rem" }}>{t.datasheet}</span>
        </header>
        <h1>{tr(d.name, lang)}</h1>
        <p style={{ color: "#596068", marginTop: 0 }}>{tr(d.subtitle, lang)}</p>
        <div style={{ position: "relative", height: 300, background: "#fff", border: "1px solid #d8d6cf", margin: "18px 0" }}><Img src={d.images[0]} lang={lang} sizes="820px" quality={85} className="" /></div>
        <p>{tr(d.summary, lang)}</p>
        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>{t.tech_data}</h2>
        <table><tbody>
          {d.specs.map((s: any, i: number) => (<tr key={i}><th scope="row">{tr(s.label, lang)}</th><td>{tr(s.value, lang)}</td></tr>))}
          {range(d.thickMin, d.thickMax, lang) && <tr><th scope="row">{t.thickness}</th><td>{range(d.thickMin, d.thickMax, lang)}</td></tr>}
          {tech && <tr><th scope="row">{t.filter_tech}</th><td style={{ fontFamily: "inherit" }}>{tr(tech.data.name, lang)}</td></tr>}
        </tbody></table>
        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>{t.benefits}</h2>
        <ul style={{ paddingLeft: 18 }}>{d.benefits.map((b: any, i: number) => <li key={i}>{tr(b, lang)}</li>)}</ul>
        <footer style={{ marginTop: 40, paddingTop: 12, borderTop: "1px solid #d8d6cf", fontSize: ".82rem", color: "#596068" }}>
          {c.legal} · {c.address}, {c.zip} {c.city} · {c.phone} · {c.email} · P. IVA {c.vat}
        </footer>
      </div>
    </div>
  );
}
