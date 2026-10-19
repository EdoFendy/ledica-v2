import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Head, KIND_LEAD } from "@/admin/bits";
import { LeadEditor, type Lead } from "@/admin/Leads";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = db().prepare("SELECT * FROM leads WHERE id=?").get(Number(id)) as Lead | undefined;
  if (!l) notFound();
  return (
    <>
      <Head title={`${l.name}${l.company ? " · " + l.company : ""}`} crumbs={[{ label: "Richieste", href: "/admin/leads" }, { label: `#${l.id}` }]} sub={`${KIND_LEAD[l.kind] ?? l.kind} · lingua ${l.lang.toUpperCase()}`} />
      <LeadEditor lead={l} />
    </>
  );
}
