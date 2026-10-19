import { db } from "@/lib/db";
import { Head } from "@/admin/bits";
import { TodoBoard, type TRow } from "@/admin/Todo";

export default function Todo() {
  const rows = db().prepare("SELECT * FROM todo ORDER BY id").all() as TRow[];
  return (<>
    <Head title="Da chiedere al cliente" crumbs={[{ label: "Sito" }, { label: "Checklist" }]} sub="Dati tecnici da confermare, materiali, accessi e decisioni. Annota la risposta in ogni voce prima di chiuderla." />
    <TodoBoard rows={rows} />
  </>);
}
