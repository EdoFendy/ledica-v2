"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, Inbox, Package, Zap, Briefcase, Layers, Newspaper, FileText, Image as ImageIcon, Settings, Users, ArrowRightLeft, ListChecks, Search, ExternalLink, LogOut, Menu, KeyRound, History } from "lucide-react";
import { Providers } from "./ui";
import { logout } from "./actions";
import type { User } from "@/lib/auth";

type Counts = { leads: number; todo: number };
const NAV = [
  { sep: null, items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/leads", label: "Richieste", icon: Inbox, count: "leads" as const }] },
  { sep: "CONTENUTI", items: [
    { href: "/admin/content/product", label: "Prodotti", icon: Package }, { href: "/admin/content/tech", label: "Tecnologie", icon: Zap },
    { href: "/admin/content/case", label: "Casi studio", icon: Briefcase }, { href: "/admin/content/application", label: "Applicazioni", icon: Layers },
    { href: "/admin/content/news", label: "News", icon: Newspaper }, { href: "/admin/content/page", label: "Pagine", icon: FileText }, { href: "/admin/media", label: "Media", icon: ImageIcon },
  ] },
  { sep: "SITO", items: [
    { href: "/admin/settings", label: "Impostazioni", icon: Settings, admin: true }, { href: "/admin/redirects", label: "Redirect", icon: ArrowRightLeft },
    { href: "/admin/todo", label: "Da chiedere al cliente", icon: ListChecks, count: "todo" as const }, { href: "/admin/users", label: "Utenti", icon: Users, admin: true }, { href: "/admin/activity", label: "Attività", icon: History },
  ] },
];
const QUICK = [{ href: "/admin/content/product/new", label: "Nuovo prodotto" }, { href: "/admin/content/case/new", label: "Nuovo caso studio" }, { href: "/admin/content/news/new", label: "Nuova news" }, { href: "/admin/leads?new=1", label: "Nuova richiesta" }];

export function AdminShell({ user, counts, children }: { user: User; counts: Counts; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [pal, setPal] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((v) => !v); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  const isOn = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const initials = (user.name || user.email).split(/[\s@.]/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <Providers>
      <div className="adm a-shell">
        <aside className={`a-side${open ? " open" : ""}`} aria-label="Navigazione admin">
          <Link href="/admin" className="a-brand"><span className="a-brand-plate"><img src="/media/logo-ledica-sm.png" alt="" width={95} height={30} /></span><span><b style={{ fontSize: 13 }}>Pannello</b><small>ledica.it</small></span></Link>
          {NAV.map((g, i) => (
            <div key={i} style={{ display: "contents" }}>
              {g.sep && <span className="a-sep">{g.sep}</span>}
              {g.items.filter((it: any) => !it.admin || user.role === "admin").map((it: any) => {
                const Ico = it.icon; const n = it.count ? counts[it.count as keyof Counts] : 0;
                return (<Link key={it.href} href={it.href} className="a-nav" aria-current={isOn(it.href) ? "page" : undefined}><Ico />{it.label}{n > 0 && <span className={`a-count${it.count === "todo" ? " warn" : ""}`}>{n}</span>}</Link>);
              })}
            </div>
          ))}
          <div className="a-side-foot">
            <a className="a-nav" href="/" target="_blank" rel="noopener"><ExternalLink />Vedi il sito</a>
            <Link className="a-nav" href="/admin/account"><KeyRound />Il mio account</Link>
            <form action={logout}><button className="a-nav"><LogOut />Esci</button></form>
            <div className="a-me"><span className="a-avatar">{initials}</span><div><b>{user.name || user.email}</b><span>{user.role === "admin" ? "Amministratore" : "Editor"}</span></div></div>
          </div>
        </aside>
        {open && <div className="a-scrim" onClick={() => setOpen(false)} />}
        <div className="a-main">
          <header className="a-top">
            <button className="a-btn ghost icon a-burger" onClick={() => setOpen(true)} aria-label="Apri menu"><Menu /></button>
            <button className="a-search" onClick={() => setPal(true)}><Search /><span>Cerca contenuti, pagine, azioni…</span><kbd>⌘K</kbd></button>
            <div className="a-top-right">
              <a className="a-btn ghost sm" href="/" target="_blank" rel="noopener"><ExternalLink />Vedi il sito</a>
            </div>
          </header>
          <main className="a-page" id="main">{children}</main>
        </div>
        {pal && <Palette onClose={() => setPal(false)} isAdmin={user.role === "admin"} />}
      </div>
    </Providers>
  );
}

type Hit = { group: string; label: string; href: string; hint?: string };
function Palette({ onClose, isAdmin }: { onClose: () => void; isAdmin: boolean }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Hit[]>([]);
  const [i, setI] = useState(0);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { fetch("/admin/api/search").then((r) => r.json()).then(setItems).catch(() => {}); }, []);
  const base: Hit[] = useMemo(() => [
    ...NAV.flatMap((g) => g.items.filter((it: any) => !it.admin || isAdmin).map((it) => ({ group: "Vai a", label: it.label, href: it.href }))),
    ...QUICK.map((x) => ({ group: "Crea", label: x.label, href: x.href })),
  ], [isAdmin]);
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const list = [...base, ...items].filter((h) => !q || norm(h.label + " " + (h.hint ?? "")).includes(norm(q))).slice(0, 40);
  useEffect(() => setI(0), [q]);
  const go = (h?: Hit) => { if (!h) return; onClose(); router.push(h.href); };
  let lastGroup = "";
  return (
    <div className="a-palette adm" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Ricerca rapida">
      <div className="a-palette-box" ref={box}>
        <div className="a-palette-in"><Search /><input autoFocus placeholder="Cerca un prodotto, un caso studio, una richiesta…" value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(v + 1, list.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(v - 1, 0)); } if (e.key === "Enter") go(list[i]); }} /><span className="a-kbd">Esc</span></div>
        <div className="a-palette-list" role="listbox">
          {list.length === 0 && <div className="a-empty"><b>Nessun risultato</b><span>Prova con un altro termine.</span></div>}
          {list.map((h, k) => {
            const head = h.group !== lastGroup ? (lastGroup = h.group) : null;
            return (<div key={h.href + k}>{head && <div className="a-palette-grp">{head}</div>}
              <a className={`a-palette-item${k === i ? " on" : ""}`} role="option" aria-selected={k === i} onMouseEnter={() => setI(k)} onClick={(e) => { e.preventDefault(); go(h); }} href={h.href}>{h.label}{h.hint && <small>{h.hint}</small>}</a></div>);
          })}
        </div>
      </div>
    </div>
  );
}
