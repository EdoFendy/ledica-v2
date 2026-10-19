import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Head } from "@/admin/bits";
import { UsersTable } from "./UsersTable";

export default async function Users() {
  const me = await currentUser();
  if (me?.role !== "admin") return <><Head title="Utenti" /><div className="a-card a-empty"><b>Serve un account amministratore</b></div></>;
  const rows = db().prepare("SELECT id, email, name, role, created, last_login FROM users ORDER BY name, email").all() as any[];
  return (<>
    <Head title="Utenti" crumbs={[{ label: "Sito" }, { label: "Utenti" }]} sub="Gli amministratori gestiscono tutto; gli editor modificano contenuti, media, richieste e checklist, non impostazioni e utenti." />
    <UsersTable rows={rows} meId={me.id} envEmail={process.env.ADMIN_EMAIL || "admin@ledica.it"} />
  </>);
}
