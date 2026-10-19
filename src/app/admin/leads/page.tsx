import { db } from "@/lib/db";
import { Head } from "@/admin/bits";
import { LeadsTable, type Lead } from "@/admin/Leads";

export default async function Leads({ searchParams }: { searchParams: Promise<{ s?: string; new?: string }> }) {
  const sp = await searchParams;
  const rows = db().prepare("SELECT * FROM leads ORDER BY id DESC").all() as Lead[];
  return (
    <>
      <Head title="Richieste" crumbs={[{ label: "Richieste" }]} sub="Prove di saldatura, offerte, retrofit e ricambi. Cambia lo stato direttamente dalla tabella." />
      <LeadsTable rows={rows} openNew={sp.new === "1"} initialStatus={sp.s} />
    </>
  );
}
