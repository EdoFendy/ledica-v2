import { t, im } from "./helpers";

export type TechSeed = {
  slug_it: string; slug_en: string; id: string; name: ReturnType<typeof t>; subtitle: ReturnType<typeof t>; summary: ReturnType<typeof t>;
  body: ReturnType<typeof t>; thickMin: number | null; thickMax: number | null; scope?: ReturnType<typeof t>; materials: ReturnType<typeof t>[];
  faq: { q: ReturnType<typeof t>; a: ReturnType<typeof t> }[]; image: string;
};

/* Struttura fissa di ogni pagina tecnologia: come funziona → dove si usa → risultati dichiarati → quando sceglierla → cosa forniamo. */
export const techs: TechSeed[] = [
  {
    id: "tig-multicatodo", slug_it: "tig-multicatodo", slug_en: "multi-cathode-tig",
    name: t("TIG multicatodo", "Multi-cathode TIG"),
    subtitle: t("Due o tre archi TIG in fila sullo stesso giunto", "Two or three TIG arcs in line on the same joint"),
    summary: t("Il modo più diretto per saldare più velocemente i tubi inox sottili sulla profilatrice che hai già.", "The most direct way to weld thin-wall stainless tube faster on the tube mill you already have."),
    thickMin: 0.5, thickMax: 3.5, image: im("2020_10_TRICATHODE-TORCH-TIG-ON-MILL.jpg")[0],
    body: t(
`## Come funziona
Due o tre elettrodi di tungsteno lavorano in fila sullo stesso giunto. Il primo arco scalda e inizia la fusione, i successivi completano il bagno. La corrente complessiva cresce senza caricare un solo elettrodo, quindi il bagno resta lungo e stabile anche quando la linea accelera.

Ogni torcia si regola in altezza e lateralmente in modo indipendente ed è raffreddata ad acqua. Un campo magnetico controlla la forma dell'arco (deviazione magnetica). Sul terzo elettrodo l'oscillatore d'arco magnetico sposta il bagno avanti e indietro: le inclusioni di gas e le impurità vengono rimosse dal cordone.

## Dove si usa
- Tubi in inox austenitico da 0,5 a 3,5 mm.
- Sopra i 3 mm, torce con primo e terzo elemento regolabili (25–38 mm) per contenere l'onda che si forma nel bagno ad alta corrente.
- Grossi spessori con la torcia monocatodo da 1000 A, anche in key-hole.

## Risultati dichiarati
Fino al **+50%** di produttività sui tubi saldati TIG da 0,8 a 3,00 mm e fino al **+30%** da 3,00 a 12,00 mm.

## Quando sceglierla
- Vuoi più metri al minuto senza cambiare processo.
- La tua linea salda già in TIG e vuoi aggiornarla, non sostituirla.

## Cosa forniamo
Torcia con blocco di connessione per l'impianto esistente, generatori, cofano di comando e messa a punto in linea.`,
`## How it works
Two or three tungsten electrodes work in line on the same joint. The first arc heats and starts melting, the following ones complete the pool. Total current rises without loading a single electrode, so the pool stays long and stable even when the line speeds up.

Each torch adjusts in height and sideways independently and is water-cooled. A magnetic field controls the arc shape (magnetic deviation). On the third electrode the magnetic arc oscillator moves the pool back and forth: gas inclusions and impurities are removed from the bead.

## Where it is used
- Austenitic stainless tube from 0.5 to 3.5 mm.
- Above 3 mm, torches with adjustable first and third elements (25–38 mm) to contain the wave that forms in the pool at high current.
- Heavy walls with the 1000 A single-cathode torch, key-hole included.

## Declared results
Up to **+50%** productivity on TIG-welded tube from 0.8 to 3.00 mm and up to **+30%** from 3.00 to 12.00 mm.

## When to choose it
- You want more metres per minute without changing process.
- Your line already welds TIG and you want to upgrade it, not replace it.

## What we supply
Torch with connection block for the existing plant, power sources, control cabinet and in-line commissioning.`),
    materials: [t("Inox austenitico", "Austenitic stainless"), t("Super austenitico (904L)", "Super austenitic (904L)"), t("Alluminio (AC) e rame", "Aluminium (AC) and copper")],
    faq: [
      { q: t("Si può montare su una profilatrice di un altro costruttore?", "Can it be fitted to another maker's tube mill?"), a: t("Sì. Le torce tricatodo arrivano con un blocco di connessione pensato per impianti esistenti. Indicaci marca e modello della linea nella richiesta.", "Yes. Tri-cathode torches come with a connection block designed for existing plants. Give us the make and model of your line in the request.") },
      { q: t("Quanta velocità si guadagna?", "How much speed is gained?"), a: t("Dipende da materiale, spessore e configurazione. Un riferimento: con preriscaldo plasma SP3 e tricatodo su AISI serie 300 circa 8,5 m/min a 1 mm, 4,5 a 2 mm, 2,5 a 3 mm.", "It depends on material, thickness and configuration. As a reference: with SP3 plasma pre-heat and tri-cathode on AISI 300 series about 8.5 m/min at 1 mm, 4.5 at 2 mm, 2.5 at 3 mm.") },
    ],
  },
  {
    id: "plasma-key-hole", slug_it: "plasma-key-hole", slug_en: "plasma-keyhole",
    name: t("Plasma key-hole", "Plasma key-hole"),
    subtitle: t("L'intero spessore saldato in una sola passata", "The full wall welded in a single pass"),
    summary: t("Per i tubi a parete spessa: il plasma fora il giunto e lo salda in una passata, da 3,5 a 10 mm e fino a 12 mm nelle forniture dichiarate.", "For heavy-wall tube: the plasma pierces the joint and welds it in one pass, from 3.5 to 10 mm and up to 12 mm on declared supplies."),
    thickMin: 3.5, thickMax: 12, image: im("2020_10_TRICATHODE-PLASMA-PLASMA-TIG-TORCH-MAGNETIC-ARC-OSCILLATOR-LASER-SENSOR-TRACKER-COLD-WIRE-FEEDER-scaled.jpg")[0],
    body: t(
`## Come funziona
La colonna di plasma è abbastanza concentrata da attraversare tutta la parete: si apre un piccolo foro, il key-hole, che avanza con il giunto. Il metallo fuso scorre dietro il foro e lo richiude. Il risultato è una saldatura a piena penetrazione in un solo passaggio, senza riempire il giunto a più riprese.

Dietro il plasma lavora una torcia TIG con oscillatore d'arco magnetico: distribuisce il cordone, chiude le incisioni e rimuove le inclusioni dal bagno.

## Dove si usa
- Torcia TIG-plasma-TIG: da 3,5 a 10 mm testa a testa.
- Torcia plasma-plasma-TIG: fino a 10 mm di catalogo, con filo freddo e segui-giunto laser.
- Tubi ASTM A358 classi 1, 2 e 5 per oleodotti, Ø 160–505 mm: fino a 12 mm in una passata, insieme alla ripresa interna con telecamera.

## Quando sceglierla
- Saldi pareti oltre 3,5 mm e oggi ti servono più passate.
- Il giunto deve essere omogeneo e privo di inclusioni.
- Vuoi saldare esterno e interno in contemporanea.

## Cosa forniamo
Torcia, generatori, cofano di comando e, se serve, ripresa interna con telecamera e filo freddo.`,
`## How it works
The plasma column is concentrated enough to go through the full wall: a small hole opens, the key-hole, and travels with the joint. Molten metal flows behind the hole and closes it. The result is a full-penetration weld in a single pass, without multi-pass filling.

Behind the plasma, a TIG torch with magnetic arc oscillator spreads the bead, closes undercut and removes inclusions from the pool.

## Where it is used
- TIG-plasma-TIG torch: 3.5 to 10 mm butt welds.
- Plasma-plasma-TIG torch: up to 10 mm catalogue, with cold wire and laser seam tracker.
- ASTM A358 classes 1, 2 and 5 pipeline tube, Ø 160–505 mm: up to 12 mm in one pass, together with camera-equipped ID welding.

## When to choose it
- You weld walls above 3.5 mm and currently need several passes.
- The joint must be homogeneous and inclusion-free.
- You want to weld outside and inside at the same time.

## What we supply
Torch, power sources, control cabinet and, if needed, ID welding with camera and cold wire.`),
    materials: [t("Inox austenitico", "Austenitic stainless"), t("Tubi ASTM A358 classi 1, 2, 5", "ASTM A358 classes 1, 2, 5 tube")],
    faq: [
      { q: t("Fino a quale spessore arriva?", "How thick can it weld?"), a: t("10 mm in una passata come dato di catalogo; 12 mm nelle forniture per tubi ASTM A358 per oleodotti.", "10 mm in one pass as catalogue data; 12 mm on supplies for ASTM A358 pipeline tube.") },
      { q: t("Serve anche la ripresa interna?", "Is ID welding needed as well?"), a: t("Per i tubi destinati agli oleodotti la usiamo sempre: la torcia interna con telecamera rifonde il cordone e permette di controllarlo durante la produzione.", "For pipeline tube we always use it: the camera-equipped inside torch re-melts the bead and lets you check it during production.") },
    ],
  },
  {
    id: "combo-plasma-tig", slug_it: "combo-plasma-tig", slug_en: "combo-plasma-tig",
    name: t("Combo plasma + TIG", "Plasma + TIG combo"),
    subtitle: t("Il plasma prepara il giunto, i TIG lo saldano", "The plasma prepares the joint, the TIGs weld it"),
    summary: t("Il plasma SP3 davanti ai TIG porta fino al +40% di produzione su inox e dimezza i fermi per manutenzione.", "SP3 plasma ahead of the TIGs brings up to +40% stainless output and halves maintenance stops."),
    thickMin: 0.5, thickMax: 10, image: im("2020_10_PLASMA-TIG-STX.jpg")[0],
    body: t(
`## Come funziona
Una torcia plasma SP3 lavora davanti alle torce TIG. Scalda i lembi e brucia lo sporco della superficie prima che arrivi agli elettrodi. I TIG trovano un giunto pulito e già in temperatura: possono saldare più velocemente e gli elettrodi si consumano meno, quindi la linea si ferma meno spesso per rifarli.

## Configurazioni
- **SP3 + TIG STX 600 A**: per inox e titanio.
- **SP3 + bicatodo TIG-TIG**: fino al +40% rispetto alla sola bicatodo.
- **SP3 + tricatodo TIG-TIG-TIG**: fino al +40% rispetto alla sola tricatodo, con oscillazione magnetica del terzo arco.
- **Sistema combo TTT/TPT**: un impianto con due torce intercambiabili, da 0,5 a 10 mm, cambio torcia in circa 15 minuti.

## Risultati dichiarati
Su AISI serie 300 con SP3 + tricatodo: circa **8,5 m/min** a 1 mm, **4,5 m/min** a 2 mm, **2,5 m/min** a 3 mm. Fermi per manutenzione dimezzati.

## Quando sceglierla
- La linea è già multicatodo e vuoi l'ultimo salto di velocità.
- Gli elettrodi si sporcano e i fermi pesano sulla produzione.
- Produci spessori molto diversi sulla stessa linea (sistema combo).`,
`## How it works
An SP3 plasma torch works ahead of the TIG torches. It heats the edges and burns off surface dirt before it reaches the electrodes. The TIGs find a clean joint already at temperature: they can weld faster and the electrodes wear less, so the line stops less often to redress them.

## Configurations
- **SP3 + STX 600 A TIG**: for stainless and titanium.
- **SP3 + TIG-TIG bi-cathode**: up to +40% versus bi-cathode alone.
- **SP3 + TIG-TIG-TIG tri-cathode**: up to +40% versus tri-cathode alone, with magnetic oscillation of the third arc.
- **TTT/TPT combo system**: one plant with two interchangeable torches, 0.5 to 10 mm, torch change in about 15 minutes.

## Declared results
On AISI 300 series with SP3 + tri-cathode: about **8.5 m/min** at 1 mm, **4.5 m/min** at 2 mm, **2.5 m/min** at 3 mm. Maintenance stops halved.

## When to choose it
- Your line is already multi-cathode and you want the last step in speed.
- Electrodes get dirty and stops weigh on output.
- You run very different thicknesses on the same line (combo system).`),
    materials: [t("Inox AISI serie 300", "AISI 300 series stainless"), t("Titanio", "Titanium")],
    faq: [
      { q: t("Il +40% vale per ogni spessore?", "Does the +40% apply to every thickness?"), a: t("È dichiarato soprattutto per inox da 0,5 a 3,00 mm. Per spessori e materiali diversi lo verifichiamo con una prova.", "It is declared mainly for stainless from 0.5 to 3.00 mm. For other thicknesses and materials we check it with a test.") },
      { q: t("Si aggiunge a una tricatodo che ho già?", "Can it be added to a tri-cathode I already own?"), a: t("È la configurazione SP3 + tricatodo: indicaci modello e anno della torcia installata e valutiamo il retrofit.", "That is the SP3 + tri-cathode configuration: tell us the model and year of the installed torch and we assess the retrofit.") },
    ],
  },
  {
    id: "laser-fibra", slug_it: "laser-fibra", slug_en: "fibre-laser",
    name: t("Laser fibra", "Fibre laser"),
    subtitle: t("Sottile e ripetitivo: più veloce del TIG", "Thin and repetitive: faster than TIG"),
    summary: t("Sugli spessori sottili il laser salda più veloce del TIG e non ha elettrodi da sostituire: +30% su profilatrice, velocità doppia su tavola rotante.", "On thin walls laser welds faster than TIG with no electrodes to replace: +30% on a tube mill, double speed on a rotary table."),
    thickMin: 0.2, thickMax: 1.8, image: im("2024_06_ledica-impianto-con-saldatura-laser-2.avif")[0],
    body: t(
`## Come funziona
Il laser a fibra concentra la potenza su un punto molto piccolo. Il giunto fonde in profondità con poco calore trasmesso al resto del pezzo e a velocità elevate. Non ci sono elettrodi da consumare; in cambio il laser chiede lembi ben accoppiati.

## Dove si usa
- **Profilatrice**: laser da 2000 W con testa automatica e visione dell'arco, spessori da 0,2 a 0,5 mm.
- **Tavola rotante**: pezzi curvi, come le curve per canne fumarie in acciaio al carbonio da 1,8 mm.
- **Manuale**: saldatura, saldatura con filo, taglio e pulizia per erosione laser su inox, ferro e alluminio.

## Risultati dichiarati
- **+30%** di velocità rispetto al TIG su profilatrice, 0,2–0,5 mm.
- **Velocità doppia** rispetto al TIG su tavola rotante: commessa consegnata in 15 giorni invece di oltre un mese.
- Pezzi difettosi per errato accoppiamento dei lembi risaldabili: scarti azzerati.

## Laser o TIG
Il laser conviene sul sottile e sulle produzioni ripetitive. Il TIG multicatodo tollera meglio una preparazione dei lembi meno precisa e copre spessori maggiori. Costruiamo entrambe le soluzioni: la scelta si fa dopo una prova sul tuo materiale.`,
`## How it works
A fibre laser concentrates power on a very small spot. The joint melts deeply with little heat passed to the rest of the part and at high speed. There are no electrodes to wear; in return laser needs well-fitted edges.

## Where it is used
- **Tube mill**: 2000 W laser with automatic head and weld-arc vision, walls from 0.2 to 0.5 mm.
- **Rotary table**: curved parts, such as 1.8 mm carbon-steel flue bends.
- **Manual**: welding, wire welding, cutting and cleaning by laser ablation on stainless, iron and aluminium.

## Declared results
- **+30%** speed versus TIG on a tube mill, 0.2–0.5 mm.
- **Double speed** versus TIG on a rotary table: order delivered in 15 days instead of over a month.
- Parts faulty from poor edge fit can be re-welded: scrap eliminated.

## Laser or TIG
Laser pays off on thin wall and repetitive runs. Multi-cathode TIG tolerates less precise edge preparation and covers heavier walls. We build both: the choice is made after a test on your material.`),
    materials: [t("Inox", "Stainless"), t("Acciaio al carbonio", "Carbon steel"), t("Alluminio", "Aluminium")],
    faq: [{ q: t("Laser o TIG multicatodo: come si decide?", "Laser or multi-cathode TIG: how is it decided?"), a: t("Contano spessore, preparazione dei lembi, materiale e volumi. Con un campione del tuo nastro ti indichiamo quale delle due conviene.", "Thickness, edge preparation, material and volumes all count. With a sample of your strip we tell you which of the two pays off.") }],
  },
  {
    id: "ripresa-interna", slug_it: "ripresa-interna", slug_en: "id-welding",
    name: t("Ripresa interna (ID welding)", "Inside-diameter welding (ID)"),
    subtitle: t("Il cordone interno rifuso in linea, senza laminatoio", "The inside bead re-melted in line, no rolling mill"),
    summary: t("Torce TIG che lavorano dentro il tubo, da Ø 65 mm, per rifondere e uniformare il cordone interno mentre la linea produce.", "TIG torches working inside the tube, from Ø 65 mm, to re-melt and even out the inside bead while the line runs."),
    thickMin: null, thickMax: null, scope: t("Ø interno da 65 mm", "Inside Ø from 65 mm"), image: im("2020_10_ID-TIG-TORCH-MAGNETIC-ARC-OSCILLATOR-INSIDE-THE-TUBE-e1616167055802.jpg")[0],
    body: t(
`## Il problema
Quando si salda il tubo dall'esterno, all'interno si forma un cordone in rilievo. In molte applicazioni va schiacciato con un laminatoio o rimosso con una lavorazione meccanica. È un passaggio in più, e nei tubi per applicazioni critiche è proprio il cordone interno a decidere la qualità.

## Come funziona
Una torcia TIG montata su un braccio entra nel tubo e lavora sul cordone appena formato. L'oscillatore d'arco magnetico lo distribuisce e lo appiattisce, quindi il laminatoio non serve. Nelle versioni per tubi grandi il controllo della tensione d'arco tiene costante la distanza dal pezzo, il filo freddo aggiunge materiale e una telecamera mostra il giunto all'operatore in tempo reale.

## Gamma
- **Ø 65 mm**: ripresa in linea su profilatrice.
- **Ø 160 mm**: grossi tubi, movimentazione motorizzata, telecamera e filo freddo.
- **Bicatodo 2 × 600 A**: per il grosso spessore, montaggio su trave.

## Dove è già in produzione
Impianti per tubi ASTM A358 destinati a oleodotti in Arabia Saudita, India, Turchia ed Emirati Arabi, insieme al plasma key-hole esterno.`,
`## The problem
When tube is welded from the outside, a raised bead forms on the inside. In many applications it must be flattened with a rolling mill or removed by machining. It is an extra step, and in tube for critical applications the inside bead is exactly what decides quality.

## How it works
A TIG torch on an arm goes inside the tube and works on the freshly formed bead. The magnetic arc oscillator spreads and flattens it, so no rolling mill is needed. In the large-tube versions arc-voltage control keeps the distance to the part constant, cold wire adds material and a camera shows the joint to the operator in real time.

## Range
- **Ø 65 mm**: in-line re-welding on a tube mill.
- **Ø 160 mm**: large tube, motorised travel, camera and cold wire.
- **2 × 600 A bi-cathode**: for heavy wall, beam mounting.

## Already in production
Plants for ASTM A358 pipeline tube in Saudi Arabia, India, Turkey and the UAE, together with external plasma key-hole.`),
    materials: [t("Inox", "Stainless"), t("Tubi ASTM A358", "ASTM A358 tube")],
    faq: [{ q: t("Qual è il diametro minimo?", "What is the minimum diameter?"), a: t("65 mm di diametro interno con la torcia compatta, 160 mm con quella per i tubi grandi.", "65 mm inside diameter with the compact torch, 160 mm with the large-tube one.") }],
  },
  {
    id: "generatori-accessori", slug_it: "generatori-quadri-accessori", slug_en: "power-sources-accessories",
    name: t("Generatori, quadri e accessori", "Power sources, controls and accessories"),
    subtitle: t("Tutto ciò che sta intorno alla torcia", "Everything around the torch"),
    summary: t("Generatore PULSEWELD 15K22, cofani di comando e accessori di processo: progettati insieme alle torce, sulla tua linea.", "PULSEWELD 15K22 power source, control cabinets and process accessories: engineered together with the torches, on your line."),
    thickMin: null, thickMax: null, scope: t("Per tutti i processi", "For every process"), image: im("2023_07_LEDICA-PULSEWELD-15K22-15KHZ-500-AMP-100--scaled.jpg")[0],
    body: t(
`## Generatore PULSEWELD 15K22
500 A al 100% di utilizzo con arco pulsato a 15 kHz. La pulsazione ad alta frequenza restringe l'arco: a parità di corrente penetra di più e scalda meno il materiale intorno. Il cordone interno risulta più liscio, con irregolarità sotto il 10% dello spessore. Su acciaio AISI 904L il cliente ha misurato un cordone interno spesso quasi assente e meno scarti.

## Cofani di comando
Un pannello per ogni processo (TIG multicatodo, plasma, combo) da cui l'operatore regola l'intera stazione di saldatura.

## Accessori di processo
- **Oscillatore d'arco magnetico**: muove il bagno, rimuove inclusioni e incisioni.
- **Miscelatore argon-idrogeno**: fino a 100 l/min, idrogeno dall'1 al 10%.
- **Gruppo slitta 3 assi**: corse 150/150/100 mm per centrare la torcia.
- **Apporto filo freddo**: materiale di riempimento sui grossi spessori.`,
`## PULSEWELD 15K22 power source
500 A at 100% duty with a 15 kHz pulsed arc. High-frequency pulsing narrows the arc: at equal current it penetrates more and heats the surrounding material less. The inside bead is smoother, with irregularity under 10% of wall. On AISI 904L steel the customer measured an inside bead often almost absent and less scrap.

## Control cabinets
One panel per process (multi-cathode TIG, plasma, combo) from which the operator sets the whole welding station.

## Process accessories
- **Magnetic arc oscillator**: moves the pool, removes inclusions and undercut.
- **Argon-hydrogen mixer**: up to 100 l/min, hydrogen from 1 to 10%.
- **3-axis slide unit**: 150/150/100 mm travel to centre the torch.
- **Cold wire feed**: filler material on heavy walls.`),
    materials: [t("Tutti i materiali dei processi LE.DI.CA.", "All materials of LE.DI.CA. processes")],
    faq: [],
  },
];
