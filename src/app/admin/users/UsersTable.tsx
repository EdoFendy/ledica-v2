"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Save, ShieldCheck, Trash2, UserRound, KeyRound } from "lucide-react";
import { deleteUser, saveUser } from "@/admin/actions";
import { Drawer, useConfirm, useRun } from "@/admin/ui";
import { ago } from "@/admin/bits";

type U = { id: number; email: string; name: string; role: "admin" | "editor"; created: string; last_login: string | null };
const genPw = () => Array.from(crypto.getRandomValues(new Uint8Array(14)), (b) => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 56]).join("");

export function UsersTable({ rows, meId, envEmail }: { rows: U[]; meId: number; envEmail: string }) {
  const [edit, setEdit] = useState<U | "new" | null>(null);
  const run = useRun(); const confirm = useConfirm(); const router = useRouter();
  return (
    <>
      <div className="a-card">
        <div className="a-toolbar"><span className="a-num">{rows.length} utenti</span><button className="a-btn sm" style={{ marginLeft: "auto" }} onClick={() => setEdit("new")}><Plus />Nuovo utente</button></div>
        <div className="a-tablewrap"><table className="a-table">
          <thead><tr><th>Utente</th><th>Ruolo</th><th>Ultimo accesso</th><th /></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td><b>{u.name || "—"}</b>{u.id === meId && <span className="a-tag" style={{ marginLeft: 6 }}>tu</span>}<div className="t-meta">{u.email}</div></td>
                <td>{u.role === "admin" ? <span className="a-pill ok">Amministratore</span> : <span className="a-pill plain">Editor</span>}</td>
                <td className="a-num">{u.last_login ? ago(u.last_login) : "mai"}</td>
                <td className="t-actions">
                  <button className="a-btn ghost icon" aria-label="Modifica" onClick={() => setEdit(u)}><Pencil /></button>
                  {u.id !== meId && <button className="a-btn ghost icon" aria-label="Elimina" style={{ color: "var(--a-err)" }} onClick={async () => { if (await confirm({ title: `Eliminare ${u.email}?`, body: "Non potrà più accedere al pannello.", ok: "Elimina", danger: true })) { const r = await run(deleteUser(u.id), "Utente eliminato."); if (r.ok) router.refresh(); } }}><Trash2 /></button>}
                </td>
              </tr>
            ))}
            <tr><td><b>Account di emergenza</b><div className="t-meta">{envEmail}</div></td><td><span className="a-pill ok">Amministratore</span></td><td colSpan={2} className="a-help">Definito in .env.local: serve per il primo accesso e per recuperare il pannello.</td></tr>
          </tbody>
        </table></div>
        {!rows.length && <div className="a-empty" style={{ borderTop: "1px solid var(--a-line)" }}><UserRound /><b>Crea gli account personali</b><span>Un account per persona: nel registro attività vedi chi ha modificato cosa.</span></div>}
      </div>
      {edit && <UserDrawer u={edit === "new" ? null : edit} onClose={() => setEdit(null)} />}
    </>
  );
}

function UserDrawer({ u, onClose }: { u: U | null; onClose: () => void }) {
  const [v, setV] = useState({ email: u?.email ?? "", name: u?.name ?? "", role: u?.role ?? ("editor" as const), password: "" });
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition(); const run = useRun(); const router = useRouter();
  const save = () => start(async () => { const r = await run(saveUser(u?.id ?? null, v), u ? "Utente aggiornato." : "Utente creato: comunica la password in modo sicuro."); if (r.ok) { onClose(); router.refresh(); } });
  return (
    <Drawer title={u ? "Modifica utente" : "Nuovo utente"} onClose={onClose} footer={<><button className="a-btn sec" onClick={onClose}>Annulla</button><button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button></>}>
      <div className="a-field"><label className="a-lbl">Nome e cognome</label><input className="a-in" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus /></div>
      <div className="a-field"><label className="a-lbl">Email</label><input className="a-in" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></div>
      <div className="a-field"><label className="a-lbl">Ruolo</label>
        <div className="a-chips">
          <button type="button" className={`a-chip${v.role === "editor" ? " on" : ""}`} onClick={() => setV({ ...v, role: "editor" })}><UserRound />Editor</button>
          <button type="button" className={`a-chip${v.role === "admin" ? " on" : ""}`} onClick={() => setV({ ...v, role: "admin" })}><ShieldCheck />Amministratore</button>
        </div>
      </div>
      <div className="a-field"><label className="a-lbl">{u ? "Nuova password (lascia vuoto per non cambiarla)" : "Password"}</label>
        <div className="a-row" style={{ flexWrap: "nowrap" }}><input className="a-in mono" type={show ? "text" : "password"} value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} autoComplete="new-password" />
          <button type="button" className="a-btn sec sm" onClick={() => { setV({ ...v, password: genPw() }); setShow(true); }}><KeyRound />Genera</button></div>
        <p className="a-help">Almeno 10 caratteri. Comunicala alla persona in modo sicuro: potrà cambiarla da «Il mio account».</p>
      </div>
    </Drawer>
  );
}
