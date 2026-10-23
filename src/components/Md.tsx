import { Fragment } from "react";
import Link from "next/link";

/** Markdown minimo: ##/###, elenchi, grassetto, link, citazioni, paragrafi. Niente HTML grezzo. I titoli ## hanno un id per l'indice. */
export const mdSlug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const inline = (s: string, k: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={`${k}b${i++}`}>{tok.slice(2, -2)}</strong>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(/^https?:/.test(href) ? <a key={`${k}a${i++}`} href={href} rel="noopener">{label}</a> : <Link key={`${k}a${i++}`} href={href}>{label}</Link>);
    }
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
};

export function Md({ text, className = "prose" }: { text: string; className?: string }) {
  const blocks = (text || "").replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (/^## /.test(b)) return <Fragment key={i}><h2 id={mdSlug(lines[0].slice(3))}>{inline(lines[0].slice(3), `h${i}`)}</h2>{lines.length > 1 && <Md text={lines.slice(1).join("\n")} className="" />}</Fragment>;
        if (/^### /.test(b)) return <Fragment key={i}><h3>{inline(lines[0].slice(4), `h${i}`)}</h3>{lines.length > 1 && <Md text={lines.slice(1).join("\n")} className="" />}</Fragment>;
        if (lines.every((l) => /^[-•] /.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2), `l${i}${j}`)}</li>)}</ul>;
        if (/^> /.test(b)) return <blockquote key={i}>{inline(b.replace(/^> /gm, ""), `q${i}`)}</blockquote>;
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l, `p${i}${j}`)}</Fragment>)}</p>;
      })}
    </div>
  );
}
