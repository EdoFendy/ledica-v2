import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Home } from "@/views/Home";
import { TechList, TechDetail } from "@/views/Techs";
import { ProductList, ProductDetail } from "@/views/Products";
import { CaseList, CaseDetail } from "@/views/Cases";
import { AppList, AppDetail, NewsList, NewsDetail, Company, Contact, RfqPage, PageView } from "@/views/Misc";
import { LegalView } from "@/views/Legal";
import { loadPage } from "@/lib/page";
import { abs } from "@/lib/routes";
import { allProducts } from "@/lib/site";
import { dict } from "@/lib/dict";
import { isAdmin } from "@/lib/auth";
import { tr } from "@/lib/types";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug?: string[] }>; searchParams: Promise<{ [k: string]: string | undefined }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = [await params, await searchParams];
  const preview = sp.preview === "1" && (await isAdmin());
  const p = loadPage(slug, preview);
  if (!p) return { title: "404", robots: { index: false } };
  const t = dict(p.lang);
  const d = p.row?.data;
  const name = d ? tr(d.name ?? d.title, p.lang) : "";
  const listTitles: Record<string, string> = { products: t.nav_products, technologies: t.nav_tech, cases: t.nav_cases, applications: t.applications, news: t.nav_news, company: t.nav_company, service: t.nav_service, contact: t.nav_contact, rfq: t.cta_quote, privacy: t.privacy, cookie: "Cookie" };
  const title = tr(d?.seo?.title, p.lang) || name || (p.section ? listTitles[p.section] : "") || (p.lang === "it" ? "LE.DI.CA. — Sistemi di saldatura automatica per tubi" : "LE.DI.CA. — Tube and pipe automatic welding systems");
  const desc = (tr(d?.seo?.description, p.lang) || tr(d?.summary, p.lang) || tr(d?.lead, p.lang) || t.home_lead).slice(0, 155);
  const img = d?.images?.[0] ?? d?.image ?? "tricathode-torch-tig-on-mill.jpg";
  const noindex = p.row?.status === "draft" || p.section === "rfq";
  return {
    title: p.kind === "home" ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: abs(p.path[p.lang]), languages: { it: abs(p.path.it), en: abs(p.path.en), "x-default": abs(p.path.en) } },
    openGraph: { title, description: desc, url: abs(p.path[p.lang]), siteName: "LE.DI.CA.", locale: p.lang === "it" ? "it_IT" : "en_GB", type: "website", images: [{ url: abs(`/media/${img}`) }] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = [await params, await searchParams];
  const admin = await isAdmin();
  const preview = sp.preview === "1" && admin;
  const p = loadPage(slug, preview);
  if (!p) notFound();
  const { lang, kind, section, row } = p;
  const alt = p.path[lang === "it" ? "en" : "it"];
  const t = dict(lang);
  const prods = allProducts().map((r) => ({ slug: r.slug_it, name: tr(r.data.name, lang) }));

  let body: React.ReactNode = null;
  let bar: { href: string; label: string } | undefined;
  if (kind === "home") body = <Home lang={lang} />;
  else if (kind === "list") {
    body = { products: <ProductList lang={lang} />, technologies: <TechList lang={lang} />, cases: <CaseList lang={lang} />, applications: <AppList lang={lang} />, news: <NewsList lang={lang} /> }[section as string] ?? null;
  } else if (kind === "static") {
    if (section === "company") body = <Company lang={lang} row={row} />;
    else if (section === "contact") body = <Contact lang={lang} products={prods} />;
    else if (section === "rfq") body = <RfqPage lang={lang} products={prods} kind={sp.tipo} product={sp.prodotto} />;
    else if (row && (section === "privacy" || section === "cookie")) body = <LegalView lang={lang} row={row} kind={section} />;
    else if (row) body = <PageView lang={lang} row={row} />;
  } else if (row) {
    body = { products: <ProductDetail lang={lang} row={row} />, technologies: <TechDetail lang={lang} row={row} />, cases: <CaseDetail lang={lang} row={row} />, applications: <AppDetail lang={lang} row={row} />, news: <NewsDetail lang={lang} row={row} /> }[section as string] ?? null;
    if (section === "products") bar = { href: `${lang === "en" ? "/en/request-quote" : "/richiedi-offerta"}?tipo=quote&prodotto=${row.slug_it}`, label: t.cta_quote_short };
  }
  if (!body) notFound();
  return (
    <Shell lang={lang} alt={alt} current={section} bar={bar}>
      {row?.status === "draft" && <div className="draft">{t.draft_banner}</div>}
      {body}
    </Shell>
  );
}
