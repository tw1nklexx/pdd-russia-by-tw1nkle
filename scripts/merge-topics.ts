/**
 * Merge all topic JSON files in /data/topics/ into a single topics.json.
 * Extracts topic name from: { "name" }, { "topic" }, { "title" }, or from first question's topic[].
 * Output: { "topics": [ { "name": "..." }, ... ] } — deduplicated (case-insensitive), sorted.
 * Does NOT delete original files.
 *
 * Run: npm run merge-topics
 * Or:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/merge-topics.ts
 */

import { readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";

const TOPICS_DIR = join(process.cwd(), "data", "topics");
const OUTPUT_FILE = join(TOPICS_DIR, "topics.json");

function extractTopicName(
  parsed: unknown,
  filename: string
): string | null {
  if (parsed === null || typeof parsed !== "object") return null;

  // Simple object: { "name": "..." } | { "topic": "..." } | { "title": "..." }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.name === "string" && obj.name.trim()) return obj.name.trim();
  if (typeof obj.topic === "string" && obj.topic.trim()) return obj.topic.trim();
  if (typeof obj.title === "string" && obj.title.trim()) return obj.title.trim();

  // Array of questions with topic[] (e.g. [{ "topic": ["Общие положения"], ... }])
  if (Array.isArray(parsed) && parsed.length > 0) {
    const first = parsed[0] as Record<string, unknown> | null;
    if (first && typeof first === "object" && Array.isArray(first.topic) && first.topic.length > 0) {
      const name = first.topic[0];
      if (typeof name === "string" && name.trim()) return name.trim();
    }
  }

  // Fallback: filename without .json
  const base = filename.replace(/\.json$/i, "").trim();
  return base || null;
}

async function main(): Promise<void> {
  const entries = await readdir(TOPICS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json") && e.name !== "topics.json");
  const names = new Map<string, string>(); // lower -> original (for case-insensitive dedupe)

  for (const f of jsonFiles) {
    const path = join(TOPICS_DIR, f.name);
    let content: string;
    try {
      content = await readFile(path, "utf-8");
    } catch (err) {
      console.warn("[merge-topics] Skip (read error):", f.name, (err as Error).message);
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.warn("[merge-topics] Skip (invalid JSON):", f.name, (err as Error).message);
      continue;
    }
    const name = extractTopicName(parsed, f.name);
    if (!name) {
      console.warn("[merge-topics] Skip (no topic name):", f.name);
      continue;
    }
    const key = name.toLowerCase();
    if (!names.has(key)) names.set(key, name);
  }

  const topics = Array.from(names.values()).sort((a, b) => a.localeCompare(b, "ru"));
  const output = { topics: topics.map((name) => ({ name })) };

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log("[merge-topics] Wrote", OUTPUT_FILE, "with", topics.length, "topics.");
}

main().catch((e) => {
  console.error("[merge-topics] Fatal:", e);
  process.exit(1);
});
