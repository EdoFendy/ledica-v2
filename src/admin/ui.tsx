"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, CircleAlert, X } from "lucide-react";

// ---------- toast
type Toast = { id: number; kind: "ok" | "err"; text: string };
const ToastCtx = createContext<(text: string, kind?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

// ---------- conferma
type Ask = { title: string; body?: string; ok?: string; danger?: boolean };
const ConfirmCtx = createContext<(a: Ask) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "err" ? 6000 : 3200);
  }, []);
  const dlg = useRef<HTMLDialogElement>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const confirm = useCallback((a: Ask) => new Promise<boolean>((res) => { resolver.current = res; setAsk(a); }), []);
  useEffect(() => { if (ask) dlg.current?.showModal(); }, [ask]);
  const close = (v: boolean) => { dlg.current?.close(); setAsk(null); resolver.current(v); };
  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <dialog ref={dlg} className="a-dialog" onCancel={(e) => { e.preventDefault(); close(false); }}>
          {ask && (<>
            <div className="d-b"><h3>{ask.title}</h3>{ask.body && <p>{ask.body}</p>}</div>
            <div className="d-f">
              <button className="a-btn sec" onClick={() => close(false)} autoFocus>Annulla</button>
              <button className={`a-btn ${ask.danger ? "danger-solid" : ""}`} onClick={() => close(true)}>{ask.ok ?? "Conferma"}</button>
            </div>
          </>)}
        </dialog>
        <div className="a-toasts" role="status" aria-live="polite">
          {toasts.map((t) => (<div key={t.id} className={`a-toast ${t.kind}`}>{t.kind === "ok" ? <Check /> : <CircleAlert />}<span>{t.text}</span></div>))}
        </div>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

// ---------- pannello laterale
export function Drawer({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);
  if (!mounted) return null;
  return createPortal(
    <>
      <div className="a-scrim" onClick={onClose} />
      <aside className="a-drawer adm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-drawer-h"><h2>{title}</h2><button className="a-btn ghost icon" onClick={onClose} aria-label="Chiudi"><X /></button></div>
        <div className="a-drawer-b">{children}</div>
        {footer && <div className="a-drawer-f">{footer}</div>}
      </aside>
    </>, document.body);
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (<label className="a-check"><span className="a-switch"><input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span /></span>{label}</label>);
}

/** Esegue un'azione server e mostra l'esito come toast. */
export function useRun() {
  const toast = useToast();
  return useCallback(async <T extends { ok: boolean; error?: string; msg?: string }>(p: Promise<T>, okText?: string) => {
    try {
      const r = await p;
      if (!r.ok) toast((r as any).error ?? "Operazione non riuscita.", "err");
      else if (okText || r.msg) toast(r.msg ?? okText!);
      return r;
    } catch (e: any) { toast(e?.message ?? "Errore inatteso.", "err"); return { ok: false, error: String(e) } as unknown as T; }
  }, [toast]);
}
