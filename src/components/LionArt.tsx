"use client";
import { useEffect, useRef } from "react";
import { LION_PATH, LION_VIEWBOX } from "./lion";

/** Silhouette del leone del marchio, tracciata dal logo ufficiale. L'arco la disegna, poi si riempie. Decorativa: il logo ufficiale resta sempre intatto altrove. */
export function LionArt({ variant = "arc", className = "" }: { variant?: "arc" | "solid"; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("go", "still"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("go"); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} viewBox={LION_VIEWBOX} className={`lion ${variant} ${className}`} aria-hidden="true" focusable="false">
      <defs><filter id="lg" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <path className="lion-fill" d={LION_PATH} fillRule="evenodd" />
      <path className="lion-line" d={LION_PATH} fillRule="evenodd" pathLength={1} />
      <path className="lion-spark" d={LION_PATH} fillRule="evenodd" pathLength={1} filter="url(#lg)" />
    </svg>
  );
}
