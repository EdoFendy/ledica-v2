export type Lang = "it" | "en";
export const LANGS: Lang[] = ["it", "en"];
export type T = { it: string; en: string };
export type ContentType = "product" | "tech" | "case" | "news" | "application" | "page";

export type Row = {
  id: number;
  type: ContentType;
  slug_it: string;
  slug_en: string;
  data: Record<string, any>;
  status: "published" | "draft";
  sort: number;
  created: string;
  updated: string;
};

export const tr = (v: any, lang: Lang): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] || v.it || "";
};
