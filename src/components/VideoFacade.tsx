"use client";
import { useState } from "react";
import { Play } from "./Icons";

/** Carica YouTube (privacy-enhanced) solo al clic: nessuna richiesta a Google prima. */
export function VideoFacade({ id, title, label }: { id: string; title: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="vid" style={{ background: "radial-gradient(120% 120% at 20% 10%, #2a2f35, #14171a)" }}>
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <button onClick={() => setOn(true)} aria-label={`${label}: ${title}`} style={{ all: "unset", cursor: "pointer", position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <span className="play"><Play /></span>
          <span className="mono" style={{ position: "absolute", left: 14, bottom: 12, right: 14, fontSize: ".8rem", color: "#c3c9cf", textAlign: "left" }}>{title}</span>
        </button>
      )}
    </div>
  );
}
