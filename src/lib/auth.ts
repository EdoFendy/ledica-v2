import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "./db";

const SECRET = () => process.env.SESSION_SECRET || "dev-secret-cambiami";
const TTL = 60 * 60 * 24 * 7;
const enc = new TextEncoder();

export type Role = "admin" | "editor";
export type User = { id: number; email: string; name: string; role: Role };

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Buffer.from(await crypto.subtle.sign("HMAC", key, enc.encode(data))).toString("base64url");
}

/** Sessione firmata: scadenza.idUtente.firma. L'utente 0 è l'amministratore di emergenza definito in .env. */
export async function makeSession(uid: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  return `${exp}.${uid}.${await hmac(`${exp}.${uid}`)}`;
}
export async function verifySession(v?: string): Promise<{ uid: number } | null> {
  if (!v) return null;
  const [exp, uid, sig] = v.split(".");
  if (!exp || !uid || !sig || Number(exp) < Date.now() / 1000) return null;
  const good = await hmac(`${exp}.${uid}`);
  if (good.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  return { uid: Number(uid) };
}

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  return `${salt.toString("hex")}:${crypto.scryptSync(pw, salt, 64).toString("hex")}`;
}
function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = crypto.scryptSync(pw, Buffer.from(salt, "hex"), 64), b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const envAdmin = (): User => ({ id: 0, email: (process.env.ADMIN_EMAIL || "admin@ledica.it").toLowerCase(), name: "Amministratore", role: "admin" });

/** Utenti del database; in alternativa l'amministratore di emergenza di .env (serve per il primo accesso e per il recupero). */
export function checkLogin(email: string, password: string): User | null {
  const e = email.trim().toLowerCase();
  const row = db().prepare("SELECT * FROM users WHERE email=?").get(e) as (User & { hash: string }) | undefined;
  if (row && verifyPassword(password, row.hash)) return { id: row.id, email: row.email, name: row.name, role: row.role };
  const env = envAdmin();
  const p = process.env.ADMIN_PASSWORD || "ledica-admin";
  const a = crypto.createHash("sha256").update(e + "\0" + password).digest();
  const b = crypto.createHash("sha256").update(env.email + "\0" + p).digest();
  return crypto.timingSafeEqual(a, b) ? env : null;
}

export async function currentUser(): Promise<User | null> {
  const s = await verifySession((await cookies()).get("ld_admin")?.value);
  if (!s) return null;
  if (s.uid === 0) return envAdmin();
  const u = db().prepare("SELECT id, email, name, role FROM users WHERE id=?").get(s.uid) as User | undefined;
  return u ?? null;
}
export async function isAdmin() { return !!(await currentUser()); }
export async function requireAdmin(role?: Role): Promise<User> {
  const u = await currentUser();
  if (!u) throw new Error("Non autorizzato");
  if (role === "admin" && u.role !== "admin") throw new Error("Serve un account amministratore");
  return u;
}
export const sessionCookie = (value: string) => ({ name: "ld_admin", value, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL });

/** Registro attività dell'admin. */
export function logAction(u: User, action: string, target = "", href = "") {
  db().prepare("INSERT INTO log(who, action, target, href) VALUES(?,?,?,?)").run(u.name || u.email, action, target, href);
}
