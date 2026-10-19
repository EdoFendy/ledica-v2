"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dict } from "@/lib/dict";
import { sectionHref } from "@/lib/routes";
import type { Lang } from "@/lib/types";

const read = () => document.cookie.split("; ").find((c) => c.startsWith("ld_consent="))?.split("=")[1] ?? "";
const write = (v: "a" | "n") => { document.cookie = `ld_consent=${v}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; };

function loadGA(id: string) {
  if (!id || document.getElementById("ga-s")) return;
  const w = window as any;
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

export function CookieBanner({ lang, ga4 }: { lang: Lang; ga4: string }) {
  const t = dict(lang);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const v = read();
    if (!v) setOpen(true);
    if (v === "a") loadGA(ga4);
    const reopen = (e: Event) => { if ((e.target as HTMLElement).closest("[data-cookie-open]")) { setPrefs(true); setOpen(true); } };
    document.addEventListener("click", reopen);
    return () => document.removeEventListener("click", reopen);
  }, [ga4]);

  const choose = (a: boolean) => { write(a ? "a" : "n"); if (a) loadGA(ga4); setOpen(false); setPrefs(false); };
  if (!open) return null;
  return (
    <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="ck-t">
      <h2 id="ck-t">{t.cookie_title}</h2>
      <p>{t.cookie_body} <Link href={sectionHref(lang, "cookie")}>{t.cookie}</Link></p>
      {prefs && (
        <div>
          <label><input type="checkbox" checked disabled /> {t.cookie_technical}</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> {t.cookie_analytics}</label>
        </div>
      )}
      <div className="acts">
        {/* Accetta e Rifiuta hanno lo stesso peso visivo (linee guida Garante 2021). */}
        <button className="btn neutral" onClick={() => choose(false)}>{t.cookie_reject}</button>
        {prefs ? <button className="btn neutral" onClick={() => choose(analytics)}>{t.cookie_save}</button> : <button className="btn neutral" onClick={() => setPrefs(true)}>{t.cookie_prefs}</button>}
        <button className="btn neutral" onClick={() => choose(true)}>{t.cookie_accept}</button>
      </div>
    </div>
  );
}
