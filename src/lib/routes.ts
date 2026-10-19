import type { Lang, Row, ContentType } from "./types";

export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SECTIONS = {
  products: { it: "prodotti", en: "products" },
  technologies: { it: "tecnologie", en: "technologies" },
  cases: { it: "casi-studio", en: "case-studies" },
  applications: { it: "applicazioni", en: "applications" },
  news: { it: "news", en: "news" },
  company: { it: "azienda", en: "company" },
  service: { it: "assistenza", en: "service" },
  contact: { it: "contatti", en: "contact" },
  rfq: { it: "richiedi-offerta", en: "request-quote" },
  privacy: { it: "privacy", en: "privacy" },
  cookie: { it: "cookie", en: "cookie-policy" },
} as const;
export type Section = keyof typeof SECTIONS;

export const TYPE_SECTION: Record<Exclude<ContentType, "page">, Section> = {
  product: "products", tech: "technologies", case: "cases", news: "news", application: "applications",
};
const PAGE_SECTIONS: Section[] = ["company", "service", "privacy", "cookie"];

const prefix = (lang: Lang) => (lang === "en" ? "/en" : "");

export function sectionHref(lang: Lang, s?: Section) {
  if (!s) return lang === "en" ? "/en" : "/";
  return `${prefix(lang)}/${SECTIONS[s][lang]}`;
}
export function itemHref(lang: Lang, row: Row) {
  if (row.type === "page") {
    const s = PAGE_SECTIONS.find((p) => SECTIONS[p].it === row.slug_it);
    return s ? sectionHref(lang, s) : sectionHref(lang);
  }
  const s = TYPE_SECTION[row.type];
  return `${sectionHref(lang, s)}/${lang === "en" ? row.slug_en : row.slug_it}`;
}
export const abs = (p: string) => SITE_URL + p;

export type Resolved =
  | { lang: Lang; kind: "home" }
  | { lang: Lang; kind: "list"; section: Section }
  | { lang: Lang; kind: "item"; section: Section; slug: string }
  | { lang: Lang; kind: "static"; section: Section };

export function resolve(segments: string[] = []): Resolved | null {
  let lang: Lang = "it";
  let seg = segments;
  if (seg[0] === "en") { lang = "en"; seg = seg.slice(1); }
  if (seg.length === 0) return { lang, kind: "home" };
  const section = (Object.keys(SECTIONS) as Section[]).find((k) => SECTIONS[k][lang] === seg[0]);
  if (!section) return null;
  const staticSections: Section[] = ["company", "service", "contact", "rfq", "privacy", "cookie"];
  if (staticSections.includes(section)) return seg.length === 1 ? { lang, kind: "static", section } : null;
  if (seg.length === 1) return { lang, kind: "list", section };
  if (seg.length === 2) return { lang, kind: "item", section, slug: seg[1] };
  return null;
}
