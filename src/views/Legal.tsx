import { Fragment } from "react";
import { Md, mdSlug } from "@/components/Md";
import { PageHead, L } from "@/components/Bits";
import { dict } from "@/lib/dict";
import { sectionHref } from "@/lib/routes";
import { fmtDate, getSite } from "@/lib/site";
import { LEGAL_UPDATED, activeCookies } from "@/lib/legal";
import { tr, type Lang, type Row } from "@/lib/types";

const TABLE = "[[tabella-cookie]]"; // nel testo della Cookie policy segna dove va la tabella generata

/** Informativa privacy e Cookie policy: indice, data di aggiornamento, titolare dalle impostazioni, tabella cookie dall'elenco unico. */
export function LegalView({ lang, row, kind }: { lang: Lang; row: Row; kind: "privacy" | "cookie" }) {
  const t = dict(lang);
  const { company: c, tracking } = getSite();
  const body = tr(row.data.body, lang);
  const heads = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const [before, after] = body.includes(TABLE) ? body.split(TABLE) : [body, ""];
  const cookies = activeCookies(tracking?.ga4 ?? "");
  return (
    <>
      <PageHead lang={lang} crumbs={[{ label: "LE.DI.CA.", href: sectionHref(lang) }, { label: tr(row.data.title, lang) }]} title={tr(row.data.title, lang)} lead={tr(row.data.lead, lang)} />
      <section className="sec"><div className="wrap legal">
        <aside className="legal-side">
          <p className="mono legal-upd">{L(lang, "Ultimo aggiornamento", "Last updated")}<br /><b>{fmtDate(LEGAL_UPDATED, lang)}</b></p>
          {heads.length > 1 && (
            <nav aria-label={L(lang, "Indice", "Contents")}>
              <ol className="legal-toc">{heads.map((h) => <li key={h}><a href={`#${mdSlug(h)}`}>{h}</a></li>)}</ol>
            </nav>
          )}
          <p className="legal-alt">
            {kind === "privacy"
              ? <a href={sectionHref(lang, "cookie")}>{t.cookie_policy} →</a>
              : <a href={sectionHref(lang, "privacy")}>{L(lang, "Informativa privacy", "Privacy notice")} →</a>}
          </p>
        </aside>
        <div className="legal-main">
          {kind === "privacy" && (
            <div className="legal-card">
              <p className="mono">{L(lang, "Titolare del trattamento", "Data controller")}</p>
              <p><b>{c.legal}</b><br />{c.address}, {c.zip} {c.city}<br />P. IVA {c.vat}{c.rea ? ` · REA ${c.rea}` : ""}</p>
              <p><a href={`mailto:${c.email}`}>{c.email}</a>{c.pec && <> · PEC <a href={`mailto:${c.pec}`}>{c.pec}</a></>} · <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></p>
            </div>
          )}
          <Md text={before} />
          {kind === "cookie" && (
            <Fragment>
              <div className="legal-table" role="region" aria-label={L(lang, "Cookie usati dal sito", "Cookies used by the site")} tabIndex={0}>
                <table>
                  <thead><tr><th scope="col">{L(lang, "Nome", "Name")}</th><th scope="col">{L(lang, "Tipo", "Type")}</th><th scope="col">{L(lang, "Fornitore", "Provider")}</th><th scope="col">{L(lang, "A cosa serve", "Purpose")}</th><th scope="col">{L(lang, "Durata", "Duration")}</th></tr></thead>
                  <tbody>{cookies.map((k) => (
                    <tr key={k.name}>
                      <td className="mono">{k.name}</td>
                      <td><span className={`legal-pill ${k.kind}`}>{k.kind === "technical" ? L(lang, "Tecnico", "Technical") : L(lang, "Misurazione · con consenso", "Measurement · with consent")}</span></td>
                      <td>{k.provider[lang]}</td><td>{k.purpose[lang]}</td><td>{k.duration[lang]}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {!tracking?.ga4 && <p className="muted legal-note">{L(lang, "Oggi il sito usa solo cookie tecnici: per questo non ti viene mostrato il banner. Se attiveremo la misurazione delle visite, te lo chiederemo prima.", "The site currently uses technical cookies only, which is why no banner is shown. If we enable visit measurement, we will ask you first.")}</p>}
              <p><button type="button" className="btn" data-cookie-open>{L(lang, "Modifica le preferenze cookie", "Change cookie preferences")}</button></p>
              {after && <Md text={after} />}
            </Fragment>
          )}
        </div>
      </div></section>
    </>
  );
}
