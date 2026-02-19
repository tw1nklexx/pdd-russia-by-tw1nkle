/**
 * Seed script: reads all ticket JSON files from data/tickets/ (Билет 1.json … Билет 40.json),
 * parses questions and options, and upserts into the database with transactions.
 * Safe to run multiple times (skips existing questions by externalId).
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TICKETS_DIR = join(process.cwd(), "data", "tickets");
const TICKET_FILE_PREFIX = "Билет ";
const TICKET_COUNT = 40;

// ——— Types for JSON (loose for resilience) ———

interface RawAnswer {
  answer_text?: string;
  is_correct?: boolean;
}

interface RawQuestion {
  id?: string;
  question?: string;
  image?: string | null;
  answer_tip?: string | null;
  answers?: RawAnswer[];
  topic?: string[] | null;
}

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function parseTicketFile(content: string): RawQuestion[] {
  const raw = JSON.parse(content) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.filter((q): q is RawQuestion => q != null && typeof q === "object");
}

function normalizeQuestion(raw: RawQuestion): {
  externalId: string;
  text: string;
  imageUrl: string | null;
  explanation: string | null;
  options: { text: string; isCorrect: boolean }[];
  topicNames: string[];
} | null {
  const externalId = raw.id;
  const text = raw.question;
  if (!isNonEmptyString(externalId) || !isNonEmptyString(text)) return null;

  const imageUrl =
    raw.image != null && typeof raw.image === "string" && raw.image.trim() !== ""
      ? raw.image.trim()
      : null;
  const explanation =
    raw.answer_tip != null && typeof raw.answer_tip === "string"
      ? raw.answer_tip.trim() || null
      : null;

  const answers = Array.isArray(raw.answers) ? raw.answers : [];
  const options = answers
    .map((a) => {
      const t =
        a?.answer_text != null && typeof a.answer_text === "string"
          ? a.answer_text.trim()
          : "";
      const isCorrect = Boolean(a?.is_correct);
      return t ? { text: t, isCorrect } : null;
    })
    .filter((o): o is { text: string; isCorrect: boolean } => o !== null);

  if (options.length === 0) return null;

  const topicNames = Array.isArray(raw.topic)
    ? raw.topic
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim())
    : [];

  return {
    externalId,
    text,
    imageUrl,
    explanation,
    options,
    topicNames,
  };
}

async function getTicketFilePaths(): Promise<string[]> {
  const entries = await readdir(TICKETS_DIR, { withFileTypes: true });
  const files: { index: number; path: string }[] = [];

  for (let i = 1; i <= TICKET_COUNT; i++) {
    const name = `${TICKET_FILE_PREFIX}${i}.json`;
    const found = entries.find((e) => e.isFile() && e.name === name);
    if (found) files.push({ index: i, path: join(TICKETS_DIR, found.name) });
  }

  return files
    .sort((a, b) => a.index - b.index)
    .map((f) => f.path);
}

async function main(): Promise<void> {
  console.log("[seed] Starting…");
  console.log("[seed] Tickets directory:", TICKETS_DIR);

  const paths = await getTicketFilePaths();
  if (paths.length === 0) {
    console.warn("[seed] No ticket files found (expected Билет 1.json … Билет 40.json). Exiting.");
    process.exit(1);
  }
  console.log("[seed] Found", paths.length, "ticket file(s).");

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < paths.length; i++) {
    const filePath = paths[i];
    const ticketLabel = filePath.split(/[/\\]/).pop() ?? filePath;

    try {
      const content = await readFile(filePath, "utf-8");
      const rawQuestions = parseTicketFile(content);
      console.log("[seed]", ticketLabel, "—", rawQuestions.length, "raw question(s)");

      for (const raw of rawQuestions) {
        totalProcessed++;
        const normalized = normalizeQuestion(raw);
        if (!normalized) {
          totalErrors++;
          continue;
        }

        const existing = await prisma.question.findUnique({
          where: { externalId: normalized.externalId },
          select: { id: true },
        });

        if (existing) {
          totalSkipped++;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const topicIds: string[] = [];
          for (const name of normalized.topicNames) {
            const topic = await tx.topic.upsert({
              where: { name },
              create: { name },
              update: {},
              select: { id: true },
            });
            topicIds.push(topic.id);
          }

          const question = await tx.question.create({
            data: {
              externalId: normalized.externalId,
              text: normalized.text,
              imageUrl: normalized.imageUrl,
              explanation: normalized.explanation,
              options: {
                create: normalized.options.map((o) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              },
              ...(topicIds.length > 0
                ? { topics: { connect: topicIds.map((id) => ({ id })) } }
                : {}),
            },
          });
          totalInserted++;
        });
      }
    } catch (err) {
      console.error("[seed] Error processing", ticketLabel, err);
      totalErrors += 1;
    }
  }

  console.log("[seed] Done.");
  console.log("[seed] Processed:", totalProcessed, "| Inserted:", totalInserted, "| Skipped (duplicates):", totalSkipped, "| Errors:", totalErrors);
}

main()
  .catch((e) => {
    console.error("[seed] Fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
