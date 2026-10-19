import { notFound } from "next/navigation";
import { byId, list } from "@/lib/content";
import { SCHEMA, type Field } from "@/admin/schema";
import { ContentForm } from "@/admin/ContentForm";
import { Head } from "@/admin/bits";
import { COUNTRY } from "@/lib/countries";
import { itemHref } from "@/lib/routes";
import { tr, type ContentType } from "@/lib/types";

const blank = (f: Field): any => {
  if (["list", "images", "multi", "tags"].includes(f.kind)) return [];
  if (f.kind === "group") return Object.fromEntries((f.fields ?? []).map((x) => [x.name, blank(x)]));
  if (f.kind === "bool") return false;
  if (f.kind === "number") return null;
  return f.i18n ? { it: "", en: "" } : "";
};

export default async function Edit({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!(type in SCHEMA)) notFound();
  const sc = SCHEMA[type as ContentType];
  const row = id === "new" ? null : byId(Number(id));
  if (id !== "new" && (!row || row.type !== type)) notFound();
  const data = { ...(row?.data ?? {}) };
  for (const f of sc.fields) if (data[f.name] === undefined) data[f.name] = blank(f);
  const rel = {
    tech: list("tech", { all: true }).map((r) => ({ value: r.data.key, label: tr(r.data.name, "it") })),
    product: list("product", { all: true }).map((r) => ({ value: r.slug_it, label: tr(r.data.name, "it") })),
    case: list("case", { all: true }).map((r) => ({ value: r.slug_it, label: tr(r.data.title, "it") })),
    country: Object.entries(COUNTRY).map(([value, v]) => ({ value, label: v.it })),
  };
  const name = row ? sc.title(row.data) || row.slug_it : `Nuovo ${sc.label.toLowerCase()}`;
  return (
    <>
      <Head title={name} crumbs={[{ label: sc.plural, href: `/admin/content/${type}` }, { label: row ? "Modifica" : "Nuovo" }]} />
      <ContentForm type={type as ContentType} id={row?.id ?? null} fields={sc.fields} rel={rel} label={sc.label} plural={sc.plural} updated={row?.updated}
        publicUrl={row ? `${itemHref("it", row)}?preview=1` : null}
        init={{ slug_it: row?.slug_it ?? "", slug_en: row?.slug_en ?? "", status: row?.status ?? "draft", sort: row?.sort ?? 99, data }} />
    </>
  );
}
