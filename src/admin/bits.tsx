import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Head({ title, sub, crumbs = [], actions }: { title: string; sub?: React.ReactNode; crumbs?: { label: string; href?: string }[]; actions?: React.ReactNode }) {
  return (
    <div className="a-head">
      <div>
        {crumbs.length > 0 && (
          <nav className="a-crumbs" aria-label="Percorso">
            {crumbs.map((c, i) => (<span key={i} className="a-row" style={{ gap: 6 }}>{i > 0 && <ChevronRight />}{c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}</span>))}
          </nav>
        )}
        <h1 className="a-h1">{title}</h1>
        {sub && <p className="a-sub">{sub}</p>}
      </div>
      {actions && <div className="a-row">{actions}</div>}
    </div>
  );
}

export const STATUS_LEAD: [string, string][] = [["new", "Nuova"], ["contacted", "Contattata"], ["qualified", "Qualificata"], ["won", "Vinta"], ["lost", "Persa"]];
export const KIND_LEAD: Record<string, string> = { test: "Prova di saldatura", quote: "Offerta", retrofit: "Retrofit", spare: "Ricambi", info: "Informazioni", contact: "Contatto" };
export const ago = (iso: string) => {
  const d = (Date.now() - new Date(iso.replace(" ", "T") + "Z").getTime()) / 1000;
  if (d < 60) return "adesso"; if (d < 3600) return `${Math.floor(d / 60)} min fa`; if (d < 86400) return `${Math.floor(d / 3600)} h fa`;
  if (d < 86400 * 30) return `${Math.floor(d / 86400)} g fa`;
  return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
};
