"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Ruler, type Lane } from "./Ruler";
import type { Lang } from "@/lib/types";
import type { SceneLabels } from "./WeldScene";

const WeldScene = dynamic(() => import("./WeldScene"), { ssr: false });

type RulerText = { title: string; hint: string; covers: string; none: string; see: string };
/** Hero: testo a sinistra, scena 3D a destra, righello sotto. Il righello comanda la scena. */
export function HeroStage({ children, photo, lanes, lang, text, labels, caption }: { children: React.ReactNode; photo: React.ReactNode; lanes: Lane[]; lang: Lang; text: RulerText; labels: SceneLabels; caption: string }) {
  const [v, setV] = useState(2);
  const onValue = useCallback((n: number) => setV(n), []);
  return (
    <>
      <div className="wrap hero-grid">
        <div>{children}</div>
        <figure className="hero-photo">
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
          {photo}
          <WeldScene v={v} labels={labels} />
          <figcaption className="scene-cap mono">{caption}</figcaption>
        </figure>
      </div>
      <Ruler lanes={lanes} lang={lang} onValue={onValue} {...text} />
    </>
  );
}
