"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

function shuffle<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function createTrainingSession(topicId: string): Promise<string> {
  const prisma = getPrisma();
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { questions: true },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const questionIds = topic.questions.map((q) => q.id);
  const selected =
    questionIds.length <= 20
      ? shuffle(questionIds)
      : shuffle(questionIds).slice(0, 20);

  const session = await prisma.session.create({
    data: {
      mode: "training",
      sessionQuestions: {
        create: selected.map((questionId, orderIndex) => ({
          questionId,
          orderIndex,
        })),
      },
    },
  });

  revalidatePath("/training");
  return session.id;
}

const EXAM_DURATION_SEC = 1200;
const EXAM_MAX_MISTAKES = 2;
const EXAM_QUESTION_COUNT = 20;

export async function createExamSession(): Promise<string> {
  const prisma = getPrisma();
  const all = await prisma.question.findMany({
    select: { id: true },
  });
  const ids = all.map((q) => q.id);
  const selected =
    ids.length <= EXAM_QUESTION_COUNT
      ? shuffle(ids)
      : shuffle(ids).slice(0, EXAM_QUESTION_COUNT);

  const session = await prisma.session.create({
    data: {
      mode: "exam",
      durationSec: EXAM_DURATION_SEC,
      maxMistakes: EXAM_MAX_MISTAKES,
      sessionQuestions: {
        create: selected.map((questionId, orderIndex) => ({
          questionId,
          orderIndex,
        })),
      },
    },
  });

  revalidatePath("/exam");
  return session.id;
}

export async function getExamRemainingSeconds(sessionId: string): Promise<number> {
  const prisma = getPrisma();
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { mode: true, startedAt: true, durationSec: true, finishedAt: true },
  });
  if (!session || session.mode !== "exam" || session.finishedAt || session.durationSec == null) {
    return 0;
  }
  const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  return Math.max(0, session.durationSec - elapsed);
}

export type SubmitAnswerResult = {
  isCorrect: boolean;
  mistakesCount?: number;
  isFinished?: boolean;
  reason?: "time" | "mistakes";
};

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  optionId: string
): Promise<SubmitAnswerResult> {
  const prisma = getPrisma();
  const option = await prisma.option.findFirst({
    where: { id: optionId, questionId },
  });

  if (!option) {
    throw new Error("Option not found");
  }

  await prisma.answerLog.create({
    data: {
      sessionId,
      questionId,
      selectedOptionId: optionId,
      isCorrect: option.isCorrect,
    },
  });

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { mode: true, maxMistakes: true },
  });

  if (session?.mode === "exam" && session.maxMistakes != null) {
    const logs = await prisma.answerLog.findMany({
      where: { sessionId },
      select: { isCorrect: true },
    });
    const mistakesCount = logs.filter((l) => !l.isCorrect).length;
    if (mistakesCount > session.maxMistakes) {
      await finishSession(sessionId, "mistakes");
      return {
        isCorrect: option.isCorrect,
        mistakesCount,
        isFinished: true,
        reason: "mistakes",
      };
    }
    return {
      isCorrect: option.isCorrect,
      mistakesCount,
      isFinished: false,
    };
  }

  return { isCorrect: option.isCorrect };
}

export async function finishSession(
  sessionId: string,
  reason?: "time" | "mistakes"
): Promise<void> {
  const prisma = getPrisma();
  const logs = await prisma.answerLog.findMany({
    where: { sessionId },
    select: { isCorrect: true },
  });

  const correct = logs.filter((l) => l.isCorrect).length;
  const mistakesCount = logs.filter((l) => !l.isCorrect).length;

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      finishedAt: new Date(),
      score: correct,
      mistakesCount,
    },
  });

  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/session/${sessionId}/results`);
}

export async function startTrainingAndRedirect(topicId: string): Promise<never> {
  const sessionId = await createTrainingSession(topicId);
  redirect(`/session/${sessionId}`);
}

export async function startExamAndRedirect(): Promise<never> {
  const sessionId = await createExamSession();
  redirect(`/session/${sessionId}`);
}

export async function createMistakesTrainingFromSession(
  sourceSessionId: string
): Promise<never> {
  const prisma = getPrisma();
  const wrongLogs = await prisma.answerLog.findMany({
    where: { sessionId: sourceSessionId, isCorrect: false },
    select: { questionId: true },
    orderBy: { answeredAt: "asc" },
  });
  const questionIds = [...new Set(wrongLogs.map((l) => l.questionId))];
  if (questionIds.length === 0) {
    redirect(`/session/${sourceSessionId}/results`);
  }
  const session = await prisma.session.create({
    data: {
      mode: "training",
      sessionQuestions: {
        create: questionIds.map((questionId, orderIndex) => ({
          questionId,
          orderIndex,
        })),
      },
    },
  });
  revalidatePath("/training");
  redirect(`/session/${session.id}`);
}
