import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { list } from "@/lib/content";
import { SCHEMA } from "@/admin/schema";
import { Head } from "@/admin/bits";
import { ContentTable, type CRow } from "@/admin/ContentTable";
import { allTechs } from "@/lib/site";
import { tr, type ContentType } from "@/lib/types";

export default async function ContentList({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ s?: string }> }) {
  const { type } = await params;
  const { s } = await searchParams;
  if (!(type in SCHEMA)) notFound();
  const sc = SCHEMA[type as ContentType];
  const techName: Record<string, string> = Object.fromEntries(allTechs().map((t) => [t.data.key, tr(t.data.name, "it")]));
  const rows: CRow[] = list(type as ContentType, { all: true }).map((r) => {
    const d = r.data; const t = d.name ?? d.title;
    return {
      id: r.id, title: sc.title(d) || r.slug_it, slug: r.slug_it, status: r.status, updated: r.updated, href: `/admin/content/${type}/${r.id}`,
      image: d.images?.[0] ?? d.image ?? undefined, en: !t?.it || !!t?.en, confirm: !!d.confirm,
      group: type === "product" ? techName[d.tech] : type === "case" ? String(d.year ?? "") : undefined,
      extra: type === "news" ? d.date : type === "case" ? tr(d.country, "it") : undefined,
    };
  });
  const groups = type === "product" ? Object.values(techName) : type === "case" ? [...new Set(rows.map((r) => r.group!).filter(Boolean))].sort().reverse() : undefined;
  return (
    <>
      <Head title={sc.plural} crumbs={[{ label: "Contenuti" }, { label: sc.plural }]} sub={`${rows.length} elementi · trascina per riordinare, seleziona per agire su più elementi.`}
        actions={<Link className="a-btn" href={`/admin/content/${type}/new`}><Plus />Nuovo {sc.label.toLowerCase()}</Link>} />
      <ContentTable type={type} rows={rows} groups={groups} groupLabel={type === "product" ? "Tecnologia" : "Anno"} singular={sc.label} initialStatus={s} />
    </>
  );
}
