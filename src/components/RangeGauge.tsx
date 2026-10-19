/** Campo di spessore del prodotto sulla scala 0–12 mm, la stessa del righello in home. */
export function RangeGauge({ min, max, label, lang }: { min: number; max: number; label: string; lang: "it" | "en" }) {
  const f = (n: number) => String(n).replace(".", lang === "it" ? "," : ".");
  return (
    <div className="gauge" role="img" aria-label={`${label}: ${f(min)}–${f(max)} mm`}>
      <div className="gauge-head"><span>{label}</span><b className="mono">{f(min)}–{f(max)} mm</b></div>
      <div className="gauge-scale"><span className="gauge-bar" style={{ left: `${(min / 12) * 100}%`, width: `${Math.max(1.5, ((max - min) / 12) * 100)}%` }} />
        {Array.from({ length: 13 }, (_, i) => <i key={i} style={{ left: `${(i / 12) * 100}%` }} className={i % 2 === 0 ? "m" : ""} />)}</div>
      <div className="gauge-n mono"><span>0</span><span>3</span><span>6</span><span>9</span><span>12 mm</span></div>
    </div>
  );
}
