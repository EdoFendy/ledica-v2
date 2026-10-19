import { db } from "@/lib/db";
import { Head } from "@/admin/bits";
import { SCHEMA } from "@/admin/schema";
import { MediaManager, type MRow } from "./MediaManager";
import type { ContentType } from "@/lib/types";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const rows = db().prepare("SELECT * FROM media ORDER BY provisional DESC, created DESC, file").all() as any[];
  const usage = new Map<string, { title: string; href: string }[]>();
  for (const c of db().prepare("SELECT id, type, slug_it, data FROM content").all() as any[]) {
    const d = JSON.parse(c.data); const title = SCHEMA[c.type as ContentType].title(d) || c.slug_it;
    for (const m of c.data.matchAll(/"([\w.\-]+\.(?:jpe?g|png|webp|avif|gif|svg|pdf))"/gi)) {
      const list = usage.get(m[1]) ?? []; if (!list.some((x) => x.href.endsWith(`/${c.id}`))) list.push({ title, href: `/admin/content/${c.type}/${c.id}` }); usage.set(m[1], list);
    }
  }
  const data: MRow[] = rows.map((r) => ({ file: r.file, alt_it: r.alt_it, alt_en: r.alt_en, provisional: !!r.provisional, note: r.note, size: r.size, created: r.created, used: usage.get(r.file) ?? [] }));
  return (
    <>
      <Head title="Media" crumbs={[{ label: "Contenuti" }, { label: "Media" }]} sub={`${rows.length} file · le foto «provvisorie» vengono dal vecchio sito: sostituiscile con gli scatti nuovi mantenendo lo stesso nome.`} />
      <MediaManager rows={data} initial={f} />
    </>
  );
}
