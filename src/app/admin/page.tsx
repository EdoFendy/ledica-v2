import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Inbox, ListChecks, Languages, CircleAlert, Package, Briefcase } from "lucide-react";
import { db } from "@/lib/db";
import { countByType, list } from "@/lib/content";
import { currentUser } from "@/lib/auth";
import { SCHEMA } from "@/admin/schema";
import { Head, KIND_LEAD, STATUS_LEAD, ago } from "@/admin/bits";

const n = (q: string, ...a: unknown[]) => (db().prepare(q).get(...a) as { n: number }).n;

export default async function Dashboard() {
  const me = await currentUser();
  const leads = db().prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 6").all() as any[];
  const byType = Object.fromEntries(countByType().map((r) => [r.type, r]));
  const items = (["product", "tech", "case", "application", "news", "page"] as const).flatMap((t) => list(t, { all: true }));
  const withNotes = items.filter((r) => r.data.confirm);
  const missingEn = items.filter((r) => { const k = r.data.name ?? r.data.title; return k?.it && !k.en; });
  const prov = n("SELECT COUNT(*) n FROM media WHERE provisional=1"), media = n("SELECT COUNT(*) n FROM media");
  const todoOpen = n("SELECT COUNT(*) n FROM todo WHERE done=0"), todoAll = n("SELECT COUNT(*) n FROM todo");
  const newLeads = n("SELECT COUNT(*) n FROM leads WHERE status='new'");
  // richieste per settimana, ultime 12
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const from = new Date(Date.now() - (11 - i + 1) * 7 * 864e5), to = new Date(Date.now() - (11 - i) * 7 * 864e5);
    return { label: `${to.getDate()}/${to.getMonth() + 1}`, n: n("SELECT COUNT(*) n FROM leads WHERE created >= ? AND created < ?", from.toISOString().slice(0, 19).replace("T", " "), to.toISOString().slice(0, 19).replace("T", " ")) };
  });
  const max = Math.max(1, ...weeks.map((w) => w.n));
  const feed = db().prepare("SELECT * FROM log ORDER BY id DESC LIMIT 8").all() as any[];
  const hour = new Date().getHours();
  return (
    <>
      <Head title={`${hour < 13 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera"}${me?.name ? ", " + me.name.split(" ")[0] : ""}`} sub="Ecco cosa succede sul sito e cosa manca prima del lancio." />
      <div className="a-kpis">
        <Link href="/admin/leads?s=new" className={`a-card a-kpi${newLeads ? " good" : ""}`}><span className="k-top">Richieste nuove<Inbox /></span><b>{newLeads}</b><small>{n("SELECT COUNT(*) n FROM leads")} in totale</small></Link>
        <Link href="/admin/content/product" className="a-card a-kpi"><span className="k-top">Prodotti online<Package /></span><b>{(byType.product?.n ?? 0) - (byType.product?.drafts ?? 0)}</b><small>{byType.product?.drafts ?? 0} in bozza</small></Link>
        <Link href="/admin/content/case" className="a-card a-kpi"><span className="k-top">Casi studio<Briefcase /></span><b>{byType.case?.n ?? 0}</b><small>{byType.news?.n ?? 0} news pubblicate</small></Link>
        <Link href="/admin/todo" className={`a-card a-kpi${todoOpen ? " warn" : ""}`}><span className="k-top">Dati dal cliente<ListChecks /></span><b>{todoAll - todoOpen}/{todoAll}</b><div className="a-progress"><span style={{ width: `${todoAll ? ((todoAll - todoOpen) / todoAll) * 100 : 0}%` }} /></div></Link>
        <Link href="/admin/media?f=prov" className={`a-card a-kpi${prov ? " warn" : ""}`}><span className="k-top">Foto provvisorie<ImageIcon /></span><b>{prov}</b><small>su {media} immagini</small></Link>
        <Link href="/admin/content/product?s=todo" className={`a-card a-kpi${missingEn.length ? " warn" : ""}`}><span className="k-top">Da tradurre<Languages /></span><b>{missingEn.length}</b><small>contenuti senza titolo inglese</small></Link>
      </div>

      <div className="a-grid-2">
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <section className="a-card">
            <div className="a-card-h"><h2>Richieste, ultime 12 settimane</h2><Link className="a-btn ghost sm" href="/admin/leads">Tutte<ArrowRight /></Link></div>
            <div className="a-card-b">
              <div className="a-bars" role="img" aria-label="Richieste per settimana">{weeks.map((w, i) => (<div key={i} title={`${w.n} richieste`}><i className={w.n ? "" : "zero"} style={{ height: `${(w.n / max) * 100}%` }} /><span>{w.label}</span></div>))}</div>
            </div>
          </section>
          <section className="a-card">
            <div className="a-card-h"><h2>Ultime richieste</h2></div>
            {leads.length ? (
              <div className="a-tablewrap"><table className="a-table"><tbody>
                {leads.map((l) => (<tr key={l.id}><td><Link className="t-title" href={`/admin/leads/${l.id}`}>{l.name}</Link><div className="t-meta">{l.company || l.email}</div></td><td>{KIND_LEAD[l.kind] ?? l.kind}</td><td><span className={`a-pill ${l.status}`}>{STATUS_LEAD.find((s) => s[0] === l.status)?.[1]}</span></td><td className="a-num">{ago(l.created)}</td></tr>))}
              </tbody></table></div>
            ) : <div className="a-empty"><Inbox /><b>Nessuna richiesta per ora</b><span>Arrivano dal modulo «Richiedi offerta» del sito. Puoi anche inserirle a mano.</span><Link className="a-btn sec sm" href="/admin/leads?new=1">Inserisci una richiesta</Link></div>}
          </section>
          <section className="a-card">
            <div className="a-card-h"><h2>Schede con dati da confermare</h2><span className="a-pill warn">{withNotes.length}</span></div>
            <div className="a-tablewrap"><table className="a-table"><tbody>
              {withNotes.slice(0, 8).map((r) => (<tr key={r.id}><td style={{ width: "34%" }}><Link className="t-title" href={`/admin/content/${r.type}/${r.id}#s-note`}>{SCHEMA[r.type].title(r.data)}</Link><div className="t-meta">{SCHEMA[r.type].label}</div></td><td style={{ color: "var(--a-muted)", fontSize: 13 }}>{r.data.confirm}</td></tr>))}
            </tbody></table></div>
          </section>
        </div>
        <section className="a-card" style={{ alignSelf: "start" }}>
          <div className="a-card-h"><h2>Attività recente</h2><Link className="a-btn ghost sm" href="/admin/activity">Tutta<ArrowRight /></Link></div>
          <div className="a-card-b">
            {feed.length ? <ul className="a-feed">{feed.map((f) => (<li key={f.id}><span className="ic">{f.who.slice(0, 2).toUpperCase()}</span><span><b>{f.who}</b> {f.action} {f.href ? <Link href={f.href}>{f.target}</Link> : f.target}</span><time>{ago(f.ts)}</time></li>))}</ul>
              : <div className="a-empty"><CircleAlert /><span>Le modifiche fatte nel pannello compariranno qui.</span></div>}
          </div>
        </section>
      </div>
    </>
  );
}
