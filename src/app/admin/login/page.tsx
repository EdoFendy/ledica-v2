"use client";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/admin/actions";
import "@/admin/admin.css";

export default function Login() {
  const [state, action, pending] = useActionState(login, null as null | { error: string });
  return (
    <div className="adm a-login">
      <form action={action}>
        <span className="lp"><img src="/media/logo-ledica-sm.png" alt="LE.DI.CA." width={170} height={54} /></span>
        <div><h1 className="a-h1">Accedi al pannello</h1><p className="a-sub">Gestisci contenuti, richieste e impostazioni del sito.</p></div>
        <div><label className="a-lbl" htmlFor="email">Email</label><input id="email" name="email" type="email" className="a-in" autoComplete="username" required autoFocus /></div>
        <div><label className="a-lbl" htmlFor="password">Password</label><input id="password" name="password" type="password" className="a-in" autoComplete="current-password" required /></div>
        {state?.error && <p className="a-err-t" role="alert" style={{ margin: 0 }}>{state.error}</p>}
        <button className="a-btn" disabled={pending} style={{ height: 40 }}><LogIn />{pending ? "Accesso in corso…" : "Entra"}</button>
      </form>
    </div>
  );
}
