import Link from "next/link";
import { getSite } from "@/lib/site";
import { currentUser } from "@/lib/auth";
import { SITE_SCHEMA } from "@/admin/schema";
import { Head } from "@/admin/bits";
import { SiteForm } from "./SiteForm";
import { COUNTRY } from "@/lib/countries";

const TABS: { id: string; label: string; keys: string[]; sub: string }[] = [
  { id: "azienda", label: "Dati aziendali", keys: ["company"], sub: "Ragione sociale, indirizzo, contatti, PEC e REA: compaiono nel piè di pagina, nei contatti e nelle schede PDF." },
  { id: "home", label: "Numeri e clienti", keys: ["numbers", "countries", "clients"], sub: "I numeri in home, i Paesi accesi sulla mappa e i clienti citati. Cita un cliente solo con il suo consenso." },
  { id: "team", label: "Team e storia", keys: ["team", "timeline"], sub: "Le persone e le tappe mostrate nella pagina Azienda." },
  { id: "fiere", label: "Fiere", keys: ["fairs"], sub: "Accendi solo le fiere a cui LE.DI.CA. partecipa davvero." },
  { id: "canali", label: "Social e misurazione", keys: ["social", "tracking"], sub: "Profili social e Google Analytics 4, che parte solo dopo il consenso ai cookie." },
  { id: "richieste", label: "Richieste", keys: ["routing", "features"], sub: "A chi arrivano le email delle richieste dal sito." },
];

export default async function Settings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await currentUser();
  if (me?.role !== "admin") return <><Head title="Impostazioni" /><div className="a-card a-empty"><b>Serve un account amministratore</b><span>Chiedi a un amministratore di modificare queste impostazioni.</span></div></>;
  const { tab = "azienda" } = await searchParams;
  const t = TABS.find((x) => x.id === tab) ?? TABS[0];
  const site = getSite() as any;
  const fields = SITE_SCHEMA.filter((f) => t.keys.includes(f.name));
  return (
    <>
      <Head title="Impostazioni" crumbs={[{ label: "Sito" }, { label: "Impostazioni" }]} sub={t.sub} />
      <div className="a-card">
        <div className="a-tabs" role="tablist">{TABS.map((x) => (<Link key={x.id} href={`/admin/settings?tab=${x.id}`} className="a-tab" role="tab" aria-selected={x.id === t.id}>{x.label}</Link>))}</div>
        <SiteForm key={t.id} fields={fields} init={Object.fromEntries(t.keys.map((k) => [k, site[k]]))} rel={{ country: Object.entries(COUNTRY).map(([value, v]) => ({ value, label: v.it })) }} />
      </div>
    </>
  );
}
