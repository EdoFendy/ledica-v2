export const t = (it: string, en: string) => ({ it, en });
/** Normalizza il nome file originale come fa lo script di seed (minuscolo, trattini, senza suffissi WP). */
export const norm = (f: string) =>
  f.replace(/^\d{4}_\d{2}_/, "")
    .replace(/-scaled(?=\.)/i, "")
    .replace(/-e\d{10,}(?=\.)/i, "")
    .replace(/_/g, "-")
    .toLowerCase();
export const im = (...f: string[]) => f.map(norm);
export const spec = (it: string, en: string, vit: string, ven = vit) => ({ label: t(it, en), value: t(vit, ven) });

export type ProductSeed = {
  slug_it: string; slug_en: string; tech: string;
  name: ReturnType<typeof t>; subtitle: ReturnType<typeof t>; summary: ReturnType<typeof t>; body?: ReturnType<typeof t>;
  specs: ReturnType<typeof spec>[]; benefits: ReturnType<typeof t>[];
  thickMin: number | null; thickMax: number | null; images: string[]; videos?: string[];
  badge?: "new" | ""; featured?: boolean; perf?: { label: ReturnType<typeof t>; value: string }[]; confirm?: string; legacy: string[];
};
