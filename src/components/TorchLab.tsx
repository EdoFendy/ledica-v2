import { HeroStage } from "./HeroStage";
import { ProcessScene, type ProcessText } from "./ProcessScene";
import type { ProcessKey } from "./world/processWorld";
import type { Lane } from "./Ruler";
import type { SceneLabels } from "./WeldScene";
import { Img } from "./Img";
import { L } from "./Bits";
import { dict } from "@/lib/dict";
import type { Lang } from "@/lib/types";

const sceneLabels = (lang: Lang): SceneLabels => ({
  laser: L(lang, "Laser fibra · fascio focalizzato", "Fibre laser · focused beam"),
  combo: L(lang, "Combo plasma + TIG-TIG · tre archi in linea", "Plasma + TIG-TIG combo · three arcs in line"),
  keyhole: L(lang, "Plasma-plasma-TIG · filo freddo e segui-giunto", "Plasma-plasma-TIG · cold wire and seam tracker"),
  wall: L(lang, "parete", "wall"),
  drag: L(lang, "Trascina per ruotare · pizzica per lo zoom", "Drag to rotate · pinch to zoom"),
});
const caption = (lang: Lang) => L(lang, "torce LE.DI.CA. ricostruite in 3D", "LE.DI.CA. torches rebuilt in 3D");
const poster = (lang: Lang) => <Img src="tricathode-torch-tig-on-mill.jpg" lang={lang} sizes="(min-width: 980px) 45vw, 100vw" alt="Torcia tricatodo TIG su profilatrice" />;

/** Righello + card 3D (home e pagina tecnologie). */
export function TorchLab({ lang, lanes }: { lang: Lang; lanes: Lane[] }) {
  const t = dict(lang);
  return (
    <section className="hero lab">
      <HeroStage lanes={lanes} lang={lang} labels={sceneLabels(lang)} caption={caption(lang)} photo={poster(lang)}
        text={{ title: t.ruler_title, hint: t.ruler_hint, covers: t.ruler_covers, none: t.ruler_none, see: t.ruler_see }} />
    </section>
  );
}

type T2 = [string, string];
const PROCESS: Record<ProcessKey, { steps: [T2, T2][]; tags: Record<string, T2>; schematic?: boolean; wave?: T2 }> = {
  "laser-fibra": {
    steps: [
      [["Il fascio", "The beam"], ["Il laser a fibra concentra la potenza su un punto molto piccolo.", "A fibre laser concentrates power on a very small spot."]],
      [["La sezione", "The section"], ["Il giunto fonde in profondità, con poco calore trasmesso al resto del tubo.", "The joint melts deeply, with little heat passed to the rest of the tube."]],
      [["In linea", "On the line"], ["Niente elettrodi da sostituire: +30% di velocità rispetto al TIG su profilatrice, da 0,2 a 0,5 mm.", "No electrodes to replace: +30% speed over TIG on a tube mill, 0.2 to 0.5 mm."]],
    ],
    tags: { beam: ["fascio laser", "laser beam"], fusion: ["zona fusa stretta e profonda", "narrow, deep fusion zone"], haz: ["poco calore intorno", "little heat around"], speed: ["+30% rispetto al TIG", "+30% vs TIG"] },
  },
  "tig-multicatodo": {
    schematic: true,
    steps: [
      [["Il primo arco", "The first arc"], ["Il primo elettrodo scalda il giunto e inizia la fusione.", "The first electrode heats the joint and starts melting."]],
      [["Il bagno", "The pool"], ["Gli archi successivi completano il bagno: la corrente cresce senza caricare un solo elettrodo e il bagno resta lungo e stabile.", "The following arcs complete the pool: current rises without loading a single electrode and the pool stays long and steady."]],
      [["L'oscillatore", "The oscillator"], ["Sul terzo elettrodo l'oscillatore d'arco magnetico muove il bagno e rimuove inclusioni e impurità.", "On the third electrode the magnetic arc oscillator moves the pool and removes inclusions and impurities."]],
    ],
    tags: { arc1: ["1° arco: inizio fusione", "1st arc: melting starts"], pool: ["bagno lungo e stabile", "long, steady pool"], osc: ["oscillatore d'arco magnetico", "magnetic arc oscillator"], fusion: ["sezione del cordone", "bead section"] },
  },
  "combo-plasma-tig": {
    steps: [
      [["Il plasma davanti", "Plasma ahead"], ["La torcia plasma lavora davanti ai TIG: scalda i lembi e brucia lo sporco della superficie.", "The plasma torch works ahead of the TIGs: it heats the edges and burns off surface dirt."]],
      [["I TIG dietro", "TIGs behind"], ["I TIG trovano un giunto pulito e già in temperatura: saldano più velocemente e gli elettrodi si consumano meno.", "The TIGs find a clean joint already at temperature: they weld faster and the electrodes wear less."]],
      [["Il risultato", "The result"], ["Fino al +40% di produzione su inox e fermi per manutenzione dimezzati.", "Up to +40% stainless output and maintenance stops halved."]],
    ],
    tags: { plasma: ["plasma: preriscaldo", "plasma: pre-heat"], dirt: ["sporco sui lembi", "dirt on the edges"], clean: ["giunto pulito e caldo", "clean, hot joint"], wear: ["elettrodi che durano di più", "longer-lasting electrodes"], fusion: ["sezione del cordone", "bead section"] },
  },
  "plasma-key-hole": {
    steps: [
      [["Il key-hole", "The key-hole"], ["La colonna di plasma attraversa tutta la parete: si apre un piccolo foro che avanza con il giunto.", "The plasma column crosses the whole wall: a small hole opens and travels with the joint."]],
      [["Il TIG", "The TIG"], ["Dietro il plasma, il TIG con oscillatore d'arco distribuisce il cordone, chiude le incisioni e rimuove le inclusioni.", "Behind the plasma, the TIG with arc oscillator spreads the bead, closes undercut and removes inclusions."]],
      [["Una passata", "One pass"], ["Il metallo fuso richiude il foro: piena penetrazione in un solo passaggio.", "The molten metal closes the hole: full penetration in a single pass."]],
    ],
    tags: { keyhole: ["key-hole attraverso la parete", "key-hole through the wall"], tig: ["TIG con oscillatore", "TIG with oscillator"], fusion: ["piena penetrazione", "full penetration"], onepass: ["una sola passata", "single pass"] },
  },
  "generatori-accessori": {
    schematic: true, wave: ["corrente pulsata 15 kHz", "15 kHz pulsed current"],
    steps: [
      [["Stessa corrente, due archi", "Same current, two arcs"], ["A sinistra corrente continua, a destra il PULSEWELD 15K22 con arco pulsato a 15 kHz: 500 A al 100% di utilizzo.", "Left, steady current; right, the PULSEWELD 15K22 with a 15 kHz pulsed arc: 500 A at 100% duty."]],
      [["Più penetrazione, meno calore", "More penetration, less heat"], ["La pulsazione ad alta frequenza restringe l'arco: a parità di corrente penetra di più e scalda meno il materiale intorno.", "High-frequency pulsing narrows the arc: at equal current it penetrates more and heats the surrounding metal less."]],
      [["Cordone interno liscio", "Smooth inside bead"], ["All'interno del tubo il cordone risulta più liscio, con irregolarità sotto il 10% dello spessore.", "Inside the tube the bead comes out smoother, with irregularities below 10% of the wall."]],
    ],
    tags: { dc: ["corrente continua: arco largo", "steady current: wide arc"], pk: ["15 kHz: arco concentrato", "15 kHz: concentrated arc"], amp: ["PULSEWELD 15K22 · 500 A al 100%", "PULSEWELD 15K22 · 500 A at 100%"],
      haz: ["più calore nel materiale intorno", "more heat in the surrounding metal"], pen: ["più penetrazione a parità di corrente", "more penetration at equal current"], root: ["irregolarità < 10% dello spessore", "irregularities < 10% of the wall"] },
  },
  "ripresa-interna": {
    schematic: true,
    steps: [
      [["Dall'esterno", "From outside"], ["La saldatura esterna lascia all'interno del tubo un cordone in rilievo.", "The outside weld leaves a raised bead inside the tube."]],
      [["La torcia interna", "The inside torch"], ["Una torcia TIG montata su un braccio entra nel tubo e lavora sul cordone appena formato.", "A TIG torch on a boom enters the tube and works on the freshly formed bead."]],
      [["Cordone piatto", "Flat bead"], ["L'oscillatore d'arco lo distribuisce e lo appiattisce: il laminatoio non serve.", "The arc oscillator spreads and flattens it: no rolling mill needed."]],
    ],
    tags: { outside: ["saldatura esterna", "outside weld"], relief: ["cordone interno in rilievo", "raised inside bead"], inner: ["torcia TIG interna", "inside TIG torch"], flat: ["cordone interno appiattito", "flattened inside bead"], fusion: ["sezione", "section"] },
  },
};

/** Spaccato 3D del processo nella scheda di una tecnologia; null se la tecnologia non ha un processo da mostrare. */
export function TechProcess({ lang, tech }: { lang: Lang; tech: string }) {
  const p = PROCESS[tech as ProcessKey];
  if (!p) return null;
  const tx = ([it, en]: T2) => (lang === "it" ? it : en);
  const text: ProcessText = {
    steps: p.steps.map(([title, body]) => ({ title: tx(title), text: tx(body) })),
    tags: Object.fromEntries(Object.entries(p.tags).map(([k, v]) => [k, tx(v)])),
    drag: L(lang, "Trascina per ruotare", "Drag to rotate"),
    wave: p.wave && tx(p.wave),
    caption: p.schematic ? L(lang, "illustrazione con torce TIG LE.DI.CA.", "illustration with LE.DI.CA. TIG torches") : L(lang, "torcia LE.DI.CA. ricostruita in 3D · spaccato", "LE.DI.CA. torch rebuilt in 3D · cutaway"),
  };
  return (
    <section className="sec-s dark proc-sec"><div className="wrap">
      <p className="mono muted lab-solo-k">{L(lang, "Come funziona · spaccato 3D in tre passi", "How it works · 3D cutaway in three steps")}</p>
      <ProcessScene tech={tech as ProcessKey} text={text} />
    </div></section>
  );
}
