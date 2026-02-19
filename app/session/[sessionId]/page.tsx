export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const generateStaticParams = async () => [];

import { unstable_noStore as noStore } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SessionRunner } from "./SessionRunner";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionPage({ params }: Props) {
  noStore();
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      sessionQuestions: {
        orderBy: { orderIndex: "asc" },
        include: {
          question: {
            include: { options: true },
          },
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  if (session.finishedAt) {
    redirect(`/session/${sessionId}/results`);
  }

  const questions = session.sessionQuestions.map((sq) => ({
    id: sq.question.id,
    text: sq.question.text,
    imageUrl: sq.question.imageUrl,
    explanation: sq.question.explanation,
    options: sq.question.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
    })),
  }));

  const answerLogs = await prisma.answerLog.findMany({
    where: { sessionId },
    select: { questionId: true, selectedOptionId: true, isCorrect: true },
  });

  const answersByQuestion = new Map(
    answerLogs.map((a) => [a.questionId, { selectedOptionId: a.selectedOptionId, isCorrect: a.isCorrect }])
  );

  return (
    <SessionRunner
      sessionId={sessionId}
      mode={session.mode}
      durationSec={session.durationSec ?? undefined}
      maxMistakes={session.maxMistakes ?? undefined}
      questions={questions}
      initialAnswers={Object.fromEntries(answersByQuestion)}
    />
  );
}
