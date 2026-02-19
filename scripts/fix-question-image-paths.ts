/**
 * One-time fix: normalize Question.imageUrl to /images/questions/<filename>
 * when the file exists under public/images/questions/. Null out "no image" sentinels.
 * Idempotent; safe to run multiple times.
 *
 * Run: npm run db:fix:questionImages
 */

import { access } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NO_IMAGE_SENTINELS = new Set([
  "./images/no_image.jpg",
  "images/no_image.jpg",
  "/images/no_image.jpg",
]);

function isNoImageSentinel(url: string): boolean {
  return NO_IMAGE_SENTINELS.has(url.trim());
}

function extractFilename(imageUrl: string): string {
  const u = imageUrl.trim().replace(/^\.\/+/, "");
  const parts = u.split("/");
  return parts[parts.length - 1] ?? u;
}

async function fileExists(relativePath: string): Promise<boolean> {
  const fullPath = join(process.cwd(), "public", relativePath.replace(/^\//, ""));
  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log("[fix-question-image-paths] Starting…");

  const questions = await prisma.question.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, externalId: true, imageUrl: true },
  });

  const totalWithImageUrl = questions.length;
  let updatedCount = 0;
  let nulledNoImageCount = 0;
  let missingFileCount = 0;
  const missingFileExamples: { externalId: string; oldImageUrl: string | null }[] = [];

  for (const q of questions) {
    const raw = q.imageUrl!.trim();
    if (isNoImageSentinel(raw)) {
      await prisma.question.update({
        where: { id: q.id },
        data: { imageUrl: null },
      });
      nulledNoImageCount++;
      continue;
    }

    const filename = extractFilename(raw);
    if (!filename) continue;

    const newUrl = `/images/questions/${filename}`;
    const relativePath = newUrl.startsWith("/") ? newUrl.slice(1) : newUrl;
    const exists = await fileExists(relativePath);

    if (exists) {
      await prisma.question.update({
        where: { id: q.id },
        data: { imageUrl: newUrl },
      });
      updatedCount++;
    } else {
      missingFileCount++;
      if (missingFileExamples.length < 10) {
        missingFileExamples.push({ externalId: q.externalId, oldImageUrl: q.imageUrl });
      }
    }
  }

  console.log("[fix-question-image-paths] totalWithImageUrl:", totalWithImageUrl);
  console.log("[fix-question-image-paths] updatedCount:", updatedCount);
  console.log("[fix-question-image-paths] nulledNoImageCount:", nulledNoImageCount);
  console.log("[fix-question-image-paths] missingFileCount:", missingFileCount);
  if (missingFileExamples.length > 0) {
    console.log("[fix-question-image-paths] Examples of missingFile (externalId + old imageUrl):");
    missingFileExamples.forEach((ex) =>
      console.log("  ", ex.externalId, ex.oldImageUrl)
    );
  }
  console.log("[fix-question-image-paths] Done.");
}

main()
  .catch((e) => {
    console.error("[fix-question-image-paths] Fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
