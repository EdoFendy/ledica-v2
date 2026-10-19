/* Popola il database dal contenuto di ledica.it (riesegui con --force per ripartire da zero). */
import fs from "node:fs";
import path from "node:path";
import { db, MEDIA_DIR, setSetting } from "../src/lib/db";
import { save } from "../src/lib/content";
import { norm } from "./data/helpers";
import { products } from "./data/products";
import { techs } from "./data/techs";
import { cases } from "./data/cases";
import { apps, pages, siteDefaults, todo } from "./data/misc";

const force = process.argv.includes("--force");
const d = db();
const has = (d.prepare("SELECT COUNT(*) n FROM content").get() as { n: number }).n;
if (has && !force) { console.log("DB già popolato (usa --force per ricreare)."); process.exit(0); }
if (force) for (const t of ["content", "settings", "media", "redirects", "todo"]) d.exec(`DELETE FROM ${t}`);

// ---- media: copia con nomi normalizzati
const SRC = path.resolve("seed/media");
const used = new Map<string, { it: string; en: string }>();
const claim = (files: string[], it: string, en: string) => files.forEach((f) => { if (!used.has(f)) used.set(f, { it, en }); });
for (const p of products) claim(p.images, p.name.it, p.name.en);
for (const c of cases) claim(c.images, c.title.it, c.title.en);
for (const t of techs) claim([t.image], t.name.it, t.name.en);
const insMedia = d.prepare("INSERT OR IGNORE INTO media(file,alt_it,alt_en,size,provisional) VALUES(?,?,?,?,1)");
let copied = 0;
for (const f of fs.readdirSync(SRC)) {
  const n = norm(f);
  if (!used.has(n) && !/home|welding|logo/.test(n)) continue;
  fs.copyFileSync(path.join(SRC, f), path.join(MEDIA_DIR, n));
  const a = used.get(n);
  insMedia.run(n, a ? a.it : "", a ? a.en : "", fs.statSync(path.join(SRC, f)).size);
  copied++;
}
const missing = [...used.keys()].filter((f) => !fs.existsSync(path.join(MEDIA_DIR, f)));
if (missing.length) console.warn("IMMAGINI MANCANTI:", missing);

// ---- tecnologie
let sort = 0;
const techIds = new Map<string, number>();
for (const t of techs) {
  const id = save({ type: "tech", slug_it: t.slug_it, slug_en: t.slug_en, status: "published", sort: sort++, data: { key: t.id, name: t.name, subtitle: t.subtitle, summary: t.summary, body: t.body, thickMin: t.thickMin, thickMax: t.thickMax, scope: t.scope ?? { it: "", en: "" }, materials: t.materials, faq: t.faq, image: t.image, seo: { title: t.name, description: t.summary } } });
  techIds.set(t.id, id);
}
// ---- prodotti
sort = 0;
const prodSlugs = new Map<string, number>();
for (const p of products) {
  const id = save({ type: "product", slug_it: p.slug_it, slug_en: p.slug_en, status: "published", sort: sort++, data: { tech: p.tech, name: p.name, subtitle: p.subtitle, summary: p.summary, body: p.body ?? { it: "", en: "" }, specs: p.specs, benefits: p.benefits, thickMin: p.thickMin, thickMax: p.thickMax, images: p.images, videos: p.videos ?? [], badge: p.badge ?? "", featured: !!p.featured, perf: p.perf ?? [], related: [], confirm: p.confirm ?? "", seo: { title: p.name, description: p.summary } } });
  prodSlugs.set(p.slug_it, id);
}
// ---- casi
sort = 0;
const caseIds = new Map<string, number>();
for (const c of cases) {
  const id = save({ type: "case", slug_it: c.slug_it, slug_en: c.slug_en, status: "published", sort: sort++, data: { title: c.title, client: c.client, country: c.country, iso: c.iso, sector: c.sector, year: c.year, techs: c.techs, products: c.products, headline: c.headline, challenge: c.challenge, solution: c.solution, results: c.results, quote: c.quote ?? null, images: c.images, videos: c.videos ?? [], date: c.date, confirm: c.confirm ?? "", seo: { title: c.title, description: c.challenge } } });
  caseIds.set(c.slug_it, id);
}
// ---- news (una per caso + lancio laser)
sort = 0;
for (const c of [...cases].sort((a, b) => b.date.localeCompare(a.date))) {
  save({ type: "news", slug_it: c.slug_it, slug_en: c.slug_en, status: "published", sort: sort++, data: { title: c.news.title, summary: c.news.summary, date: c.date, image: c.images[0], link: { kind: "case", slug: c.slug_it }, body: { it: "", en: "" }, seo: { title: c.news.title, description: c.news.summary } } });
}
save({ type: "news", slug_it: "saldatura-laser-fibra-novita", slug_en: "fibre-laser-welding-news", status: "published", sort: sort++, data: { title: { it: "Arriva la saldatura laser fibra LE.DI.CA.", en: "LE.DI.CA. fibre laser welding arrives" }, summary: { it: "Un sistema manuale o automatico che salda, anche con filo, taglia e pulisce per erosione laser inox, ferro e alluminio.", en: "A manual or automatic system that welds, with or without wire, cuts and cleans stainless, iron and aluminium by laser ablation." }, date: "2023-07-13", image: "2024_06_ledica-impianto-con-saldatura-laser-2.avif", link: { kind: "product", slug: "saldatrice-laser-fibra" }, body: { it: "", en: "" }, seo: { title: { it: "", en: "" }, description: { it: "", en: "" } } } });
// ---- applicazioni
sort = 0;
for (const a of apps) save({ type: "application", slug_it: a.slug_it, slug_en: a.slug_en, status: "published", sort: sort++, data: { name: a.name, summary: a.summary, body: a.body, techs: a.techs, cases: a.cases, seo: { title: a.name, description: a.summary } } });
// ---- pagine
sort = 0;
for (const p of pages) save({ type: "page", slug_it: p.slug_it, slug_en: p.slug_en, status: "published", sort: sort++, data: { title: p.title, lead: p.lead, body: p.body, seo: { title: p.title, description: p.lead } } });

// ---- impostazioni, redirect, todo
setSetting("site", siteDefaults);
const insR = d.prepare("INSERT OR REPLACE INTO redirects(from_path,to_path,code,note) VALUES(?,?,?,?)");
const strip = (u: string) => u.replace(/\/$/, "") || "/";
for (const p of products) for (const u of p.legacy) insR.run(strip(u), `/prodotti/${p.slug_it}`, 301, "sito WordPress");
for (const c of cases) for (const u of c.legacy) insR.run(strip(u), `/casi-studio/${c.slug_it}`, 301, "sito WordPress");
const fixed: Record<string, string> = { "/storia": "/azienda", "/il-team": "/azienda", "/galleria": "/azienda", "/prodotti-2": "/prodotti", "/progetti": "/casi-studio", "/category/home": "/news", "/category/uncategorized": "/news" };
for (const [a, b] of Object.entries(fixed)) insR.run(a, b, 301, "sito WordPress");
const gone: string[] = JSON.parse(fs.readFileSync("seed/gone.json", "utf8"));
for (const u of gone) { const k = strip(u); if (!(k in fixed)) insR.run(k, "", 410, "pagina demo del tema"); }
for (const w of ["/portfolio/*", "/portfolio_tag/*", "/portfolio_category/*", "/author/*", "/wp-json/*", "/feed*", "/comments/feed*"]) insR.run(w, "", 410, "regola");
const insT = d.prepare("INSERT INTO todo(grp,text,note) VALUES(?,?,?)");
for (const [g, t, n] of todo) insT.run(g, t, n);

console.log(`Seed ok: ${techs.length} tecnologie, ${products.length} prodotti, ${cases.length} casi, ${copied} immagini, ${gone.length + 12} redirect.`);
if (missing.length) process.exitCode = 1;
