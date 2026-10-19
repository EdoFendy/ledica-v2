# DESIGN — LE.DI.CA. (precisione industriale)

**Idea.** Un banco di misura. Il sito ragiona in millimetri: il righello dello spessore (0,2–12 mm) è la spina dorsale della home e delle pagine tecnologia, e ogni tecnologia è una barra su quella scala.

## Colore (dal logo ufficiale: leone verde su grigio antracite)
| Token | Valore | Uso |
|---|---|---|
| `--ink` | #161816 | grafite neutro: hero, casi studio, footer, intestazioni |
| `--paper` / `--paper-2` | #F5F5F0 / #E9EAE2 | carta tecnica: lettura, tabelle |
| `--arc-btn` / `--arc` / `--arc-ink` / `--arc-soft` | #3F7A28 / #62B23C / #2F6A1C / #8FD467 | verde del marchio: azioni, link, sezione drenched. `arc-ink` per testo su carta (AA), `arc-soft` su scuro |
| `--glow` | #9CC4FF | blu-bianco dell'arco di saldatura: solo cursore del righello, archi 3D e SVG |
| `--heat` / `--heat-ink` | #FF7A1A / #B94A05 | arancio: solo numeri di prestazione e badge «novità» |
Strategia: Restrained + due blocchi Drenched in verde (sezione marchio, banda CTA). Il logo ufficiale non si altera mai: sta su targhetta chiara (header, footer, azienda).

## Tipografia
Archivo variabile (asse larghezza): titoli a 78–88% di larghezza, peso 700–800; testo al 100%. JetBrains Mono per ampere, mm, kHz, date, cifre in evidenza (`tabular-nums`, zero barrato). Mai maiuscolo integrale.

## Componenti firma
- **Scena 3D hero** (`WeldScene`, three.js): tubo inox, torcia, archi e scintille; il righello cambia spessore di parete e processo (laser / tricatodo / plasma key-hole).
- **Leone del marchio** (`LionArt`): silhouette tracciata dal logo ufficiale; l'arco la disegna e poi la riempie.
- **Diagrammi animati** (`TechDiagram`): uno per tecnologia, SVG + CSS.
- **Mappa rotte** (`WorldMap`): consegne da Rozzano.
- **Righello** (`Ruler`): cursore trascinabile / tastiera, barre per tecnologia, risposta con link. Entra una volta da 12 mm a 2 mm.
- **Riga tecnologia**: titolo, riassunto, mini-scala con la stessa scala 0–12.
- **Tabella dati**: stesse righe e unità per tutte le schede, valori in mono.
- **Numero caso studio**: arancio mono, grande, una sola cifra per caso.
- **Angoli di mira** sulla foto hero (riferimento a inquadratura/ottica).

## Regole
Niente eyebrow, niente card icona+titolo+testo, niente gradient text, niente barre %. Foto reali su piastra bianca (prodotti) o a tutto riquadro (impianti). Motion: un momento (cursore), reveal CSS progressivi, `prefers-reduced-motion` rispettato. Rifiuta e Accetta cookie con lo stesso peso visivo.
