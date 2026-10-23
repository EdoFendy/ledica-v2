"use client";
import { useEffect, useRef, useState } from "react";
import { LION_PATH, LION_VIEWBOX } from "./lion";

/** Caricamento della home: un tratto laser incandescente percorre il contorno del leone finché il mondo 3D non è pronto.
 *  È solo HTML + CSS dal primo disegno (nessun JS per animarlo); il mondo si costruisce a passi per non bloccarlo.
 *  Quando `ready` arriva il leone si riempie, l'overlay sfuma e parte il volo d'ingresso della camera. */
export function LionIntro({ ready, onOpen, label }: { ready: boolean; onOpen: () => void; label: string }) {
  const [phase, setPhase] = useState<"load" | "done" | "gone">("load");
  const open = useRef(onOpen); open.current = onOpen;

  // rete di sicurezza: se il 3D non segnala mai il primo frame, il caricamento non resta aperto per sempre
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => { const id = setTimeout(() => setTimedOut(true), 12000); return () => clearTimeout(id); }, []);

  useEffect(() => {
    if (!ready && !timedOut) return;
    setPhase("done");
    const a = setTimeout(() => { open.current(); document.documentElement.dataset.introPending = "open"; }, 450);
    const b = setTimeout(() => setPhase("gone"), 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [ready, timedOut]);

  if (phase === "gone") return null;
  return (
    <div className={`intro ${phase}`} role="status" aria-label={label}>
      {/* prima dell'idratazione: i testi della hero aspettano l'apertura (con riduzione del movimento no) */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introPending="1"}catch(e){}` }} />
      <div className="intro-mark" aria-hidden="true">
        <svg viewBox={LION_VIEWBOX} className="intro-lion" focusable="false">
          <path className="intro-fill" d={LION_PATH} fillRule="evenodd" />
          <path className="intro-line" d={LION_PATH} fillRule="evenodd" />
          <path className="intro-glow" d={LION_PATH} fillRule="evenodd" pathLength={1} />
          <path className="intro-beam" d={LION_PATH} fillRule="evenodd" pathLength={1} />
        </svg>
      </div>
      <p className="intro-meta mono" aria-hidden="true">{label}<span className="intro-dots"><b>.</b><b>.</b><b>.</b></span></p>
    </div>
  );
}
