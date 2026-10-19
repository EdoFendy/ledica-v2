import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth";

type Rule = { from_path: string; to_path: string; code: number };
let wild: { at: number; rules: Rule[] } = { at: 0, rules: [] };
const wildcards = () => {
  if (Date.now() - wild.at > 30_000) wild = { at: Date.now(), rules: db().prepare("SELECT * FROM redirects WHERE from_path LIKE '%*'").all() as Rule[] };
  return wild.rules;
};

const gone = () =>
  new NextResponse("<!doctype html><meta charset=utf-8><title>410</title><body style='font-family:system-ui;padding:4rem'><h1>410 — Gone</h1><p>Questa pagina è stata rimossa definitivamente. <a href='/'>LE.DI.CA.</a></p>", {
    status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
  });

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const h = new Headers(req.headers);
    h.set("x-admin", "1");
    if (pathname === "/admin/login") return NextResponse.next({ request: { headers: h } });
    const raw = req.cookies.get("ld_admin")?.value;
    const ok = await verifySession(raw);
    if (!ok) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      if (raw) res.cookies.delete("ld_admin"); // sessione scaduta o di un formato vecchio: la togliamo
      return res;
    }
    return NextResponse.next({ request: { headers: h } });
  }

  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  let rule = db().prepare("SELECT * FROM redirects WHERE from_path=?").get(key) as Rule | undefined;
  if (!rule) rule = wildcards().find((r) => key.startsWith(r.from_path.slice(0, -1)));
  if (rule) {
    if (rule.code === 410) return gone();
    const to = new URL(rule.to_path, req.url);
    return NextResponse.redirect(to, rule.code === 302 ? 302 : 301);
  }

  const headers = new Headers(req.headers);
  headers.set("x-lang", pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it");
  headers.set("x-path", pathname + search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/|media/|api/|icon.svg|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-z0-9]{2,5}$).*)"] };
