"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Close } from "./Icons";

export function MobileNav({ items, cta, label, closeLabel }: { items: { href: string; label: string }[]; cta: { href: string; label: string }; label: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button className="burger" aria-expanded={open} aria-controls="drawer" aria-label={open ? closeLabel : label} onClick={() => setOpen(!open)}>
        {open ? <Close /> : <Menu />}
      </button>
      {open && (
        <nav id="drawer" className="drawer" aria-label={label}>
          {items.map((i) => (<Link key={i.href} href={i.href} className="dl" onClick={() => setOpen(false)}>{i.label}</Link>))}
          <Link href={cta.href} className="btn" onClick={() => setOpen(false)}>{cta.label}</Link>
        </nav>
      )}
    </>
  );
}
