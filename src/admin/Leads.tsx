"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Inbox, Paperclip, Plus, Search, Trash2, Save } from "lucide-react";
import { deleteLeads, saveLead, setLeadStatus } from "./actions";
import { Drawer, useConfirm, useRun } from "./ui";
import { KIND_LEAD, STATUS_LEAD, ago } from "./bits";

export type Lead = { id: number; created: string; kind: string; lang: string; name: string; company: string; email: string; phone: string; country: string; message: string; status: string; notes: string; data: string; page: string; marketing: number };

export function LeadsTable({ rows, openNew, initialStatus }: { rows: Lead[]; openNew?: boolean; initialStatus?: string }) {
  const [st, setSt] = useState(initialStatus ?? "");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(!!openNew);
  const run = useRun(); const confirm = useConfirm(); const router = useRouter();
  const norm = (s: string) => (s ?? "").toLowerCase();
  const list = rows.filter((l) => (!st || l.status === st) && (!kind || l.kind === kind) && (!q || norm(l.name + l.company + l.email + l.country).includes(norm(q))));
  const count = (s: string) => rows.filter((l) => l.status === s).length;
  const allOn = list.length > 0 && list.every((l) => sel.has(l.id));
  const del = async () => {
    if (!(await confirm({ title: `Eliminare ${sel.size} richieste?`, body: "Contengono dati personali: vengono cancellate definitivamente.", ok: "Elimina", danger: true }))) return;
    const r = await run(deleteLeads([...sel]), "Richieste eliminate."); if (r.ok) { setSel(new Set()); router.refresh(); }
  };
  return (
    <>
      <div className="a-card">
        <div className="a-tabs" role="tablist">
          <button className="a-tab" role="tab" aria-selected={st === ""} onClick={() => setSt("")}>Tutte<span className="n">{rows.length}</span></button>
          {STATUS_LEAD.map(([v, l]) => (<button key={v} className="a-tab" role="tab" aria-selected={st === v} onClick={() => setSt(v)}>{l}<span className="n">{count(v)}</span></button>))}
        </div>
        <div className="a-toolbar">
          <div className="a-in-ico" style={{ flex: "1 1 260px", maxWidth: 360 }}><Search /><input className="a-in" placeholder="Cerca nome, azienda, email, Paese" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="a-in" style={{ width: "auto" }} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Tipo"><option value="">Tutti i tipi</option>{Object.entries(KIND_LEAD).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <div className="a-row" style={{ marginLeft: "auto" }}>
            <a className="a-btn sec sm" href="/admin/leads/export"><Download />Esporta CSV</a>
            <button className="a-btn sm" onClick={() => setCreating(true)}><Plus />Nuova richiesta</button>
          </div>
        </div>
        {sel.size > 0 && <div className="a-bulk">{sel.size} selezionate<button className="a-btn danger sm" onClick={del}><Trash2 />Elimina</button><button className="a-btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => setSel(new Set())}>Annulla selezione</button></div>}
        {list.length ? (
          <div className="a-tablewrap"><table className="a-table">
            <thead><tr><th style={{ width: 34 }}><input type="checkbox" aria-label="Seleziona tutte" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(list.map((l) => l.id)))} /></th><th>Contatto</th><th>Tipo</th><th>Paese</th><th>Stato</th><th>Ricevuta</th></tr></thead>
            <tbody>{list.map((l) => (
              <tr key={l.id} className={sel.has(l.id) ? "sel" : ""}>
                <td><input type="checkbox" aria-label={`Seleziona ${l.name}`} checked={sel.has(l.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(l.id) ? n.delete(l.id) : n.add(l.id); return n; })} /></td>
                <td><Link className="t-title" href={`/admin/leads/${l.id}`}>{l.name}{l.company ? ` · ${l.company}` : ""}</Link><div className="t-meta">{l.email}{JSON.parse(l.data || "{}").files ? " · allegati" : ""}</div></td>
                <td>{KIND_LEAD[l.kind] ?? l.kind}</td>
                <td>{l.country || "—"} <span className="a-tag">{l.lang.toUpperCase()}</span></td>
                <td><select className="a-in" style={{ height: 30, width: "auto", fontSize: 12.5 }} value={l.status} aria-label="Stato" onChange={async (e) => { await run(setLeadStatus(l.id, e.target.value), "Stato aggiornato."); router.refresh(); }}>{STATUS_LEAD.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></td>
                <td className="a-num" title={l.created}>{ago(l.created)}</td>
              </tr>))}</tbody>
          </table></div>
        ) : (
          <div className="a-empty"><Inbox /><b>{rows.length ? "Nessuna richiesta con questi filtri" : "Ancora nessuna richiesta"}</b><span>{rows.length ? "Cambia scheda o ricerca." : "Le richieste del modulo «Richiedi offerta» arrivano qui. Le telefonate puoi registrarle a mano."}</span></div>
        )}
      </div>
      {creating && <LeadDrawer onClose={() => setCreating(false)} />}
    </>
  );
}

const EMPTY = { kind: "info", lang: "it", name: "", company: "", email: "", phone: "", country: "", message: "", status: "new", notes: "" };
function LeadFields({ v, set }: { v: Record<string, string>; set: (k: string, x: string) => void }) {
  const F = (k: string, l: string, type = "text") => (<div className="a-field"><label className="a-lbl" htmlFor={`l-${k}`}>{l}</label><input id={`l-${k}`} className="a-in" type={type} value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></div>);
  return (
    <div className="a-fields">
      {F("name", "Nome e cognome")}{F("company", "Azienda")}{F("email", "Email", "email")}{F("phone", "Telefono", "tel")}{F("country", "Paese")}
      <div className="a-field"><label className="a-lbl">Tipo</label><select className="a-in" value={v.kind} onChange={(e) => set("kind", e.target.value)}>{Object.entries(KIND_LEAD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div className="a-field"><label className="a-lbl">Lingua</label><select className="a-in" value={v.lang} onChange={(e) => set("lang", e.target.value)}><option value="it">Italiano</option><option value="en">Inglese</option></select></div>
      <div className="a-field"><label className="a-lbl">Stato</label><select className="a-in" value={v.status} onChange={(e) => set("status", e.target.value)}>{STATUS_LEAD.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div className="a-field a-wide"><label className="a-lbl">Messaggio</label><textarea className="a-in" rows={4} value={v.message} onChange={(e) => set("message", e.target.value)} /></div>
      <div className="a-field a-wide"><label className="a-lbl">Note interne <span className="a-tag">non visibili al cliente</span></label><textarea className="a-in" rows={4} value={v.notes} onChange={(e) => set("notes", e.target.value)} /></div>
    </div>
  );
}
function LeadDrawer({ onClose }: { onClose: () => void }) {
  const [v, setV] = useState<Record<string, string>>(EMPTY);
  const [pending, start] = useTransition();
  const run = useRun(); const router = useRouter();
  const save = () => start(async () => { const r = await run(saveLead(null, v), "Richiesta registrata."); if (r.ok) { onClose(); router.push(`/admin/leads/${r.id}`); } });
  return (
    <Drawer title="Nuova richiesta" onClose={onClose} footer={<><button className="a-btn sec" onClick={onClose}>Annulla</button><button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button></>}>
      <p className="a-help" style={{ margin: 0 }}>Per registrare una richiesta arrivata al telefono, per email o in fiera.</p>
      <LeadFields v={v} set={(k, x) => setV((p) => ({ ...p, [k]: x }))} />
    </Drawer>
  );
}

const DATA_LABEL: Record<string, string> = { material: "Materiale", thickness: "Spessore (mm)", diameter: "Diametro (mm)", product: "Prodotto", norm: "Norma", current: "Saldatura attuale", speed: "Velocità (m/min)", goal: "Obiettivo", mill: "Profilatrice", files: "Allegati" };
export function LeadEditor({ lead }: { lead: Lead }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String((lead as any)[k] ?? "")])));
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const run = useRun(); const confirm = useConfirm(); const router = useRouter();
  const data = JSON.parse(lead.data || "{}") as Record<string, string>;
  const save = () => start(async () => { const r = await run(saveLead(lead.id, v), "Richiesta aggiornata."); if (r.ok) { setDirty(false); router.refresh(); } });
  const del = async () => { if (!(await confirm({ title: "Eliminare questa richiesta?", body: "Contiene dati personali: viene cancellata definitivamente.", ok: "Elimina", danger: true }))) return; const r = await run(deleteLeads([lead.id]), "Richiesta eliminata."); if (r.ok) router.push("/admin/leads"); };
  return (
    <div className="a-grid-2">
      <section className="a-card"><div className="a-card-h"><h2>Dati della richiesta</h2><span className={`a-pill ${v.status}`}>{STATUS_LEAD.find((s) => s[0] === v.status)?.[1]}</span></div>
        <div className="a-card-b"><LeadFields v={v} set={(k, x) => { setDirty(true); setV((p) => ({ ...p, [k]: x })); }} /></div>
        <div className="a-savebar" style={{ margin: 0, borderRadius: "0 0 8px 8px" }}>
          <span className={`state${dirty ? " dirty" : ""}`}>{dirty ? "Modifiche non salvate" : "Tutto salvato"}</span>
          <button className="a-btn danger" onClick={del}><Trash2 />Elimina</button>
          <button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button>
        </div>
      </section>
      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <section className="a-card"><div className="a-card-h"><h2>Contatto rapido</h2></div>
          <div className="a-card-b a-row">
            {v.email && <a className="a-btn sec sm" href={`mailto:${v.email}?subject=${encodeURIComponent("LE.DI.CA. — la tua richiesta")}`}>Scrivi email</a>}
            {v.phone && <a className="a-btn sec sm" href={`tel:${v.phone.replace(/\s/g, "")}`}>Chiama</a>}
            {v.phone && <a className="a-btn sec sm" href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener">WhatsApp</a>}
          </div>
        </section>
        <section className="a-card"><div className="a-card-h"><h2>Dati tecnici dal modulo</h2></div>
          <div className="a-card-b">
            {Object.keys(data).length ? <dl className="a-kv">{Object.entries(data).map(([k, x]) => (<div key={k} style={{ display: "contents" }}><dt>{DATA_LABEL[k] ?? k}</dt><dd>{k === "files" ? x.split(", ").map((f) => (<div key={f}><a href={`/admin/files/${encodeURIComponent(f)}`}><Paperclip style={{ width: 13, verticalAlign: -2 }} /> {f.replace(/^\d+-\w+-/, "")}</a></div>)) : x}</dd></div>))}</dl>
              : <p className="a-help" style={{ margin: 0 }}>Nessun dato tecnico: richiesta generica o inserita a mano.</p>}
          </div>
        </section>
        <section className="a-card"><div className="a-card-b"><dl className="a-kv">
          <dt>Ricevuta</dt><dd>{lead.created}</dd><dt>Dalla pagina</dt><dd className="a-num">{lead.page || "—"}</dd><dt>Newsletter</dt><dd>{lead.marketing ? "Consenso dato" : "No"}</dd>
        </dl></div></section>
      </div>
    </div>
  );
}
