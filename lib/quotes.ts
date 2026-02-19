/**
 * Server-only: loads exam quotes from JSON files.
 * Use in server components or server actions only.
 */

import { readFile } from "fs/promises";
import { join } from "path";

export type QuoteSet = "fail" | "pass";

const QUOTES_DIR = join(process.cwd(), "data", "quotes");

const FALLBACK_PASS: string[] = [
  "Сдано! Спокойствие и внимательность сделали своё дело.",
  "Отлично! Ты доказала себе, что можешь.",
  "Знания + практика = результат. Поздравляю!",
  "Это не удача — это подготовка.",
  "Сила в регулярности. Ты молодец!",
  "Чётко, спокойно, правильно — так держать!",
  "Каждая тренировка была не зря — вот доказательство.",
  "Сдано — значит, правила у тебя в голове на месте.",
];

const FALLBACK_FAIL: string[] = [
  "Ошибки — это плата за рост.",
  "Без попыток нет побед.",
  "Каждая ошибка — подсказка, где стать сильнее.",
  "Не сдал сейчас — сдашь позже, если не остановишься.",
  "Тяжело в учении — легко на дороге.",
  "Практика превращает страх в уверенность.",
  "Не получилось — значит, есть что улучшить.",
  "Лучше ошибиться здесь, чем на дороге. Учимся!",
];

function normalizeQuotes(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || !("quotes" in raw)) return [];
  const arr = (raw as { quotes: unknown }).quotes;
  if (!Array.isArray(arr)) return [];
  const seen = new Set<string>();
  return arr
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function tryReadQuotes(filename: string): Promise<string[]> {
  const path = join(QUOTES_DIR, filename);
  try {
    const content = await readFile(path, "utf-8");
    const parsed = JSON.parse(content) as unknown;
    const list = normalizeQuotes(parsed);
    if (list.length > 0) return list;
  } catch {
    // missing file or invalid JSON — use fallback
  }
  return [];
}

export async function loadExamQuotes(set: QuoteSet): Promise<string[]> {
  const filenames =
    set === "pass"
      ? ["pass-exam-quotes.json", "pass-exam-qoutes.json"]
      : ["fail-exam-quotes.json", "fail-exam-qoutes.json"];

  for (const filename of filenames) {
    const quotes = await tryReadQuotes(filename);
    if (quotes.length > 0) return quotes;
  }

  return set === "pass" ? FALLBACK_PASS : FALLBACK_FAIL;
}
