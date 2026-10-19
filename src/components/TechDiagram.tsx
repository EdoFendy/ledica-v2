import type { Lang } from "@/lib/types";

/** Diagrammi esplicativi animati (SVG + CSS, nessun JS). Illustrazioni schematiche: i numeri citati sono quelli dichiarati nelle schede. */
const TXT = {
  it: {
    schem: "illustrazione schematica", travel: "avanzamento tubo", wall: "parete", e1: "1° elettrodo", e2: "2° elettrodo", e3: "3° elettrodo + oscillatore", pool: "bagno di fusione", bead: "cordone",
    multi: "Più archi in sequenza: ogni elettrodo porta meno corrente e il bagno è più stabile.", kh: "key-hole", plasma: "plasma", tig: "TIG", jet: "il plasma fora la giunzione", onepass: "una sola passata", smooth: "il TIG e l'oscillatore spalmano il cordone",
    clean: "pulizia dei lembi", weld: "saldatura TIG", dirt: "sporco", sp3: "plasma SP3 di preriscaldo", combo: "Il plasma elimina lo sporco prima del TIG: meno fermi per rifare gli elettrodi.",
    race: "Stessa commessa, tempi diversi", tigL: "TIG", laserL: "Laser", l1: "+30% su profilatrice, 0,2–0,5 mm", l2: "2× su tavola rotante, 1,8 mm", beam: "fascio laser",
    idTitle: "Vista in sezione del tubo", cam: "telecamera", wire: "filo freddo", osc: "oscillatore d'arco", inner: "torcia interna", outer: "saldatura esterna", rebead: "cordone interno rifuso",
    pulse: "Corrente pulsata 15 kHz", steady: "corrente continua", dc: "arco largo", pk: "arco concentrato 15 kHz", pen: "più penetrazione a parità di corrente", amp: "500 A al 100%",
  },
  en: {
    schem: "schematic illustration", travel: "tube travel", wall: "wall", e1: "1st electrode", e2: "2nd electrode", e3: "3rd electrode + oscillator", pool: "weld pool", bead: "bead",
    multi: "Several arcs in sequence: each electrode carries less current and the pool is steadier.", kh: "key-hole", plasma: "plasma", tig: "TIG", jet: "the plasma pierces the joint", onepass: "single pass", smooth: "TIG and oscillator smooth the bead",
    clean: "edge cleaning", weld: "TIG welding", dirt: "dirt", sp3: "SP3 plasma pre-heat", combo: "The plasma clears dirt before the TIG: fewer stops to redress electrodes.",
    race: "Same order, different lead time", tigL: "TIG", laserL: "Laser", l1: "+30% on a tube mill, 0.2–0.5 mm", l2: "2× on a rotary table, 1.8 mm", beam: "laser beam",
    idTitle: "Tube cross-section", cam: "camera", wire: "cold wire", osc: "arc oscillator", inner: "inside torch", outer: "outside weld", rebead: "re-melted inside bead",
    pulse: "15 kHz pulsed current", steady: "steady current", dc: "wide arc", pk: "15 kHz concentrated arc", pen: "more penetration at equal current", amp: "500 A at 100%",
  },
};
type Tx = Record<keyof (typeof TXT)["it"], string>;

const Defs = () => (
  <defs>
    <linearGradient id="d-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6eaec" /><stop offset=".5" stopColor="#aab1b7" /><stop offset="1" stopColor="#6f777e" /></linearGradient>
    <linearGradient id="d-steel-s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#59616a" /><stop offset="1" stopColor="#8e969d" /></linearGradient>
    <linearGradient id="d-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a6168" /><stop offset=".45" stopColor="#d3d8dc" /><stop offset="1" stopColor="#6d747b" /></linearGradient>
    <linearGradient id="d-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6a24" /><stop offset=".5" stopColor="#e8c869" /><stop offset="1" stopColor="#8a6a24" /></linearGradient>
    <linearGradient id="d-cer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b57774" /><stop offset=".5" stopColor="#f0bdbb" /><stop offset="1" stopColor="#b57774" /></linearGradient>
    <linearGradient id="d-arc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dbe9ff" stopOpacity=".95" /><stop offset="1" stopColor="#6f9dff" stopOpacity=".1" /></linearGradient>
    <linearGradient id="d-heat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff5a10" stopOpacity="0" /><stop offset=".6" stopColor="#ff6a14" stopOpacity=".7" /><stop offset="1" stopColor="#fff1c0" /></linearGradient>
    <radialGradient id="d-glow"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#ffb060" stopOpacity=".8" /><stop offset="1" stopColor="#ff6a14" stopOpacity="0" /></radialGradient>
    <radialGradient id="d-bglow"><stop offset="0" stopColor="#cfe0ff" /><stop offset=".4" stopColor="#7fa8ff" stopOpacity=".55" /><stop offset="1" stopColor="#4c7cff" stopOpacity="0" /></radialGradient>
    <pattern id="d-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#2c332b" strokeWidth="1" /></pattern>
    <pattern id="d-brush" width="40" height="6" patternUnits="userSpaceOnUse"><path d="M0 1H40M0 4H40" stroke="#ffffff" strokeOpacity=".14" /><rect width="3" height="6" fill="#000" fillOpacity=".18" /></pattern>
    <filter id="d-blur"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>
);

const Electrode = ({ x, y = 70, lbl, s = 1 }: { x: number; y?: number; lbl?: string; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-13" y="-62" width="26" height="40" rx="3" fill="url(#d-body)" />
    <rect x="-16" y="-24" width="32" height="9" rx="2" fill="url(#d-brass)" />
    <path d="M-14 -15 H14 L8 22 H-8 Z" fill="url(#d-cer)" />
    <rect x="-1.5" y="22" width="3" height="16" fill="#fff" />
    {lbl && <text x="0" y="-70" textAnchor="middle" className="dg-t">{lbl}</text>}
  </g>
);
const Arc = ({ x, y, h = 36, w = 22, d = 0 }: { x: number; y: number; h?: number; w?: number; d?: number }) => (
  <g className="dg-flick" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
    <path d={`M${x} ${y} L${x - w / 2} ${y + h} L${x + w / 2} ${y + h} Z`} fill="url(#d-arc)" />
    <circle cx={x} cy={y + h} r="14" fill="url(#d-bglow)" />
  </g>
);

function Frame({ children, caption, title }: { children: React.ReactNode; caption: string; title: string }) {
  return (
    <figure className="dg">
      <svg viewBox="0 0 640 380" role="img" aria-label={title}>
        <Defs />
        <rect width="640" height="380" fill="#161a15" /><rect width="640" height="380" fill="url(#d-grid)" />
        {children}
      </svg>
      <figcaption className="mono">{caption}</figcaption>
    </figure>
  );
}

function Multi({ t, lang }: { t: Tx; lang: Lang }) {
  const ex = [250, 330, 410];
  return (
    <Frame title={t.multi} caption={`${t.schem} · ${t.multi}`}>
      {/* lastra in prospettiva */}
      <path d="M60 250 L520 250 L600 214 L140 214 Z" fill="url(#d-steel)" />
      <path d="M60 250 L520 250 L520 284 L60 284 Z" fill="url(#d-steel-s)" />
      <path d="M520 250 L600 214 L600 246 L520 284 Z" fill="#59616a" />
      <path d="M140 214 L600 214 L600 246" fill="none" />
      <g className="dg-slide"><path d="M60 250 L520 250 L600 214 L140 214 Z" fill="url(#d-brush)" /></g>
      {/* giunto e cordone */}
      <path d="M300 232 L600 232" stroke="#0e100d" strokeWidth="3" />
      <rect x="60" y="226" width="270" height="12" rx="6" fill="url(#d-heat)" />
      <ellipse cx="350" cy="232" rx="78" ry="13" fill="url(#d-glow)" className="dg-pulse" />
      {ex.map((x, i) => (<g key={x}><Arc x={x} y={108} h={116 - 0} w={26} d={i * 0.05} /><Electrode x={x} y={78} lbl={["1°", "2°", "3°"][i]} /></g>))}
      <g className="dg-osc"><path d="M392 140 h36 M392 140 l8 -6 M392 140 l8 6 M428 140 l-8 -6 M428 140 l-8 6" stroke="#8fd467" strokeWidth="2" fill="none" /></g>
      {/* dimensione parete */}
      <path d="M626 246 v38" stroke="#ff7a1a" strokeWidth="2" /><path d="M620 246 h12 M620 284 h12" stroke="#ff7a1a" strokeWidth="2" />
      <text x="614" y="304" textAnchor="end" className="dg-t heat">{t.wall} 0,5–3,5 mm</text>
      <text x="110" y="330" className="dg-t">{t.bead}</text><text x="372" y="330" className="dg-t">{t.pool}</text>
      <text x="40" y="360" className="dg-t dim">← {t.travel}</text>
      <text x="250" y="30" className="dg-t">{t.e1}</text><text x="478" y="30" className="dg-t">{t.e3}</text>
    </Frame>
  );
}

function Keyhole({ t }: { t: Tx }) {
  return (
    <Frame title={t.jet} caption={`${t.schem} · ${t.onepass}`}>
      {/* sezione parete spessa */}
      <rect x="40" y="190" width="560" height="120" fill="url(#d-steel)" />
      <g className="dg-slide"><rect x="40" y="190" width="560" height="120" fill="url(#d-brush)" /></g>
      {/* bagno + cordone a sinistra */}
      <path d="M40 190 H300 Q330 190 336 210 L336 296 Q330 310 300 310 H40 Z" fill="url(#d-heat)" opacity=".85" />
      <path d="M40 190 H300 V200 H40 Z" fill="#c8ced3" opacity=".9" />
      {/* key-hole */}
      <path d="M352 190 L352 310" stroke="#0e100d" strokeWidth="14" strokeLinecap="round" />
      <g className="dg-flick" style={{ transformOrigin: "352px 190px" }}>
        <path d="M340 90 L364 90 L360 316 L344 316 Z" fill="url(#d-arc)" />
        <ellipse cx="352" cy="310" rx="24" ry="16" fill="url(#d-bglow)" />
      </g>
      <ellipse cx="352" cy="250" rx="10" ry="56" fill="#fff" opacity=".8" className="dg-pulse" />
      {/* torcia plasma */}
      <g transform="translate(352 90)"><rect x="-20" y="-70" width="40" height="52" rx="4" fill="url(#d-body)" /><rect x="-24" y="-24" width="48" height="10" fill="url(#d-brass)" /><path d="M-22 -14 H22 L10 0 H-10 Z" fill="url(#d-brass)" /></g>
      {/* TIG dietro */}
      <Electrode x={270} y={150} /><Arc x={270} y={188} h={20} w={14} />
      {/* quote */}
      <path d="M620 190 v120" stroke="#ff7a1a" strokeWidth="2" /><path d="M614 190 h12 M614 310 h12" stroke="#ff7a1a" strokeWidth="2" />
      <text x="608" y="256" textAnchor="end" className="dg-t heat">{t.wall}</text><text x="608" y="274" textAnchor="end" className="dg-t heat">3,5–10 mm</text>
      <text x="386" y="150" className="dg-t">{t.jet}</text><text x="86" y="176" className="dg-t">{t.smooth}</text><text x="378" y="342" className="dg-t">{t.kh}</text>
      <text x="40" y="364" className="dg-t dim">← {t.travel}</text>
    </Frame>
  );
}

function Combo({ t }: { t: Tx }) {
  return (
    <Frame title={t.combo} caption={`${t.schem} · ${t.combo}`}>
      <path d="M40 250 L520 250 L600 214 L120 214 Z" fill="url(#d-steel)" /><path d="M40 250 L520 250 L520 284 L40 284 Z" fill="url(#d-steel-s)" /><path d="M520 250 L600 214 L600 246 L520 284 Z" fill="#59616a" />
      <path d="M40 232 L520 232" stroke="#0e100d" strokeWidth="3" opacity=".7" /><rect x="40" y="226" width="210" height="12" rx="6" fill="url(#d-heat)" />
      {/* sporco */}
      {Array.from({ length: 9 }).map((_, i) => (<circle key={i} className="dg-dirt" cx={470 - i * 14} cy={222 + (i % 3) * 5} r="3.5" fill="#6b5a3a" style={{ animationDelay: `${i * 0.25}s` }} />))}
      {/* plasma davanti (destra), tre TIG dietro */}
      <g className="dg-flick" style={{ transformOrigin: "420px 120px" }}><path d="M420 120 L402 230 L438 230 Z" fill="#c9a8ff" opacity=".7" /><circle cx="420" cy="232" r="20" fill="url(#d-bglow)" /></g>
      <g transform="translate(420 106)"><rect x="-18" y="-62" width="36" height="46" rx="4" fill="url(#d-body)" /><rect x="-22" y="-22" width="44" height="9" fill="url(#d-brass)" /><path d="M-20 -13 H20 L9 6 H-9 Z" fill="url(#d-brass)" /></g>
      {[200, 260, 320].map((x, i) => (<g key={x}><Arc x={x} y={120} h={110} w={22} d={i * 0.06} /><Electrode x={x} y={90} s={0.92} /></g>))}
      <ellipse cx="260" cy="232" rx="72" ry="12" fill="url(#d-glow)" className="dg-pulse" />
      <text x="372" y="40" className="dg-t">{t.sp3}</text><text x="410" y="300" className="dg-t">{t.clean}</text><text x="170" y="300" className="dg-t">{t.weld}</text><text x="470" y="204" className="dg-t dim">{t.dirt}</text>
      <text x="40" y="360" className="dg-t dim">← {t.travel}</text>
    </Frame>
  );
}

function Laser({ t }: { t: Tx }) {
  return (
    <Frame title={t.race} caption={`${t.schem} · ${t.race}`}>
      <text x="40" y="52" className="dg-t">{t.race}</text>
      {/* corsia TIG */}
      <text x="40" y="118" className="dg-t">{t.tigL} 1×</text>
      <rect x="40" y="128" width="560" height="30" fill="#232a22" /><rect x="40" y="128" width="280" height="30" fill="url(#d-heat)" className="dg-grow-s" />
      <g className="dg-run-s"><rect x="-10" y="100" width="20" height="26" fill="url(#d-body)" /><path d="M0 126 L-8 142 H8 Z" fill="#9cc4ff" opacity=".8" /></g>
      {/* corsia laser */}
      <text x="40" y="218" className="dg-t">{t.laserL} ≥ 2×</text>
      <rect x="40" y="228" width="560" height="30" fill="#232a22" /><rect x="40" y="228" width="560" height="30" fill="url(#d-heat)" className="dg-grow-f" />
      <g className="dg-run-f"><rect x="-10" y="198" width="20" height="26" fill="#2d3238" /><path d="M0 224 L-2 244 H2 Z" fill="#ff7a4a" /><rect x="-1.5" y="224" width="3" height="20" fill="#fff" className="dg-flick" /></g>
      <text x="40" y="300" className="dg-t heat">{t.l1}</text><text x="40" y="322" className="dg-t heat">{t.l2}</text>
      <text x="40" y="358" className="dg-t dim">{t.beam}</text>
    </Frame>
  );
}

function ID({ t }: { t: Tx }) {
  return (
    <Frame title={t.idTitle} caption={`${t.schem} · ${t.idTitle}`}>
      <circle cx="320" cy="200" r="150" fill="url(#d-steel)" /><circle cx="320" cy="200" r="150" fill="url(#d-brush)" opacity=".5" />
      <circle cx="320" cy="200" r="118" fill="#12160f" />
      <circle cx="320" cy="200" r="118" fill="none" stroke="#3b4238" strokeWidth="2" />
      {/* giunto in alto */}
      <rect x="312" y="44" width="16" height="22" fill="#ff8a30" opacity=".85" className="dg-pulse" /><path d="M320 40 v30" stroke="#0e100d" strokeWidth="2" />
      <rect x="312" y="78" width="16" height="10" fill="url(#d-heat)" />
      {/* torcia esterna */}
      <g transform="translate(320 -4) rotate(180)"><rect x="-14" y="-10" width="28" height="30" fill="url(#d-body)" /><path d="M-12 20 H12 L6 44 H-6 Z" fill="url(#d-cer)" /></g>
      <path d="M320 40 L308 62 H332 Z" fill="url(#d-arc)" className="dg-flick" style={{ transformOrigin: "320px 40px" }} />
      {/* torcia interna su braccio + telecamera */}
      <path d="M320 330 V150" stroke="#59616a" strokeWidth="10" /><rect x="304" y="320" width="32" height="14" fill="#2d3238" />
      <g transform="translate(320 126)"><rect x="-12" y="0" width="24" height="26" rx="3" fill="url(#d-body)" /><path d="M-10 -22 H10 L5 0 H-5 Z" fill="url(#d-cer)" /></g>
      <path d="M320 98 L308 80 H332 Z" fill="url(#d-arc)" className="dg-flick" style={{ transformOrigin: "320px 98px" }} />
      <circle cx="320" cy="84" r="16" fill="url(#d-bglow)" />
      <g className="dg-osc"><path d="M284 100 h-26 M258 100 l7 -5 M258 100 l7 5 M356 100 h26 M382 100 l-7 -5 M382 100 l-7 5" stroke="#8fd467" strokeWidth="2" fill="none" /></g>
      <g transform="translate(352 168)"><rect x="0" y="0" width="30" height="20" rx="3" fill="#2d3238" stroke="#9aa1a7" /><circle cx="22" cy="10" r="5" fill="#9cc4ff" /></g>
      <path d="M356 172 L330 110" stroke="#9cc4ff" strokeOpacity=".5" strokeDasharray="4 4" />
      <path d="M296 150 q-40 10 -56 40" stroke="#c9a8ff" strokeWidth="2.5" fill="none" /><text x="60" y="214" className="dg-t">{t.wire}</text>
      <text x="400" y="150" className="dg-t">{t.cam}</text><text x="410" y="108" className="dg-t">{t.osc}</text><text x="396" y="300" className="dg-t">{t.inner}</text><text x="410" y="40" className="dg-t">{t.outer}</text><text x="410" y="78" className="dg-t heat">{t.rebead}</text>
    </Frame>
  );
}

function Power({ t }: { t: Tx }) {
  const pulses = Array.from({ length: 22 }, (_, i) => `${i === 0 ? "M" : "L"}${i * 28} 120 L${i * 28} 70 L${i * 28 + 14} 70 L${i * 28 + 14} 120`).join(" ");
  return (
    <Frame title={t.pulse} caption={`${t.schem} · ${t.pen}`}>
      <text x="40" y="44" className="dg-t">{t.pulse} · {t.amp}</text>
      <path d="M40 92 H600" stroke="#8a9199" strokeDasharray="5 5" /><text x="604" y="84" textAnchor="end" className="dg-t dim">{t.steady}</text>
      <g clipPath="url(#d-clip)"><clipPath id="d-clip"><rect x="40" y="56" width="560" height="80" /></clipPath><g className="dg-wave" transform="translate(40 0)"><path d={pulses} fill="none" stroke="#8fd467" strokeWidth="3" strokeLinejoin="round" /></g></g>
      {/* due archi + sezioni di saldatura */}
      <g transform="translate(40 150)">
        <rect x="0" y="130" width="250" height="26" fill="url(#d-steel)" /><path d="M110 -10 L90 130 L170 130 Z" fill="url(#d-arc)" opacity=".6" className="dg-flick" /><rect x="116" y="-30" width="28" height="30" fill="url(#d-body)" /><path d="M95 130 Q130 190 165 130 Z" fill="#ff8a30" opacity=".85" /><text x="0" y="190" className="dg-t">{t.dc}</text>
      </g>
      <g transform="translate(350 150)">
        <rect x="0" y="130" width="250" height="26" fill="url(#d-steel)" /><path d="M125 -10 L116 130 L134 130 Z" fill="url(#d-arc)" className="dg-flick" style={{ transformOrigin: "125px -10px" }} /><rect x="111" y="-30" width="28" height="30" fill="url(#d-body)" /><path d="M118 130 Q125 214 132 130 Z" fill="#ff8a30" /><text x="0" y="190" className="dg-t">{t.pk}</text><text x="0" y="214" className="dg-t heat">{t.pen}</text>
      </g>
    </Frame>
  );
}

export function TechDiagram({ tech, lang }: { tech: string; lang: Lang }) {
  const t: Tx = TXT[lang];
  switch (tech) {
    case "tig-multicatodo": return <Multi t={t} lang={lang} />;
    case "plasma-key-hole": return <Keyhole t={t} />;
    case "combo-plasma-tig": return <Combo t={t} />;
    case "laser-fibra": return <Laser t={t} />;
    case "ripresa-interna": return <ID t={t} />;
    case "generatori-accessori": return <Power t={t} />;
    default: return null;
  }
}
