import Link from "next/link";
import Image from "next/image";
import { LionArt } from "./LionArt";
import { MobileNav } from "./MobileNav";
import { dict } from "@/lib/dict";
import { sectionHref, type Section } from "@/lib/routes";
import { getSite } from "@/lib/site";
import type { Lang } from "@/lib/types";

export function LogoPlate({ h = 54 }: { h?: number }) {
  return <span className="logo-plate"><Image src="/media/logo-ledica.png" alt="LE.DI.CA. — Tube and Pipe Automatic Welding Systems" width={1400} height={444} priority quality={85} style={{ height: h, width: "auto" }} /></span>;
}

const NAV: Section[] = ["products", "technologies", "cases", "company", "service", "contact"];
const NAV_LABEL: Record<string, keyof ReturnType<typeof dict>> = { products: "nav_products", technologies: "nav_tech", cases: "nav_cases", company: "nav_company", service: "nav_service", contact: "nav_contact" };

export function Shell({ lang, alt, current, children, bar }: { lang: Lang; alt: string; current?: Section; children: React.ReactNode; bar?: { href: string; label: string } }) {
  const t = dict(lang);
  const s = getSite();
  const items = NAV.map((k) => ({ k, href: sectionHref(lang, k), label: t[NAV_LABEL[k]] as string }));
  const cta = { href: sectionHref(lang, "rfq"), label: t.cta_quote_short };
  return (
    <>
      <a className="skip" href="#main">{t.skip}</a>
      <header className="hdr">
        <div className="wrap">
          <Link href={sectionHref(lang)} className="logo" aria-label="LE.DI.CA."><LogoPlate /></Link>
          <nav className="nav" aria-label="Principale">
            {items.map((i) => (<Link key={i.k} href={i.href} aria-current={current === i.k ? "page" : undefined}>{i.label}</Link>))}
          </nav>
          <div className="hdr-actions">
            <Link href={alt} className="lang" hrefLang={lang === "it" ? "en" : "it"} lang={lang === "it" ? "en" : "it"}>{t.lang_switch}</Link>
            <Link href={cta.href} className="btn">{cta.label}</Link>
            <MobileNav items={items} cta={cta} label={t.menu} closeLabel={t.close} />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <Footer lang={lang} />
      {bar && (
        <div className="mobile-bar no-print">
          <Link className="btn" href={bar.href}>{bar.label}</Link>
          <a className="btn btn-line" href={`tel:${s.company.phone.replace(/\s/g, "")}`}>{t.cta_call}</a>
        </div>
      )}
    </>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const { company: c, social } = getSite();
  const tel = c.phone.replace(/\s/g, "");
  const nav = [...NAV, "news" as Section];
  const labels: Record<string, string> = { products: t.nav_products, technologies: t.nav_tech, cases: t.nav_cases, company: t.nav_company, service: t.nav_service, contact: t.nav_contact, news: t.nav_news };
  return (
    <footer className="ftr">
      <div className="ftr-lion" aria-hidden="true"><LionArt variant="solid" /></div>
      <div className="wrap">
        <div className="ftr-brand">
          <LogoPlate h={96} />
          <p>{t.footer_tag}. {lang === "it" ? "Dal 1967 sulla linea tubo." : "On the tube line since 1967."}</p>
        </div>
        <div className="ftr-grid">
          <div>
            <p style={{ color: "#fff", fontWeight: 700, marginBottom: 6 }}>{c.legal}</p>
            <p>{c.address}<br />{c.zip} {c.city}</p>
          </div>
          <div>
            <h4>{t.footer_nav}</h4>
            <ul>{nav.map((k) => (<li key={k}><Link href={sectionHref(lang, k)}>{labels[k]}</Link></li>))}</ul>
          </div>
          <div>
            <h4>{t.footer_contacts}</h4>
            <ul>
              <li><a href={`tel:${tel}`}>{c.phone}</a></li>
              <li><a href={`mailto:${c.email}`}>{c.email}</a></li>
              {c.pec && <li><a href={`mailto:${c.pec}`}>PEC {c.pec}</a></li>}
              <li><a href={`https://wa.me/${c.whatsapp}`} rel="noopener">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.footer_follow}</h4>
            <ul>
              {social.linkedin && <li><a href={social.linkedin} rel="noopener">LinkedIn</a></li>}
              {social.youtube && <li><a href={social.youtube} rel="noopener">YouTube</a></li>}
              {social.instagram && <li><a href={social.instagram} rel="noopener">Instagram</a></li>}
              {social.facebook && <li><a href={social.facebook} rel="noopener">Facebook</a></li>}
            </ul>
          </div>
        </div>
        <div className="ftr-legal">
          <span>© {new Date().getFullYear()} {c.legal} · P. IVA {c.vat} · Cap. soc. {c.capital}{c.rea ? ` · REA ${c.rea}` : ""}</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href={sectionHref(lang, "privacy")}>{t.privacy}</Link>
            <Link href={sectionHref(lang, "cookie")}>{t.cookie}</Link>
            <button className="linkbtn" data-cookie-open>{t.cookie_settings}</button>
          </span>
        </div>
      </div>
    </footer>
  );
}
