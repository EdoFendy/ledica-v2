"use client";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { deleteTodo, saveTodo, toggleTodo } from "./actions";
import { Drawer, useConfirm, useRun } from "./ui";

export type TRow = { id: number; grp: string; text: string; note: string; done: number };

export function TodoBoard({ rows }: { rows: TRow[] }) {
  const [only, setOnly] = useState<"open" | "all" | "done">("open");
  const [edit, setEdit] = useState<TRow | "new" | null>(null);
  const groups = [...new Set(rows.map((r) => r.grp))];
  const done = rows.filter((r) => r.done).length;
  return (
    <>
      <div className="a-card" style={{ marginBottom: 16 }}><div className="a-card-b a-row" style={{ gap: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}><div className="a-meter-row" style={{ marginBottom: 6 }}><b>{done} di {rows.length} voci chiuse</b><span className="a-num">{rows.length ? Math.round((done / rows.length) * 100) : 0}%</span></div><div className="a-progress"><span style={{ width: `${rows.length ? (done / rows.length) * 100 : 0}%` }} /></div></div>
        <div className="a-chips">{([["open", "Da fare"], ["done", "Chiuse"], ["all", "Tutte"]] as const).map(([v, l]) => <button key={v} className={`a-chip${only === v ? " on" : ""}`} onClick={() => setOnly(v)}>{l}</button>)}</div>
        <button className="a-btn sm" onClick={() => setEdit("new")}><Plus />Nuova voce</button>
      </div></div>
      <div style={{ display: "grid", gap: 16 }}>
        {groups.map((g) => {
          const items = rows.filter((r) => r.grp === g && (only === "all" || (only === "done" ? r.done : !r.done)));
          if (!items.length) return null;
          const gd = rows.filter((r) => r.grp === g && r.done).length, gt = rows.filter((r) => r.grp === g).length;
          return (
            <section key={g} className="a-card">
              <div className="a-card-h"><h2>{g}</h2><span className="a-num">{gd}/{gt}</span></div>
              {items.map((r) => <TodoItem key={r.id} r={r} onEdit={() => setEdit(r)} />)}
            </section>
          );
        })}
      </div>
      {edit && <TodoDrawer r={edit === "new" ? null : edit} groups={groups} onClose={() => setEdit(null)} />}
    </>
  );
}

function TodoItem({ r, onEdit }: { r: TRow; onEdit: () => void }) {
  const [d, setD] = useOptimistic(!!r.done);
  const [, start] = useTransition(); const run = useRun(); const confirm = useConfirm(); const router = useRouter();
  return (
    <div className={`a-todo${d ? " done" : ""}`}>
      <input type="checkbox" checked={d} aria-label="Fatto" style={{ width: 17, height: 17, accentColor: "var(--a-accent)", marginTop: 2 }} onChange={(e) => start(async () => { setD(e.target.checked); await run(toggleTodo(r.id, e.target.checked)); router.refresh(); })} />
      <div><div className="tx">{r.text}</div>{r.note && <div className="nt">{r.note}</div>}</div>
      <div className="acts">
        <button className="a-btn ghost icon" onClick={onEdit} aria-label="Modifica"><Pencil /></button>
        <button className="a-btn ghost icon" style={{ color: "var(--a-err)" }} aria-label="Elimina" onClick={async () => { if (await confirm({ title: "Eliminare questa voce?", ok: "Elimina", danger: true })) { await run(deleteTodo(r.id), "Voce eliminata."); router.refresh(); } }}><Trash2 /></button>
      </div>
    </div>
  );
}

function TodoDrawer({ r, groups, onClose }: { r: TRow | null; groups: string[]; onClose: () => void }) {
  const [v, setV] = useState({ grp: r?.grp ?? groups[0] ?? "Altro", text: r?.text ?? "", note: r?.note ?? "", done: !!r?.done });
  const [pending, start] = useTransition(); const run = useRun(); const router = useRouter();
  const save = () => start(async () => { const x = await run(saveTodo(r?.id ?? null, v), "Voce salvata."); if (x.ok) { onClose(); router.refresh(); } });
  return (
    <Drawer title={r ? "Modifica voce" : "Nuova voce"} onClose={onClose} footer={<><button className="a-btn sec" onClick={onClose}>Annulla</button><button className="a-btn" disabled={pending} onClick={save}><Save />Salva</button></>}>
      <div className="a-field"><label className="a-lbl">Cosa chiedere o fare</label><textarea className="a-in" rows={3} value={v.text} onChange={(e) => setV({ ...v, text: e.target.value })} autoFocus /></div>
      <div className="a-field"><label className="a-lbl">Gruppo</label><input className="a-in" list="todo-groups" value={v.grp} onChange={(e) => setV({ ...v, grp: e.target.value })} /><datalist id="todo-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist></div>
      <div className="a-field"><label className="a-lbl">Risposta o nota</label><textarea className="a-in" rows={4} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} placeholder="Es. confermato dall'ufficio tecnico il 20/10: 600 A" /></div>
    </Drawer>
  );
}
