import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { CollectionKey, DB, SiteSettings } from "./types";

/**
 * Tiny JSON-file database.
 * - Locally it persists to data/db.json (created from the seed on first run).
 * - On read-only hosts (e.g. serverless) it transparently falls back to memory.
 * Swap this module for Postgres/Mongo/Supabase later — the rest of the app only
 * talks to the functions exported below.
 */
const FILE = path.join(process.cwd(), "data", "db.json");

const g = globalThis as unknown as { __voyajDB?: DB; __voyajWritable?: boolean };

async function load(): Promise<DB> {
  if (g.__voyajDB) return g.__voyajDB;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    g.__voyajDB = mergeDefaults(JSON.parse(raw) as DB);
  } catch {
    g.__voyajDB = createSeed();
    await persist(g.__voyajDB);
  }
  return g.__voyajDB;
}

/** Make sure newly-added settings keys exist even in older db.json files. */
function mergeDefaults(db: DB): DB {
  const seed = createSeed();
  const s = db.settings ?? seed.settings;
  db.settings = {
    ...seed.settings,
    ...s,
    brand: { ...seed.settings.brand, ...s.brand },
    theme: { ...seed.settings.theme, ...s.theme },
    intro: { ...seed.settings.intro, ...s.intro },
    hero: { ...seed.settings.hero, ...s.hero },
    announcement: { ...seed.settings.announcement, ...s.announcement },
    sections: { ...seed.settings.sections, ...s.sections },
    seo: { ...seed.settings.seo, ...s.seo },
  };
  for (const k of Object.keys(seed) as (keyof DB)[]) {
    if (db[k] === undefined) (db as unknown as Record<string, unknown>)[k] = seed[k];
  }
  return db;
}

async function persist(db: DB) {
  if (g.__voyajWritable === false) return;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
    g.__voyajWritable = true;
  } catch {
    g.__voyajWritable = false; // read-only FS → keep data in memory
  }
}

export async function getDB(): Promise<DB> {
  return load();
}

export async function getSettings(): Promise<SiteSettings> {
  return (await load()).settings;
}

export async function saveSettings(next: SiteSettings) {
  const db = await load();
  db.settings = next;
  await persist(db);
  return db.settings;
}

export async function list<K extends CollectionKey>(key: K): Promise<DB[K]> {
  return (await load())[key];
}

export async function getOne<K extends CollectionKey>(key: K, id: string) {
  const items = (await load())[key] as { id: string }[];
  return items.find((i) => i.id === id) as DB[K][number] | undefined;
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function insert<K extends CollectionKey>(key: K, item: DB[K][number]) {
  const db = await load();
  (db[key] as DB[K][number][]).unshift(item);
  await persist(db);
  return item;
}

export async function update<K extends CollectionKey>(key: K, id: string, patch: Partial<DB[K][number]>) {
  const db = await load();
  const items = db[key] as { id: string }[];
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, id };
  await persist(db);
  return items[idx] as DB[K][number];
}

export async function remove(key: CollectionKey, id: string) {
  const db = await load();
  const items = db[key] as { id: string }[];
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  await persist(db);
  return true;
}

export async function resetDB() {
  g.__voyajDB = createSeed();
  await persist(g.__voyajDB);
  return g.__voyajDB;
}
