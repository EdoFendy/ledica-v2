"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { dict } from "@/lib/dict";
import { sectionHref } from "@/lib/routes";
import type { Lang } from "@/lib/types";
import { Arrow } from "./Icons";

type Opt = { slug: string; name: string };
const KINDS = ["test", "quote", "retrofit", "spare", "info"] as const;
const MATERIALS = [
  ["austenitic", "Inox austenitico", "Austenitic stainless"], ["duplex", "Duplex", "Duplex"], ["super", "Super austenitico (es. 904L)", "Super-austenitic (e.g. 904L)"],
  ["carbon", "Acciaio al carbonio", "Carbon steel"], ["titanium", "Titanio", "Titanium"], ["alu_cu", "Alluminio / rame", "Aluminium / copper"], ["other", "Altro", "Other"],
] as const;

export function RfqForm({ lang, products, initialKind, initialProduct }: { lang: Lang; products: Opt[]; initialKind?: string; initialProduct?: string }) {
  const t = dict(lang);
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<string>(KINDS.includes(initialKind as any) ? initialKind! : initialProduct ? "quote" : "test");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, string>>({ product: initialProduct ?? "" });
  const t0 = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const technical = kind === "test" || kind === "quote" || kind === "retrofit";
  const steps = technical ? 4 : 2;
  const last = step === steps;
  const set = (k: string, v: string) => setVals((p) => ({ ...p, [k]: v }));

  useEffect(() => { try { const s = sessionStorage.getItem("rfq"); if (s && !initialProduct) setVals((p) => ({ ...JSON.parse(s), ...p })); } catch {} }, [initialProduct]);
  useEffect(() => { try { sessionStorage.setItem("rfq", JSON.stringify(vals)); } catch {} }, [vals]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [step]);

  const field = (name: string, label: string, opts: { type?: string; req?: boolean; hint?: string; mono?: boolean; area?: boolean; auto?: string } = {}) => (
    <div className="fld">
      <label htmlFor={name}>{label}{!opts.req && <span className="muted"> · {t.f_optional}</span>}</label>
      {opts.area ? (
        <textarea id={name} name={name} className="input" value={vals[name] ?? ""} onChange={(e) => set(name, e.target.value)} aria-invalid={!!errs[name]} aria-describedby={errs[name] ? `${name}-e` : undefined} />
      ) : (
        <input id={name} name={name} type={opts.type ?? "text"} className={`input${opts.mono ? " mono" : ""}`} autoComplete={opts.auto} inputMode={opts.mono ? "decimal" : undefined}
          value={vals[name] ?? ""} onChange={(e) => set(name, e.target.value)} aria-invalid={!!errs[name]} aria-describedby={errs[name] ? `${name}-e` : undefined} />
      )}
      {opts.hint && <div className="hint">{opts.hint}</div>}
      {errs[name] && <div className="err" id={`${name}-e`}>{errs[name]}</div>}
    </div>
  );

  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!vals.name?.trim()) e.name = t.f_required;
    if (!/^\S+@\S+\.\S+$/.test(vals.email ?? "")) e.email = t.f_required;
    if (!vals.consent) e.consent = t.f_required;
    setErrs(e);
    return !Object.keys(e).length;
  };

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validateContact()) return;
    setState("sending");
    const fd = new FormData(formRef.current!);
    fd.set("kind", kind); fd.set("lang", lang); fd.set("elapsed", String(Date.now() - t0.current)); fd.set("page", location.pathname);
    try {
      const r = await fetch("/api/rfq", { method: "POST", body: fd });
      if (!r.ok) throw new Error(String(r.status));
      sessionStorage.removeItem("rfq");
      setState("ok");
      (window as any).gtag?.("event", "generate_lead", { kind });
    } catch { setState("err"); }
  }

  if (state === "ok") return (<div className="okbox" role="status"><h2 className="d3">{t.f_ok_title}</h2><p>{t.f_ok_body}</p><Link href={sectionHref(lang)} className="link-arrow">{t.go_home} <Arrow /></Link></div>);

  const show = (n: number) => step === n;
  return (
    <form ref={formRef} className="form" onSubmit={submit} noValidate>
      <div ref={topRef} style={{ scrollMarginTop: 90 }}>
        <div className="steps" aria-hidden="true">{Array.from({ length: steps }, (_, i) => <i key={i} className={i < step ? "on" : ""} />)}</div>
        <p className="step-label" aria-live="polite">{t.form_step} {step} {t.form_of} {steps}</p>
      </div>

      <div hidden={!show(1)}>
        <fieldset className="fld"><legend>{t.f_type}</legend>
          <div className="opts">
            {KINDS.map((k) => (
              <label key={k} className="opt"><input type="radio" name="kind_r" checked={kind === k} onChange={() => { setKind(k); setStep(1); }} />{t[`f_type_${k}` as keyof typeof t] as string}</label>
            ))}
          </div>
        </fieldset>
      </div>

      {technical && (
        <div hidden={!show(2)} className="form" style={{ maxWidth: "none" }}>
          <div className="fld">
            <label htmlFor="material">{t.f_material}</label>
            <select id="material" name="material" className="input" value={vals.material ?? ""} onChange={(e) => set("material", e.target.value)}>
              <option value="">—</option>
              {MATERIALS.map(([v, it, en]) => (<option key={v} value={v}>{lang === "it" ? it : en}</option>))}
            </select>
          </div>
          <div className="row2">{field("thickness", t.f_thickness, { mono: true })}{field("diameter", t.f_diameter, { mono: true })}</div>
          {kind === "quote" && (
            <div className="fld">
              <label htmlFor="product">{t.f_product}</label>
              <select id="product" name="product" className="input" value={vals.product ?? ""} onChange={(e) => set("product", e.target.value)}>
                <option value="">—</option>
                {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
              </select>
            </div>
          )}
          <div className="fld">
            <label htmlFor="norm">{t.f_norm}</label>
            <input id="norm" name="norm" className="input" value={vals.norm ?? ""} onChange={(e) => set("norm", e.target.value)} />
          </div>
        </div>
      )}
      {technical && (
        <div hidden={!show(3)} className="form" style={{ maxWidth: "none" }}>
          <div className="row2">
            <div className="fld">
              <label htmlFor="current">{t.f_current}</label>
              <select id="current" name="current" className="input" value={vals.current ?? ""} onChange={(e) => set("current", e.target.value)}>
                <option value="">—</option>
                {["TIG", "Plasma", "Laser", "HF (alta frequenza)", t.other].map((o) => (<option key={o}>{o}</option>))}
              </select>
            </div>
            {field("speed", t.f_speed, { mono: true })}
          </div>
          <fieldset className="fld"><legend>{t.f_goal}</legend>
            <div className="opts">
              {[["speed", t.f_goal_speed], ["bead", t.f_goal_bead], ["thick", t.f_goal_thick], ["other", t.f_goal_other]].map(([v, l]) => (
                <label key={v} className="opt"><input type="radio" name="goal" value={v} checked={vals.goal === v} onChange={() => set("goal", v)} />{l}</label>
              ))}
            </div>
          </fieldset>
          {field("mill", t.f_mill)}
          <div className="fld">
            <label htmlFor="files">{t.f_files}<span className="muted"> · {t.f_optional}</span></label>
            <input id="files" name="files" type="file" multiple accept="image/*,.pdf,.dwg,.dxf,.step,.stp" className="input" />
            <div className="hint">PDF, DWG/DXF, STEP, JPG/PNG · max 3 × 8 MB</div>
          </div>
        </div>
      )}

      <div hidden={!show(steps)} className="form" style={{ maxWidth: "none" }}>
        <div className="row2">{field("name", t.f_name, { req: true, auto: "name" })}{field("company", t.f_company, { auto: "organization" })}</div>
        <div className="row2">{field("email", t.f_email, { req: true, type: "email", auto: "email" })}{field("phone", t.f_phone, { type: "tel", auto: "tel" })}</div>
        {field("country", t.f_country, { auto: "country-name" })}
        {field("message", t.f_message, { area: true })}
        <label className="chk"><input type="checkbox" name="consent" checked={!!vals.consent} onChange={(e) => set("consent", e.target.checked ? "1" : "")} aria-invalid={!!errs.consent} /><span>{t.f_consent} <Link href={sectionHref(lang, "privacy")} target="_blank">{t.privacy}</Link>{errs.consent && <span className="err"> — {errs.consent}</span>}</span></label>
        <label className="chk"><input type="checkbox" name="marketing" value="1" /><span>{t.f_marketing}</span></label>
        <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        {state === "err" && <div className="errbox" role="alert">{t.f_err}</div>}
      </div>

      <div className="form-nav">
        {step > 1 ? <button type="button" className="btn btn-line" onClick={() => setStep(step - 1)} style={{ color: "var(--ink)" }}>{t.back}</button> : <span />}
        {last ? <button type="submit" className="btn" disabled={state === "sending"}>{state === "sending" ? t.sending : t.send}<Arrow /></button>
          : <button type="button" className="btn" onClick={() => setStep(step + 1)}>{t.next}<Arrow /></button>}
      </div>
    </form>
  );
}
