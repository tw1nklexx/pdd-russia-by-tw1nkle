/**
 * Seed theory data: signs, markup, penalties, optional topics.
 * Idempotent: uses upsert by unique code / (articlePart + text).
 * Run: npm run db:seed:theory
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_DIR = join(process.cwd(), "data");

function normalizeImageUrl(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string" || !raw.trim()) return null;
  const s = raw.trim().replace(/^\.\/images/, "/images");
  return s || null;
}

// ——— Signs: { "CategoryName": { "1.1": { number, title, image, description }, ... }, ... }
async function seedSigns(): Promise<number> {
  const path = join(DATA_DIR, "signs", "signs.json");
  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    console.warn("[seed-theory] signs.json not found, skipping signs.");
    return 0;
  }
  const raw = JSON.parse(content) as Record<string, Record<string, { number?: string; title?: string; image?: string; description?: string }>>;
  if (!raw || typeof raw !== "object") return 0;

  let count = 0;
  for (const [category, items] of Object.entries(raw)) {
    if (!items || typeof items !== "object") continue;
    for (const [code, item] of Object.entries(items)) {
      if (!item || typeof item !== "object") continue;
      const codeStr = (item.number ?? code).toString().trim();
      const title = (item.title ?? "").toString().trim();
      const description = (item.description ?? "").toString().trim();
      if (!codeStr) continue;
      const imageUrl = normalizeImageUrl(item.image);
      await prisma.sign.upsert({
        where: { code: codeStr },
        create: { code: codeStr, title, description, imageUrl, category: category.trim() || "Без категории" },
        update: { title, description, imageUrl, category: category.trim() || "Без категории" },
      });
      count++;
    }
  }
  return count;
}

// ——— Markup: same shape, no title
async function seedMarkup(): Promise<number> {
  const path = join(DATA_DIR, "markup", "markup.json");
  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    console.warn("[seed-theory] markup.json not found, skipping markup.");
    return 0;
  }
  const raw = JSON.parse(content) as Record<string, Record<string, { number?: string; image?: string; description?: string }>>;
  if (!raw || typeof raw !== "object") return 0;

  let count = 0;
  for (const [category, items] of Object.entries(raw)) {
    if (!items || typeof items !== "object") continue;
    for (const [code, item] of Object.entries(items)) {
      if (!item || typeof item !== "object") continue;
      const codeStr = (item.number ?? code).toString().trim();
      const description = (item.description ?? "").toString().trim();
      if (!codeStr) continue;
      const imageUrl = normalizeImageUrl(item.image);
      await prisma.markup.upsert({
        where: { code: codeStr },
        create: { code: codeStr, description, imageUrl, category: category.trim() || "Без категории" },
        update: { description, imageUrl, category: category.trim() || "Без категории" },
      });
      count++;
    }
  }
  return count;
}

// ——— Penalties: JSONL (one object per line)
async function seedPenalties(): Promise<number> {
  const path = join(DATA_DIR, "penalties", "penalties.json");
  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    console.warn("[seed-theory] penalties.json not found, skipping penalties.");
    return 0;
  }
  const lines = content.split("\n").filter((l) => l.trim());
  let count = 0;
  for (const line of lines) {
    let item: { article_part?: string; text?: string; penalty?: string };
    try {
      item = JSON.parse(line) as typeof item;
    } catch {
      continue;
    }
    const articlePart = (item.article_part ?? "").toString().trim();
    const text = (item.text ?? "").toString().trim();
    const penalty = (item.penalty ?? "").toString().trim();
    if (!articlePart || !text) continue;
    try {
      await prisma.penalty.upsert({
        where: { articlePart_text: { articlePart, text } },
        create: { articlePart, text, penalty },
        update: { penalty },
      });
      count++;
    } catch (e) {
      // duplicate (articlePart, text) with different casing or same line twice
      console.warn("[seed-theory] Skip penalty:", articlePart, (e as Error).message);
    }
  }
  return count;
}

// ——— Topics: optional topics.json (array of names or array of { name })
async function seedTopics(): Promise<number> {
  const path = join(DATA_DIR, "topics", "topics.json");
  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    return 0;
  }
  const raw = JSON.parse(content) as unknown;
  const names: string[] = [];
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (typeof x === "string" && x.trim()) names.push(x.trim());
      else if (x && typeof x === "object" && "name" in x && typeof (x as { name: string }).name === "string")
        names.push((x as { name: string }).name.trim());
    }
  } else if (raw && typeof raw === "object" && "topics" in raw && Array.isArray((raw as { topics: string[] }).topics)) {
    for (const x of (raw as { topics: string[] }).topics) {
      if (typeof x === "string" && x.trim()) names.push(x.trim());
    }
  }
  let count = 0;
  for (const name of [...new Set(names)]) {
    if (!name) continue;
    await prisma.topic.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    count++;
  }
  return count;
}

async function main(): Promise<void> {
  console.log("[seed-theory] Starting…");
  const signsCount = await seedSigns();
  console.log("[seed-theory] Seeded", signsCount, "signs");
  const markupCount = await seedMarkup();
  console.log("[seed-theory] Seeded", markupCount, "markup items");
  const penaltiesCount = await seedPenalties();
  console.log("[seed-theory] Seeded", penaltiesCount, "penalties");
  const topicsCount = await seedTopics();
  console.log("[seed-theory] Seeded", topicsCount, "topics (optional)");
  console.log("[seed-theory] Done.");
}

main()
  .catch((e) => {
    console.error("[seed-theory] Fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
