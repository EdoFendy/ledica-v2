"use client";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ items }: { items: { src: string; alt: string; photo: boolean }[] }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const cur = items[i];
  return (
    <div>
      <div className={`gal-main${cur.photo ? " cover" : ""}`}>
        <Image src={`/media/${cur.src}`} alt={cur.alt} fill sizes="(min-width: 960px) 55vw, 100vw" priority quality={85} />
      </div>
      {items.length > 1 && (
        <div className="gal-thumbs">
          {items.map((it, k) => (
            <button key={it.src} className="gal-thumb" aria-label={it.alt} aria-current={k === i} onClick={() => setI(k)}>
              <Image src={`/media/${it.src}`} alt="" fill sizes="84px" quality={60} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
