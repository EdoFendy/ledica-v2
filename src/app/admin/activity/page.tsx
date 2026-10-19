import Link from "next/link";
import { History } from "lucide-react";
import { db } from "@/lib/db";
import { Head, ago } from "@/admin/bits";

export default async function Activity({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const { who } = await searchParams;
  const people = (db().prepare("SELECT DISTINCT who FROM log ORDER BY who").all() as { who: string }[]).map((r) => r.who);
  const rows = (who ? db().prepare("SELECT * FROM log WHERE who=? ORDER BY id DESC LIMIT 300").all(who) : db().prepare("SELECT * FROM log ORDER BY id DESC LIMIT 300").all()) as any[];
  return (<>
    <Head title="Attività" crumbs={[{ label: "Sito" }, { label: "Attività" }]} sub="Chi ha modificato cosa nel pannello, dal più recente." />
    <div className="a-card">
      <div className="a-tabs"><Link className="a-tab" href="/admin/activity" aria-selected={!who}>Tutti</Link>{people.map((p) => <Link key={p} className="a-tab" href={`/admin/activity?who=${encodeURIComponent(p)}`} aria-selected={who === p}>{p}</Link>)}</div>
      <div className="a-card-b">
        {rows.length ? <ul className="a-feed">{rows.map((f) => (<li key={f.id}><span className="ic">{f.who.slice(0, 2).toUpperCase()}</span><span><b>{f.who}</b> {f.action} {f.href ? <Link href={f.href}>{f.target}</Link> : f.target}</span><time title={f.ts}>{ago(f.ts)}</time></li>))}</ul>
          : <div className="a-empty"><History /><b>Nessuna attività registrata</b></div>}
      </div>
    </div>
  </>);
}
