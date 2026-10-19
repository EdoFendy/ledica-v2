/** Mini-illustrazioni animate per la sezione «Perché LE.DI.CA.». */
export function WhyArt({ kind }: { kind: "retrofit" | "range" | "team" }) {
  return (
    <svg viewBox="0 0 320 150" className="why-art" aria-hidden="true">
      <defs>
        <linearGradient id="w-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe3e6" /><stop offset="1" stopColor="#8d959c" /></linearGradient>
      </defs>
      {kind === "retrofit" && (<g>
        {/* linea profilatrice esistente + modulo che si innesta */}
        <rect x="14" y="96" width="292" height="16" fill="url(#w-steel)" />
        {[40, 110, 180, 250].map((x) => (<g key={x}><rect x={x - 16} y="68" width="32" height="28" fill="#2b2f29" /><circle cx={x} cy="82" r="8" fill="#6b7168" /></g>))}
        <g className="wa-drop"><rect x="136" y="20" width="48" height="34" fill="#3f7a28" /><rect x="156" y="54" width="8" height="26" fill="#d6dadf" /><path d="M160 80 l-6 12 h12 z" fill="#9cc4ff" /></g>
        <path d="M110 100 h100" stroke="#8fd467" strokeWidth="2" strokeDasharray="4 4" className="wa-dash" />
      </g>)}
      {kind === "range" && (<g>
        {[0.15, 0.4, 0.8].map((k, i) => (<g key={i} transform={`translate(${64 + i * 96} 76)`}>
          <circle r="40" fill="url(#w-steel)" />
          <circle r={40 - 3 - k * 26} fill="#14170f" className="wa-wall" style={{ animationDelay: `${i * 0.5}s` }} />
          <text y="62" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#596068">{["0,2–0,5", "0,5–3,5", "3,5–12"][i]} mm</text>
        </g>))}
      </g>)}
      {kind === "team" && (<g>
        <path d="M24 90 H296" stroke="#c9ccc4" strokeWidth="2" />
        <path d="M24 90 H296" stroke="#3f7a28" strokeWidth="3" pathLength={1} strokeDasharray="1" className="wa-line" />
        {[["1967", 24], ["1980", 112], ["1989", 200], ["oggi", 290]].map(([y, x]) => (<g key={String(y)}><circle cx={x as number} cy="90" r="7" fill="#fff" stroke="#3f7a28" strokeWidth="3" /><text x={x as number} y="64" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="700" fill="#161816">{y as string}</text></g>))}
        <text x="160" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#596068">C.R.I.S. → LE.DI.CA.</text>
      </g>)}
    </svg>
  );
}
