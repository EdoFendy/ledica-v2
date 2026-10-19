import Link from "next/link";
import { Img } from "./Img";
import { dict } from "@/lib/dict";
import { itemHref } from "@/lib/routes";
import { range } from "@/lib/site";
import { tr, type Lang, type Row } from "@/lib/types";

export function PTile({ r, lang }: { r: Row; lang: Lang }) {
  const t = dict(lang);
  const cur = r.data.specs?.find((s: any) => s.label.en === "Current" || s.label.en === "TIG current");
  return (
    <Link href={itemHref(lang, r)} className="ptile">
      <div className="ptile-img">
        {r.data.badge === "new" && <span className="tag-new">{lang === "it" ? "Novità" : "New"}</span>}
        <Img src={r.data.images[0]} lang={lang} sizes="(min-width: 1200px) 28vw, (min-width: 560px) 45vw, 100vw" alt={tr(r.data.name, lang)} />
      </div>
      <div className="ptile-body">
        <h3>{tr(r.data.name, lang)}</h3>
        <p>{tr(r.data.subtitle, lang)}</p>
        <div className="meta">{cur && <span>{tr(cur.value, lang)}</span>}{range(r.data.thickMin, r.data.thickMax, lang) && <span>{range(r.data.thickMin, r.data.thickMax, lang)}</span>}</div>
      </div>
    </Link>
  );
}
