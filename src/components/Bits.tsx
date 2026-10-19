import Link from "next/link";
import { Arrow } from "./Icons";
import { LionArt } from "./LionArt";
import { dict } from "@/lib/dict";
import { SITE_URL } from "@/lib/routes";
import type { Lang } from "@/lib/types";

export const L = (lang: Lang, it: string, en: string) => (lang === "it" ? it : en);

export function PageHead({ lang, crumbs, title, lead, badge, aside, big, lion }: { lion?: boolean; lang: Lang; crumbs: { label: string; href?: string }[]; title: string; lead?: string; badge?: string; aside?: React.ReactNode; big?: boolean }) {
  return (
    <section className="phead">
      {lion && <div className="phead-lion" aria-hidden="true"><LionArt /></div>}
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="crumbs">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "contents" }}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="phead-grid">
          <div>
            {badge && <span className="badge">{badge}</span>}
            <h1 className={big ? "d1" : "d2"}>{title}</h1>
            {lead && <p className="lead">{lead}</p>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
export const crumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE_URL + it.path })),
});

export function CtaBand({ lang, href, title, body, tel, label }: { lang: Lang; href: string; title?: string; body?: string; tel: string; label?: string }) {
  const t = dict(lang);
  return (
    <section className="sec cta-sec" style={{ background: "var(--arc-btn)", color: "#fff" }}>
      <div className="lion-bg" aria-hidden="true"><LionArt variant="solid" /></div>
      <div className="wrap cta-band">
        <div>
          <h2 className="d2">{title ?? t.proof_title}</h2>
          <p className="lead" style={{ marginTop: 18, color: "#e6efff" }}>{body ?? t.proof_body}</p>
        </div>
        <div>
          <div className="actions">
            <Link href={href} className="btn" style={{ background: "var(--ink)", borderColor: "var(--ink)" }}>{label ?? t.cta_test}<Arrow /></Link>
          </div>
          <a className="tel mono" href={`tel:${tel.replace(/\s/g, "")}`} style={{ color: "#fff" }}>{t.cta_call} {tel}</a>
        </div>
      </div>
    </section>
  );
}
