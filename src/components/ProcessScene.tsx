"use client";
import { useEffect, useRef, useState } from "react";
import { Rotate3d } from "lucide-react";
import type { ProcessKey } from "./world/processWorld";

export type ProcessText = { steps: { title: string; text: string }[]; tags: Record<string, string>; drag: string; caption: string; wave?: string };

/** Spaccato 3D del processo in tre passi. Avanza da solo finché l'utente non tocca la scena o un passo. */
export function ProcessScene({ tech, text }: { tech: ProcessKey; text: ProcessText }) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tagEls = useRef<(HTMLElement | null)[]>([]);
  const world = useRef<{ setStep(i: number): void; dispose(): void }>(undefined);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ready, setReady] = useState(false);
  const keys = Object.keys(text.tags);

  useEffect(() => {
    let alive = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      import("./world/processWorld").then(({ createProcessWorld }) => {
        if (!alive || !stage.current) return;
        try {
          world.current = createProcessWorld(stage.current, tech, {
            reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
            tags: keys.map((k, i) => ({ key: k, el: tagEls.current[i]! })),
            onUser: () => setAuto(false), onReady: () => alive && setReady(true),
          });
        } catch { /* senza WebGL resta il testo dei passi */ }
      });
    }, { rootMargin: "400px 0px" });
    io.observe(box.current!);
    return () => { alive = false; io.disconnect(); world.current?.dispose(); };
    // la scena si costruisce una volta per tecnologia: testi ed etichette sono statici
  }, [tech]);

  useEffect(() => { world.current?.setStep(step); }, [step]);
  useEffect(() => {
    if (!auto || !ready || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % text.steps.length), 6500);
    return () => clearInterval(id);
  }, [auto, ready, text.steps.length]);

  return (
    <div ref={box} className="proc">
      <figure className="proc-stage">
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div ref={stage} className={`proc-canvas${ready ? " on" : ""}`} aria-hidden="true" />
        <div className="world-tags proc-tags" aria-hidden="true">
          {keys.map((k, i) => (<span key={k} ref={(el) => { tagEls.current[i] = el; }} className="world-tag mono"><i /><b>{text.tags[k]}</b></span>))}
        </div>
        {text.wave && (
          <div className="proc-wave" aria-hidden="true">
            <span className="mono">{text.wave}</span>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none"><path className="proc-wave-dc" d="M0 26H200" /><g className="proc-wave-pk"><path d={`M0 32${Array.from({ length: 26 }, (_, i) => ` L${i * 16} 32 L${i * 16} 8 L${i * 16 + 8} 8 L${i * 16 + 8} 32`).join("")}`} /></g></svg>
          </div>
        )}
        <p className="proc-hint mono"><Rotate3d size={14} aria-hidden="true" /> {text.drag}</p>
        <figcaption className="scene-cap mono">{text.caption}</figcaption>
      </figure>
      <ol className="proc-steps">
        {text.steps.map((s, i) => (
          <li key={i}>
            <button type="button" aria-current={i === step ? "step" : undefined} onClick={() => { setAuto(false); setStep(i); }}>
              <span className="mono proc-n">0{i + 1}</span>
              <span className="proc-t">{s.title}</span>
              <span className="proc-x">{s.text}</span>
              {i === step && auto && ready && <i className="proc-bar" />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
