import type { ContentType } from "@/lib/types";

export type Field = {
  name: string; label: string;
  kind: "text" | "textarea" | "md" | "number" | "select" | "bool" | "image" | "images" | "list" | "group" | "multi" | "date" | "tags";
  i18n?: boolean; help?: string; options?: { value: string; label: string }[]; rel?: "tech" | "product" | "case" | "country";
  of?: Field[] | "text" | "i18n"; fields?: Field[]; internal?: boolean; wide?: boolean; max?: number;
};

const T = (name: string, label: string, kind: Field["kind"] = "text", extra: Partial<Field> = {}): Field => ({ name, label, kind, i18n: true, ...extra });
const seo: Field = { name: "seo", label: "Risultato su Google", kind: "group", help: "Se lasci vuoto, il sito usa il nome e il riassunto.", fields: [T("title", "Titolo (title)", "text", { max: 60 }), T("description", "Descrizione (meta description)", "textarea", { max: 155 })] };
const confirm: Field = { name: "confirm", label: "Da confermare (nota interna, non pubblica)", kind: "textarea", internal: true, help: "Dubbi sui dati da chiarire con l'ufficio tecnico." };

export const SCHEMA: Record<ContentType, { label: string; plural: string; title: (d: any) => string; fields: Field[] }> = {
  product: {
    label: "Prodotto", plural: "Prodotti", title: (d) => d.name?.it,
    fields: [
      { name: "tech", label: "Tecnologia", kind: "select", rel: "tech" },
      T("name", "Nome"), T("subtitle", "Sottotitolo"), T("summary", "Riassunto (card e meta)", "textarea"),
      T("body", "Descrizione estesa", "md"),
      { name: "specs", label: "Dati tecnici (stesse righe e unità su tutte le schede)", kind: "list", of: [T("label", "Voce"), T("value", "Valore")] },
      { name: "benefits", label: "Vantaggi (3 consigliati)", kind: "list", of: "i18n" },
      { name: "perf", label: "Prestazioni misurate (evidenziate in arancio)", kind: "list", of: [T("label", "Condizione"), { name: "value", label: "Valore", kind: "text" }] },
      { name: "thickMin", label: "Spessore min (mm)", kind: "number", help: "Solo se dichiarato. Vuoto = non mostrato." },
      { name: "thickMax", label: "Spessore max (mm)", kind: "number", help: "Solo il massimo = «fino a X mm»." },
      { name: "images", label: "Immagini (la prima è la principale)", kind: "images" },
      { name: "videos", label: "Video YouTube (solo ID, es. 9dFw2b2XNPk)", kind: "list", of: "text" },
      { name: "badge", label: "Etichetta", kind: "select", options: [{ value: "", label: "—" }, { value: "new", label: "Novità" }] },
      { name: "featured", label: "In evidenza", kind: "bool" },
      confirm, seo,
    ],
  },
  tech: {
    label: "Tecnologia", plural: "Tecnologie", title: (d) => d.name?.it,
    fields: [
      { name: "key", label: "Chiave interna", kind: "text", help: "Non cambiarla: collega prodotti e casi." },
      T("name", "Nome"), T("subtitle", "Sottotitolo"), T("summary", "Riassunto", "textarea"), T("body", "Testo (Markdown, 600–900 parole consigliate)", "md"),
      { name: "thickMin", label: "Spessore min (mm)", kind: "number", help: "Vuoto se la tecnologia non ha un campo di spessore." }, { name: "thickMax", label: "Spessore max (mm)", kind: "number" }, T("scope", "Ambito (se non c'è uno spessore)", "text", { help: "Es. «Ø interno da 65 mm»." }),
      { name: "materials", label: "Materiali", kind: "list", of: "i18n" },
      { name: "faq", label: "FAQ (generano dati strutturati)", kind: "list", of: [T("q", "Domanda"), T("a", "Risposta", "textarea")] },
      { name: "image", label: "Immagine", kind: "image" }, seo,
    ],
  },
  case: {
    label: "Caso studio", plural: "Casi studio", title: (d) => d.title?.it,
    fields: [
      T("title", "Titolo"), T("client", "Cliente / tipo cliente"), T("country", "Paese"), { name: "iso", label: "Paesi sulla mappa", kind: "multi", rel: "country" }, T("sector", "Settore"),
      { name: "year", label: "Anno", kind: "number" }, { name: "date", label: "Data pubblicazione", kind: "date" },
      { name: "techs", label: "Tecnologie", kind: "multi", rel: "tech" }, { name: "products", label: "Prodotti usati", kind: "multi", rel: "product" },
      { name: "headline", label: "Numero in evidenza", kind: "group", fields: [{ name: "value", label: "Valore (es. 12 mm)", kind: "text" }, T("label", "Descrizione")] },
      T("challenge", "La sfida", "textarea"), T("solution", "La soluzione", "textarea"),
      { name: "results", label: "Risultati in numeri", kind: "list", of: [{ name: "value", label: "Valore", kind: "text" }, T("label", "Descrizione")] },
      { name: "quote", label: "Citazione del cliente", kind: "group", fields: [T("text", "Testo", "textarea"), { name: "who", label: "Chi", kind: "text" }] },
      { name: "images", label: "Immagini", kind: "images" }, { name: "videos", label: "Video YouTube (ID)", kind: "list", of: "text" },
      confirm, seo,
    ],
  },
  news: {
    label: "News", plural: "News", title: (d) => d.title?.it,
    fields: [
      T("title", "Titolo"), T("summary", "Riassunto", "textarea"), T("body", "Testo (opzionale, Markdown)", "md"), { name: "date", label: "Data", kind: "date" }, { name: "image", label: "Immagine", kind: "image" },
      { name: "link", label: "Collega a", kind: "group", fields: [{ name: "kind", label: "Tipo", kind: "select", options: [{ value: "", label: "—" }, { value: "case", label: "Caso studio" }, { value: "product", label: "Prodotto" }] }, { name: "slug", label: "Slug italiano del collegato", kind: "text" }] },
      seo,
    ],
  },
  application: {
    label: "Applicazione", plural: "Applicazioni", title: (d) => d.name?.it,
    fields: [T("name", "Nome"), T("summary", "Riassunto", "textarea"), T("body", "Testo", "textarea"), { name: "techs", label: "Tecnologie consigliate", kind: "multi", rel: "tech" }, { name: "cases", label: "Casi studio", kind: "multi", rel: "case" }, seo],
  },
  page: {
    label: "Pagina", plural: "Pagine", title: (d) => d.title?.it,
    fields: [T("title", "Titolo"), T("lead", "Occhiello", "textarea"), T("body", "Testo (Markdown)", "md"), seo],
  },
};

export const SITE_SCHEMA: Field[] = [
  { name: "company", label: "Dati societari", kind: "group", fields: [
    { name: "name", label: "Nome", kind: "text" }, { name: "legal", label: "Ragione sociale", kind: "text" }, { name: "address", label: "Indirizzo", kind: "text" }, { name: "zip", label: "CAP", kind: "text" }, { name: "city", label: "Città", kind: "text" },
    { name: "phone", label: "Telefono", kind: "text" }, { name: "email", label: "Email", kind: "text" }, { name: "pec", label: "PEC", kind: "text" }, { name: "rea", label: "REA", kind: "text" }, { name: "vat", label: "P. IVA", kind: "text" }, { name: "capital", label: "Capitale sociale", kind: "text" },
    T("hours", "Orari"), { name: "whatsapp", label: "WhatsApp (solo cifre con prefisso)", kind: "text" } ] },
  { name: "numbers", label: "Numeri in home", kind: "group", fields: [{ name: "since", label: "Dal (anno)", kind: "number" }, { name: "plants", label: "Impianti installati", kind: "number" }, { name: "gain", label: "Produttività TIG fino a + (%)", kind: "number" }, { name: "countries", label: "Paesi (usa l'elenco sotto)", kind: "number", help: "Il conteggio mostrato è il numero di Paesi selezionati nell'elenco." }] },
  { name: "countries", label: "Paesi con impianti (mappa)", kind: "multi", rel: "country" },
  { name: "clients", label: "Clienti citabili (solo con permesso)", kind: "list", of: [{ name: "name", label: "Nome", kind: "text" }, { name: "show", label: "Mostra", kind: "bool" }] },
  { name: "timeline", label: "Storia", kind: "list", of: [{ name: "year", label: "Anno", kind: "text" }, T("text", "Testo", "textarea")] },
  { name: "team", label: "Team", kind: "list", of: [{ name: "name", label: "Nome", kind: "text" }, T("role", "Ruolo"), { name: "since", label: "In azienda dal", kind: "number" }, { name: "photo", label: "Foto", kind: "image" }] },
  { name: "fairs", label: "Fiere (attiva solo quelle a cui partecipate)", kind: "list", of: [{ name: "name", label: "Nome", kind: "text" }, { name: "place", label: "Luogo", kind: "text" }, T("dates", "Date"), { name: "url", label: "Link", kind: "text" }, { name: "show", label: "Mostra sul sito", kind: "bool" }] },
  { name: "social", label: "Social", kind: "group", fields: [{ name: "linkedin", label: "LinkedIn (pagina aziendale)", kind: "text" }, { name: "youtube", label: "YouTube", kind: "text" }, { name: "instagram", label: "Instagram", kind: "text" }, { name: "facebook", label: "Facebook", kind: "text" }] },
  { name: "tracking", label: "Tracciamento (si attiva solo dopo il consenso)", kind: "group", fields: [{ name: "ga4", label: "Google Analytics 4 (G-XXXXXXX)", kind: "text" }, { name: "gtm", label: "Google Tag Manager (riservato)", kind: "text" }] },
  { name: "routing", label: "Instradamento richieste", kind: "group", fields: [{ name: "sales", label: "Email commerciale", kind: "text" }, { name: "service", label: "Email assistenza e ricambi", kind: "text" }] },
  { name: "features", label: "Funzioni", kind: "group", fields: [{ name: "pdfGated", label: "Schede PDF dietro registrazione (riservato)", kind: "bool" }] },
];
