import Image from "next/image";
import { altFor } from "@/lib/site";
import type { Lang } from "@/lib/types";

/** Immagine da /media con alt dalla libreria media. Il contenitore deve essere position:relative con dimensioni. */
export function Img({ src, lang, alt, sizes = "(min-width: 900px) 50vw, 100vw", priority, className, quality = 75 }: {
  src: string; lang: Lang; alt?: string; sizes?: string; priority?: boolean; className?: string; quality?: 60 | 75 | 85;
}) {
  if (!src) return null;
  const text = altFor(src, lang, alt ?? "");
  return <Image src={`/media/${src}`} alt={text} fill sizes={sizes} priority={priority} className={className} quality={quality} />;
}
