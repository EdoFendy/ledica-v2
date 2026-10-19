import { cache } from "react";
import { db, getSetting } from "./db";
import { list } from "./content";
import type { Lang, Row } from "./types";
import { tr } from "./types";

export type Site = {
  company: { name: string; legal: string; address: string; zip: string; city: string; phone: string; email: string; pec: string; rea: string; vat: string; capital: string; hours: { it: string; en: string }; whatsapp: string };
  social: { linkedin: string; youtube: string; instagram: string; facebook: string };
  numbers: { since: number; plants: number; gain: number; countries: number };
  clients: { name: string; show: boolean }[];
  countries: string[];
  timeline: { year: string; text: { it: string; en: string } }[];
  team: { name: string; role: { it: string; en: string }; since: number; photo: string }[];
  fairs: { name: string; place: string; dates: { it: string; en: string }; url: string; show: boolean }[];
  tracking: { ga4: string; gtm: string };
  routing: { sales: string; service: string };
  features: { pdfGated: boolean };
};

export const getSite = cache((): Site => getSetting<Site>("site", {} as Site));

const mediaMap = cache(() => {
  const rows = db().prepare("SELECT file, alt_it, alt_en FROM media").all() as { file: string; alt_it: string; alt_en: string }[];
  return new Map(rows.map((r) => [r.file, r]));
});
export const altFor = (file: string, lang: Lang, fallback = "") => {
  const m = mediaMap().get(file);
  return (lang === "en" ? m?.alt_en : m?.alt_it) || m?.alt_it || fallback;
};

export const allTechs = cache(() => list("tech"));
export const allProducts = cache(() => list("product"));
export const allCases = cache(() => list("case"));
export const techByKey = (key: string) => allTechs().find((t) => t.data.key === key);

export const fmt = (n: number, lang: Lang) => String(n).replace(".", lang === "it" ? "," : ".");
export const hasRange = (d: any) => d?.thickMax != null && d.thickMax !== "";
/** Campo di spessore dichiarato; vuoto se non dichiarato, «fino a X» se c'è solo il massimo. */
export const range = (a: number | null, b: number | null, lang: Lang) =>
  b == null || (b as any) === "" ? "" : a == null || (a as any) === "" ? `${lang === "it" ? "fino a" : "up to"} ${fmt(b, lang)} mm` : `${fmt(a, lang)}–${fmt(b, lang)} mm`;
export const title = (r: Row, lang: Lang) => tr(r.data.name ?? r.data.title, lang);
export const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "it" ? "it-IT" : "en-GB", { year: "numeric", month: "long", day: "numeric" });

/** Paese del caso; se riservato mostra il settore. */
export const loc = (c: Row, lang: Lang) => { const k = tr(c.data.country, lang); return k && k !== "—" ? k : tr(c.data.sector, lang); };
