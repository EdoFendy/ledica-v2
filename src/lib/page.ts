import { bySlug, byKey } from "./content";
import { resolve, sectionHref, itemHref, type Section, SECTIONS } from "./routes";
import type { ContentType, Lang, Row } from "./types";

const TYPE_OF: Partial<Record<Section, ContentType>> = { products: "product", technologies: "tech", cases: "case", applications: "application", news: "news" };
const PAGE_KEY: Partial<Record<Section, string>> = { company: "azienda", service: "assistenza", privacy: "privacy", cookie: "cookie" };

export type Page = {
  lang: Lang; kind: "home" | "list" | "item" | "static"; section?: Section; row: Row | null;
  path: Record<Lang, string>;
};

export function loadPage(slug: string[] | undefined, preview = false): Page | null {
  const r = resolve(slug);
  if (!r) return null;
  const lang = r.lang;
  if (r.kind === "home") return { lang, kind: "home", row: null, path: { it: sectionHref("it"), en: sectionHref("en") } };
  const section = r.section;
  const list = { it: sectionHref("it", section), en: sectionHref("en", section) };
  if (r.kind === "list") return { lang, kind: "list", section, row: null, path: list };
  if (r.kind === "static") {
    const key = PAGE_KEY[section];
    const row = key ? byKey("page", key) : null;
    if (key && (!row || (row.status === "draft" && !preview))) return null;
    return { lang, kind: "static", section, row, path: list };
  }
  const type = TYPE_OF[section]!;
  const row = bySlug(type, lang, r.slug, preview);
  if (!row) return null;
  return { lang, kind: "item", section, row, path: { it: itemHref("it", row), en: itemHref("en", row) } };
}
export { SECTIONS };
