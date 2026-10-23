"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { torchMode } from "./torchMode";
import type { SceneLabels } from "./WeldScene";

const WeldScene = dynamic(() => import("./WeldScene"), { ssr: false });

/** Card con la torcia reale in funzione sullo spessore `v`. La scena 3D si monta solo quando la card si avvicina al viewport. */
export function TorchCard({ v, labels, caption, photo }: { v: number; labels: SceneLabels; caption: string; photo?: React.ReactNode }) {
  const card = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(card.current!); return () => io.disconnect();
  }, []);
  return (
    <figure ref={card} className="hero-photo lab-card">
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      {photo}
      {near && <WeldScene v={v} labels={labels} />}
      <span key={torchMode(v)} className="lab-pop" aria-hidden="true" />
      <figcaption className="scene-cap mono">{caption}</figcaption>
    </figure>
  );
}
