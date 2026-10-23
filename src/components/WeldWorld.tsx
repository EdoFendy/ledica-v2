"use client";
import { useEffect, useRef, useState } from "react";
import { LionIntro } from "./LionIntro";

export type WorldChapter = { nav?: string; body: React.ReactNode; weight: number };

/** Hero scroll-world: palco 3D sticky, capitoli HTML che scorrono sopra. Lo scroll nativo è l'unica fonte del progresso.
 *  I capitoli senza `nav` proseguono il gruppo precedente (es. dettagli di una torcia). */
export function WeldWorld({ chapters, poster, navLabel, signs, loadingLabel }: { chapters: WorldChapter[]; poster: React.ReactNode; navLabel: string; signs: [string, string][]; loadingLabel: string }) {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const arts = useRef<(HTMLElement | null)[]>([]);
  const anchors = useRef<number[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const worldRef = useRef<{ intro(): void }>(undefined);

  useEffect(() => {
    let alive = true, last = -1;
    let world: { setProgress(p: number): void; intro(): void; dispose(): void } | undefined;
    const n = chapters.length;
    // ancore: centro di ogni capitolo al centro del viewport; prima = inizio sezione, ultima = fine
    const measure = () => {
      const s = sec.current!, top = s.getBoundingClientRect().top + scrollY, vh = innerHeight, end = top + s.offsetHeight - vh;
      anchors.current = arts.current.map((a, i) => {
        if (i === 0) return top;
        if (i === n - 1) return end;
        const r = a!.getBoundingClientRect(); return r.top + scrollY + r.height / 2 - vh / 2;
      });
      for (let i = 1; i < n; i++) anchors.current[i] = Math.max(anchors.current[i], anchors.current[i - 1] + 1);
    };
    const progress = () => {
      const A = anchors.current, y = scrollY;
      if (y <= A[0]) return 0;
      for (let i = 0; i < n - 1; i++) if (y <= A[i + 1]) return i + (y - A[i]) / (A[i + 1] - A[i]);
      return n - 1;
    };
    const onScroll = () => {
      const p = progress(); world?.setProgress(p);
      const a = Math.round(p); if (a !== last) { last = a; setActive(a); }
    };
    const onResize = () => { measure(); onScroll(); };
    measure(); onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    const ro = new ResizeObserver(onResize); ro.observe(sec.current!);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 899px), (pointer: coarse)").matches;
    const intro = !reduced;
    import("./world/weldWorld")
      .then(({ createWeldWorld }) => alive && stage.current ? createWeldWorld(stage.current, { reduced, mobile, signs, intro, onReady: () => alive && setReady(true) }) : undefined)
      .then((w) => {
        if (!w) return;
        if (!alive) { w.dispose(); return; }
        world = w; worldRef.current = w; onScroll();
      })
      .catch(() => setReady(true)); // senza WebGL resta il poster e il caricamento si chiude
    return () => { alive = false; removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); ro.disconnect(); world?.dispose(); };
    // il mondo si costruisce una volta: testi e cartelli sono statici per pagina
  }, [chapters.length]);

  const go = (i: number) => scrollTo({ top: anchors.current[i] ?? 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  const group = chapters.reduce((g, c, i) => (c.nav && i <= active ? i : g), 0);

  return (
    <section ref={sec} className="world dark">
      <LionIntro ready={ready} label={loadingLabel} onOpen={() => worldRef.current?.intro()} />
      <div className="world-stage">
        <div className="world-poster">{poster}</div>
        <div ref={stage} className={`world-canvas${ready ? " on" : ""}`} aria-hidden="true" />
        <div className="world-scrim" aria-hidden="true" />
        <nav className="world-nav" aria-label={navLabel}>
          {chapters.map((c, i) => c.nav && (
            <button key={i} type="button" aria-current={i === group ? "step" : undefined} onClick={() => go(i)}>
              <span className="mono">{c.nav}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="world-chapters">
        {chapters.map((c, i) => (
          <article key={i} ref={(el) => { arts.current[i] = el; }} className={`world-ch${i === active ? " on" : ""}`} style={{ minHeight: `${c.weight * 100}svh` }}>
            <div className="wrap"><div className="world-copy">{c.body}</div></div>
          </article>
        ))}
      </div>
    </section>
  );
}
