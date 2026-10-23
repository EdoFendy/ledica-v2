import type { Lang } from "./types";

/** Unica fonte per banner e Cookie policy: se cambia un cookie o un servizio, cambia qui e si aggiornano entrambi.
 *  Alzare CONSENT_VERSION quando si aggiunge una categoria o un servizio che richiede consenso: il banner viene riproposto. */
export const CONSENT_VERSION = 2;
export const CONSENT_DAYS = 180; // il Garante (linee guida 10/6/2021) sconsiglia di riproporre il banner prima di 6 mesi
export const LEGAL_UPDATED = "2026-10-23";

type T = Record<Lang, string>;
export type CookieRow = { name: string; provider: T; purpose: T; duration: T; kind: "technical" | "analytics"; needsGa?: boolean };

export const COOKIES: CookieRow[] = [
  { name: "ld_consent", kind: "technical",
    provider: { it: "LE.DI.CA. (prima parte)", en: "LE.DI.CA. (first party)" },
    purpose: { it: "Ricorda la tua scelta sui cookie, per non riproporti il banner a ogni pagina.", en: "Remembers your cookie choice, so the banner is not shown on every page." },
    duration: { it: "6 mesi", en: "6 months" } },
  { name: "ld_admin", kind: "technical",
    provider: { it: "LE.DI.CA. (prima parte)", en: "LE.DI.CA. (first party)" },
    purpose: { it: "Sessione dell'area riservata allo staff. Si crea solo dopo l'accesso con credenziali.", en: "Session for the staff-only area. Created only after logging in with credentials." },
    duration: { it: "7 giorni", en: "7 days" } },
  { name: "_ga", kind: "analytics", needsGa: true,
    provider: { it: "Google Ireland Ltd (Google Analytics 4)", en: "Google Ireland Ltd (Google Analytics 4)" },
    purpose: { it: "Distingue i visitatori in forma pseudonima per le statistiche aggregate delle visite.", en: "Distinguishes visitors pseudonymously for aggregate visit statistics." },
    duration: { it: "2 anni", en: "2 years" } },
  { name: "_ga_<ID>", kind: "analytics", needsGa: true,
    provider: { it: "Google Ireland Ltd (Google Analytics 4)", en: "Google Ireland Ltd (Google Analytics 4)" },
    purpose: { it: "Mantiene lo stato della sessione di misurazione.", en: "Keeps the state of the measurement session." },
    duration: { it: "2 anni", en: "2 years" } },
];

/** Cookie effettivamente in uso: quelli di Analytics compaiono solo se l'ID GA4 è configurato in Impostazioni. */
export const activeCookies = (ga4: string) => COOKIES.filter((c) => !c.needsGa || !!ga4);
