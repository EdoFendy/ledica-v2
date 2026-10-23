"use client";
import { useCallback, useState } from "react";
import { Ruler, type Lane } from "./Ruler";
import { TorchCard } from "./TorchCard";
import type { Lang } from "@/lib/types";
import type { SceneLabels } from "./WeldScene";

type RulerText = { title: string; hint: string; covers: string; none: string; see: string };
const PICKS = [0.4, 1.5, 3, 6, 12.7];
/** Laboratorio: righello e misure rapide a sinistra, a destra la torcia reale in funzione per lo spessore scelto. */
export function HeroStage({ photo, lanes, lang, text, labels, caption }: { photo: React.ReactNode; lanes: Lane[]; lang: Lang; text: RulerText; labels: SceneLabels; caption: string }) {
  const [v, setV] = useState(0.4);
  const [pick, setPick] = useState<{ v: number }>();
  const onValue = useCallback((n: number) => setV(n), []);
  const fmt = (n: number) => n.toFixed(n % 1 ? 1 : 0).replace(".", lang === "it" ? "," : ".");
  return (
    <div className="wrap lab-grid">
      <Ruler lanes={lanes} lang={lang} start={0.4} intro={false} value={pick} onValue={onValue} {...text}>
        <div className="lab-picks" role="group" aria-label={text.title}>
          {PICKS.map((p) => (
            <button key={p} type="button" className={`mono${Math.abs(p - v) < .05 ? " on" : ""}`} onClick={() => setPick({ v: p })}>{fmt(p)} mm</button>
          ))}
        </div>
      </Ruler>
      <TorchCard v={v} labels={labels} caption={caption} photo={photo} />
    </div>
  );
}
