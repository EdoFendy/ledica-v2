import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || "./data");
export const MEDIA_DIR = path.join(DATA_DIR, "media");

const g = globalThis as unknown as { __db?: Database.Database };

function open() {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "ledica.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      slug_it TEXT NOT NULL,
      slug_en TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'published',
      sort INTEGER NOT NULL DEFAULT 0,
      created TEXT NOT NULL DEFAULT (datetime('now')),
      updated TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(type, slug_it)
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created TEXT NOT NULL DEFAULT (datetime('now')),
      kind TEXT NOT NULL,
      lang TEXT NOT NULL,
      name TEXT, company TEXT, email TEXT, phone TEXT, country TEXT,
      message TEXT,
      data TEXT NOT NULL DEFAULT '{}',
      page TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT NOT NULL DEFAULT '',
      marketing INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file TEXT NOT NULL UNIQUE,
      alt_it TEXT NOT NULL DEFAULT '',
      alt_en TEXT NOT NULL DEFAULT '',
      size INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      provisional INTEGER NOT NULL DEFAULT 1,
      created TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS redirects (
      from_path TEXT PRIMARY KEY,
      to_path TEXT NOT NULL DEFAULT '',
      code INTEGER NOT NULL DEFAULT 301,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS todo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grp TEXT NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS rate (ip TEXT, ts INTEGER);
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'editor',
      hash TEXT NOT NULL,
      created TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL DEFAULT (datetime('now')),
      who TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT ''
    );
  `);
  return db;
}

export function db(): Database.Database {
  return (g.__db ??= open());
}

export function getSetting<T>(key: string, fallback: T): T {
  const r = db().prepare("SELECT value FROM settings WHERE key=?").get(key) as { value: string } | undefined;
  if (!r) return fallback;
  try { return JSON.parse(r.value) as T; } catch { return fallback; }
}
export function setSetting(key: string, value: unknown) {
  db().prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, JSON.stringify(value));
}
