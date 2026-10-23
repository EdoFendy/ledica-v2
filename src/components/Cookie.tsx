"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { dict } from "@/lib/dict";
import { sectionHref } from "@/lib/routes";
import { CONSENT_DAYS, CONSENT_VERSION } from "@/lib/legal";
import type { Lang } from "@/lib/types";

// valore del cookie: "a.<versione>" (misurazione accettata) o "n.<versione>"; una versione diversa vale come nessuna scelta
const read = () => {
  const v = document.cookie.split("; ").find((c) => c.startsWith("ld_consent="))?.split("=")[1] ?? "";
  const [choice, ver] = v.split(".");
  return Number(ver) === CONSENT_VERSION && (choice === "a" || choice === "n") ? choice : "";
};
const write = (v: "a" | "n") => { document.cookie = `ld_consent=${v}.${CONSENT_VERSION}; Max-Age=${60 * 60 * 24 * CONSENT_DAYS}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; };

function loadGA(id: string) {
  const w = window as any;
  if (!id) return;
  if (document.getElementById("ga-s")) { w.gtag?.("consent", "update", { analytics_storage: "granted" }); return; }
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  w.gtag("js", new Date());
  w.gtag("consent", "update", { analytics_storage: "granted" });
  w.gtag("config", id, { anonymize_ip: true });
  const s = document.createElement("script");
  s.id = "ga-s"; s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}
/** Revoca: Analytics smette di scrivere e i suoi cookie vengono cancellati su tutti i domini padre. */
function revokeGA() {
  (window as any).gtag?.("consent", "update", { analytics_storage: "denied" });
  const parts = location.hostname.split(".");
  const domains = ["", ...parts.map((_, i) => "." + parts.slice(i).join("."))];
  for (const c of document.cookie.split("; ")) {
    const name = c.split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) for (const d of domains) document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
  }
}

export function CookieBanner({ lang, ga4 }: { lang: Lang; ga4: string }) {
  const t = dict(lang);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = read();
    if (!v && ga4) setOpen(true); // con i soli cookie tecnici il banner non è dovuto: resta il link «Preferenze cookie»
    if (v === "a") loadGA(ga4);
    const reopen = (e: Event) => {
      if (!(e.target as HTMLElement).closest("[data-cookie-open]")) return;
      setAnalytics(read() === "a"); setPrefs(true); setOpen(true);
      requestAnimationFrame(() => box.current?.focus());
    };
    document.addEventListener("click", reopen);
    return () => document.removeEventListener("click", reopen);
  }, [ga4]);

  const choose = (a: boolean) => {
    const was = read();
    write(a ? "a" : "n");
    if (a) loadGA(ga4); else if (was === "a") revokeGA();
    setOpen(false); setPrefs(false);
  };
  if (!open) return null;
  return (
    <div ref={box} className="cookie" role="dialog" aria-modal="false" aria-labelledby="ck-t" aria-describedby="ck-d" tabIndex={-1}
      onKeyDown={(e) => { if (e.key === "Escape") choose(false); }}>
      {/* la X chiude mantenendo solo i cookie tecnici, come «Rifiuta» (linee guida Garante 2021) */}
      <button type="button" className="cookie-x" onClick={() => choose(false)} aria-label={t.cookie_close}><span aria-hidden="true">×</span></button>
      <h2 id="ck-t">{ga4 ? t.cookie_title : t.cookie}</h2>
      <p id="ck-d">{ga4 ? t.cookie_body : t.cookie_body_tech} <Link href={sectionHref(lang, "cookie")}>{t.cookie_policy}</Link> · <Link href={sectionHref(lang, "privacy")}>{t.privacy}</Link></p>
      {prefs && ga4 && (
        <div className="cookie-cats">
          <label className="cookie-cat">
            <input type="checkbox" checked disabled />
            <span><b>{t.cookie_technical}</b><small>{t.cookie_technical_d}</small></span>
          </label>
          <label className="cookie-cat">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            <span><b>{t.cookie_analytics}</b><small>{t.cookie_analytics_d}</small></span>
          </label>
        </div>
      )}
      {!ga4 ? (
        <div className="acts"><button type="button" className="btn neutral" onClick={() => choose(false)}>{t.cookie_ok}</button></div>
      ) : (
      <div className="acts">
        {/* Rifiuta, Preferenze e Accetta hanno lo stesso peso visivo (linee guida Garante 2021) */}
        <button type="button" className="btn neutral" onClick={() => choose(false)}>{t.cookie_reject}</button>
        {prefs
          ? <button type="button" className="btn neutral" onClick={() => choose(analytics)}>{t.cookie_save}</button>
          : <button type="button" className="btn neutral" onClick={() => setPrefs(true)}>{t.cookie_prefs}</button>}
        <button type="button" className="btn neutral" onClick={() => choose(true)}>{t.cookie_accept}</button>
      </div>
      )}
    </div>
  );
}
