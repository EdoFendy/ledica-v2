"use client";
import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { changeOwnPassword } from "@/admin/actions";
import { useRun } from "@/admin/ui";

export function PasswordForm({ emergency }: { emergency: boolean }) {
  const [v, setV] = useState({ cur: "", next: "", rep: "" });
  const [pending, start] = useTransition(); const run = useRun();
  if (emergency) return <p className="a-help" style={{ margin: 0 }}>Stai usando l'account di emergenza: la sua password si cambia in <code>.env.local</code> (ADMIN_PASSWORD). Per lavorare ogni giorno crea un account personale in «Utenti».</p>;
  const mismatch = v.rep !== "" && v.next !== v.rep;
  return (
    <form className="a-fields" style={{ gridTemplateColumns: "1fr" }} onSubmit={(e) => { e.preventDefault(); if (mismatch) return; start(async () => { const r = await run(changeOwnPassword(v.cur, v.next), "Password aggiornata."); if (r.ok) setV({ cur: "", next: "", rep: "" }); }); }}>
      <div className="a-field"><label className="a-lbl">Password attuale</label><input className="a-in" type="password" autoComplete="current-password" value={v.cur} onChange={(e) => setV({ ...v, cur: e.target.value })} required /></div>
      <div className="a-field"><label className="a-lbl">Nuova password</label><input className="a-in" type="password" autoComplete="new-password" value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} required minLength={10} /><p className="a-help">Almeno 10 caratteri.</p></div>
      <div className="a-field"><label className="a-lbl">Ripeti la nuova password</label><input className="a-in" type="password" autoComplete="new-password" value={v.rep} onChange={(e) => setV({ ...v, rep: e.target.value })} required aria-invalid={mismatch} />{mismatch && <p className="a-err-t">Le due password non coincidono.</p>}</div>
      <div><button className="a-btn" disabled={pending || mismatch}><Save />Aggiorna password</button></div>
    </form>
  );
}
