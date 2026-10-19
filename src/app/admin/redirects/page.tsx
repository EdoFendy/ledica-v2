import { db } from "@/lib/db";
import { Head } from "@/admin/bits";
import { RedirectsTable, type RRow } from "@/admin/Redirects";

export default function Redirects() {
  const rows = db().prepare("SELECT * FROM redirects ORDER BY code, from_path").all() as RRow[];
  return (<>
    <Head title="Redirect" crumbs={[{ label: "Sito" }, { label: "Redirect" }]} sub="Gli indirizzi del vecchio sito portano alle pagine nuove (301) o risultano rimossi (410). Così non si perde il posizionamento su Google." />
    <RedirectsTable rows={rows} />
  </>);
}
