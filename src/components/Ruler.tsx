"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/types";

export type Lane = { key: string; name: string; href: string; min: number; max: number; summary: string };
const MAX = 12.7; // fondo scala = massimo dichiarato del plasma key-hole
const MIN = 0.2;
const f = (n: number, lang: Lang) => n.toFixed(1).replace(".", lang === "it" ? "," : ".");
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, Math.round(n * 10) / 10));

export function Ruler({ lanes, lang, title, hint, covers, none, see, start = 2, intro = true, value, onValue, children }: { lanes: Lane[]; lang: Lang; title: string; hint: string; covers: string; none: string; see: string; start?: number; intro?: boolean; value?: { v: number }; onValue?: (v: number) => void; children?: React.ReactNode }) {
  const [v, setV] = useState(start);
  useEffect(() => { onValue?.(v); }, [v, onValue]);
  useEffect(() => { if (value) setV(clamp(value.v)); }, [value]); // valore imposto da fuori: oggetto nuovo a ogni clic, anche sulla stessa misura
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = (n: number) => `${(n / MAX) * 100}%`;

  // ingresso: il cursore scende da 12 mm a start, una sola volta
  useEffect(() => {
    if (!intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const t0 = performance.now(); const D = 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / D); const e = 1 - Math.pow(1 - k, 4);
      setV(clamp(MAX + (start - MAX) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stop = () => cancelAnimationFrame(raf);
    ref.current?.addEventListener("pointerdown", stop, { once: true });
    return stop;
  }, [start, intro]);

  const fromEvent = useCallback((e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setV(clamp(((e.clientX - r.left) / r.width) * MAX));
  }, []);

  const on = lanes.filter((l) => v >= l.min && v <= l.max);
  const ticks = Array.from({ length: Math.floor(MAX * 2) + 1 }, (_, i) => i / 2);

  return (
    <div className="ruler-wrap">
      <div className="wrap">
        <div className="ruler-head">
          <h2>{title}</h2>
          <span className="hint">{hint}</span>
        </div>
        {children}
        <div
          ref={ref} className="ruler" role="slider" tabIndex={0}
          aria-label={title} aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={v}
          aria-valuetext={`${f(v, lang)} mm${on.length ? ": " + on.map((l) => l.name).join(", ") : ""}`}
          onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); fromEvent(e); }}
          onPointerMove={(e) => dragging.current && fromEvent(e)}
          onPointerUp={() => (dragging.current = false)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 0.5 : 0.1;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setV(clamp(v + step)); }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setV(clamp(v - step)); }
            if (e.key === "Home") setV(MIN);
            if (e.key === "End") setV(MAX);
          }}
        >
          <div className="r-lanes">
            {lanes.map((l) => {
              const w = ((l.max - l.min) / MAX) * 100;
              const inside = w > 22;
              return (
                <div key={l.key} className={`r-lane${v >= l.min && v <= l.max ? " on" : ""}`}>
                  <div className="r-bar mono" style={{ left: pct(l.min), width: `${w}%` }}>{inside ? l.name : ""}</div>
                  {!inside && <span className="mono" style={{ position: "absolute", left: `calc(${pct(l.max)} + 8px)`, top: 4, fontSize: ".74rem", color: v >= l.min && v <= l.max ? "#fff" : "#aab1b8", whiteSpace: "nowrap" }}>{l.name}</span>}
                </div>
              );
            })}
          </div>
          <div className="r-scale">
            {ticks.map((t) => (<i key={t} className={`r-tick${Number.isInteger(t) ? " m" : ""}`} style={{ left: pct(t) }} />))}
            {Array.from({ length: Math.floor(MAX) + 1 }, (_, i) => i).filter((i) => i % 2 === 0 || i === 1 || i === 3).map((i) => (
              <span key={i} className="r-lbl mono" style={{ left: pct(i) }}>{i}</span>
            ))}
          </div>
          <div className="r-cursor" style={{ left: pct(v) }}>
            <span className="spark" />
            <span className="r-val mono">{f(v, lang)} mm</span>
          </div>
        </div>
        <div className="r-read" aria-live="polite">
          {on.length ? (
            <>
              <div>
                <p className="mono muted" style={{ margin: "0 0 8px", fontSize: ".85rem" }}>{covers} {f(v, lang)} mm</p>
                <h3>{on.map((l) => l.name).join(" · ")}</h3>
              </div>
              <ul>
                {on.map((l) => (
                  <li key={l.key}><Link href={l.href}>{l.name} — {see} <span className="mono">{f(l.min, lang)}–{f(l.max, lang)} mm</span></Link></li>
                ))}
              </ul>
            </>
          ) : <p>{none}</p>}
        </div>
      </div>
    </div>
  );
}
