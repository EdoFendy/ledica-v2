import { currentUser } from "@/lib/auth";
import { Head } from "@/admin/bits";
import { PasswordForm } from "./PasswordForm";

export default async function Account() {
  const u = (await currentUser())!;
  return (<>
    <Head title="Il mio account" crumbs={[{ label: "Account" }]} />
    <div className="a-grid-2">
      <section className="a-card"><div className="a-card-h"><h2>Cambia password</h2></div><div className="a-card-b"><PasswordForm emergency={u.id === 0} /></div></section>
      <section className="a-card" style={{ alignSelf: "start" }}><div className="a-card-b"><dl className="a-kv"><dt>Nome</dt><dd>{u.name || "—"}</dd><dt>Email</dt><dd>{u.email}</dd><dt>Ruolo</dt><dd>{u.role === "admin" ? "Amministratore" : "Editor"}</dd></dl></div></section>
    </div>
  </>);
}
