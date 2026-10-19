# LE.DI.CA. — sito + pannello admin

Next.js 16 · SQLite (un solo file) · IT alla radice, EN in `/en/` · admin su `/admin`.

## Avvio
```bash
npm install
cp .env.example .env.local     # cambia ADMIN_PASSWORD e SESSION_SECRET
npm run seed                   # popola il DB dal vecchio ledica.it (solo la prima volta; --force riparte da zero)
npm run dev                    # http://localhost:3000  ·  admin: /admin
npm run build && npm start     # produzione
```
Produzione: serve un server con disco persistente (VPS, Fly, Railway, Docker). `Dockerfile` incluso, volume `/data`.
Backup = copiare la cartella `data/` (database + media + allegati delle richieste).

## Cosa c'è
| Area | Dove |
|---|---|
| Home con righello spessore → tecnologia, 6 tecnologie, 24 schede prodotto, 8 casi studio, 4 applicazioni, news, azienda, assistenza, contatti, RFQ a 4 passi | pubblico |
| Schede PDF stampabili da dati prodotto | `/scheda/it/<slug>` |
| Richieste (RFQ) con stato, note, allegati, export CSV, email di notifica (SMTP opzionale) | `/admin/leads` |
| Editor schema-driven IT/EN per tutti i contenuti, anteprima bozze, duplica, cambio slug con 301 automatico | `/admin/content/*` |
| Libreria media con alt IT/EN e flag «foto provvisoria» | `/admin/media` |
| Redirect 301/302/410 (146 già caricati dal vecchio sito) | `/admin/redirects` |
| Dati societari, numeri home, clienti, team, fiere, social, GA4 | `/admin/settings` |
| Checklist «da chiedere al cliente» (dall'audit) | `/admin/todo` |
| sitemap.xml con hreflang, robots, JSON-LD (Organization, Product, Article, FAQ, Breadcrumb), cookie banner conforme, GA4 solo dopo consenso, YouTube solo al clic | automatico |

## Struttura
- `src/lib/` dati, routing IT/EN (`routes.ts`), dizionario UI (`dict.ts`)
- `src/views/` pagine pubbliche · `src/components/` UI · `src/admin/` editor e azioni
- `scripts/data/` contenuti seed (IT + EN) · `seed/media/` immagini originali del vecchio sito
- Design: `PRODUCT.md`, `DESIGN.md`

## Da fare prima del lancio
Vedi `/admin/todo`: dati tecnici contraddittori, PEC/REA, foto nuove, logo vettoriale, consenso a citare i clienti, revisione EN, privacy/cookie da validare.
