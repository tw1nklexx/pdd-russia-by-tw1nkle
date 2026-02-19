import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { finishSession } from "@/app/actions/session";
import { loadExamQuotes } from "@/lib/quotes";
import { ResultsClient } from "./ResultsClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionResultsPage({ params }: Props) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      answerLogs: { select: { isCorrect: true } },
    },
  });

  if (!session) {
    notFound();
  }

  if (!session.finishedAt) {
    await finishSession(sessionId);
  }

  const correct = session.answerLogs.filter((l) => l.isCorrect).length;
  const total = session.answerLogs.length;
  const mistakes = total - correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const isExam = session.mode === "exam";
  const maxMistakes = session.maxMistakes ?? undefined;
  const durationSec = session.durationSec ?? undefined;
  const startedAt = session.startedAt;
  const finishedAt = session.finishedAt ?? new Date();
  const timeUsedSec =
    isExam && startedAt && finishedAt
      ? Math.min(
          Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000),
          durationSec ?? 0
        )
      : undefined;

  let examQuote: string | null = null;
  if (isExam && session.maxMistakes != null) {
    const passed = mistakes <= session.maxMistakes;
    const quotes = await loadExamQuotes(passed ? "pass" : "fail");
    examQuote =
      quotes.length > 0
        ? quotes[Math.floor(Math.random() * quotes.length)]
        : null;
  }

  return (
    <ResultsClient
      mode={session.mode}
      correct={correct}
      mistakes={mistakes}
      total={total}
      percent={percent}
      maxMistakes={maxMistakes}
      durationSec={durationSec}
      timeUsedSec={timeUsedSec}
      sessionId={sessionId}
      examQuote={examQuote}
    />
  );
}
