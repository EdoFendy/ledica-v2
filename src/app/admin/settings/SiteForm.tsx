"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, RefreshCw } from "lucide-react";
import { FieldsEditor, useDoc } from "@/admin/Editor";
import { saveSite } from "@/admin/actions";
import { useRun } from "@/admin/ui";
import type { Field } from "@/admin/schema";

export function SiteForm({ fields, init, rel }: { fields: Field[]; init: Record<string, unknown>; rel: any }) {
  const { doc, set, dirty, setDirty } = useDoc(init);
  const [pending, start] = useTransition(); const run = useRun(); const router = useRouter();
  const save = () => start(async () => { const r = await run(saveSite(doc), "Impostazioni salvate: il sito è già aggiornato."); if (r.ok) { setDirty(false); router.refresh(); } });
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }}>
      <div className="a-card-b"><FieldsEditor fields={fields} doc={doc} set={set} rel={rel} /></div>
      <div className="a-savebar" style={{ margin: 0, borderRadius: "0 0 8px 8px" }}>
        <span className={`state${dirty ? " dirty" : ""}`}>{dirty ? "Modifiche non salvate" : "Tutto salvato"}</span>
        <button className="a-btn" disabled={pending}>{pending ? <RefreshCw className="spin" /> : <Save />}Salva</button>
      </div>
    </form>
  );
}
