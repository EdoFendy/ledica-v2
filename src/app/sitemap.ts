import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { abs, itemHref, sectionHref, type Section } from "@/lib/routes";
import { list } from "@/lib/content";
import type { Row } from "@/lib/types";

export const dynamic = "force-dynamic";
const STATIC: Section[] = ["products", "technologies", "cases", "applications", "news", "company", "service", "contact", "privacy", "cookie"];

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  const pair = (it: string, en: string, lastModified?: string, priority = 0.6) => {
    const languages = { it: abs(it), en: abs(en), "x-default": abs(en) };
    out.push({ url: abs(it), lastModified, alternates: { languages }, priority }, { url: abs(en), lastModified, alternates: { languages }, priority });
  };
  pair(sectionHref("it"), sectionHref("en"), undefined, 1);
  for (const s of STATIC) pair(sectionHref("it", s), sectionHref("en", s), undefined, 0.7);
  for (const type of ["tech", "product", "case", "application", "news"] as const)
    for (const r of list(type) as Row[]) pair(itemHref("it", r), itemHref("en", r), r.updated.replace(" ", "T") + "Z", type === "product" || type === "tech" ? 0.9 : 0.7);
  void db;
  return out;
}
