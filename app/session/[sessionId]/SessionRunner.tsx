"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar, type QuestionStatus } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import type { OptionItem } from "@/components/QuestionCard";
import {
  submitAnswer,
  finishSession,
  getExamRemainingSeconds,
  type SubmitAnswerResult,
} from "@/app/actions/session";

type QuestionData = {
  id: string;
  text: string;
  imageUrl: string | null;
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean }[];
};

type AnswerState = { selectedOptionId: string; isCorrect: boolean };

const EXAM_SYNC_INTERVAL_MS = 12_000; // re-sync with server every 12s

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SessionRunner({
  sessionId,
  mode,
  durationSec,
  maxMistakes,
  questions,
  initialAnswers,
}: {
  sessionId: string;
  mode: string;
  durationSec?: number;
  maxMistakes?: number;
  questions: QuestionData[];
  initialAnswers: Record<string, AnswerState>;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    mode === "exam" && durationSec != null ? durationSec : null
  );
  const [mistakesCount, setMistakesCount] = useState(() =>
    mode === "exam" ? Object.values(initialAnswers).filter((a) => !a.isCorrect).length : 0
  );
  const [examFinished, setExamFinished] = useState(false);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExam = mode === "exam";

  // Timer: fetch remaining on mount and re-sync periodically
  useEffect(() => {
    if (!isExam || durationSec == null) return;

    let mounted = true;

    const sync = async () => {
      const remaining = await getExamRemainingSeconds(sessionId);
      if (!mounted) return;
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        await finishSession(sessionId, "time");
        router.push(`/session/${sessionId}/results`);
      }
    };

    sync();

    syncRef.current = setInterval(sync, EXAM_SYNC_INTERVAL_MS);
    return () => {
      mounted = false;
      if (syncRef.current) clearInterval(syncRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isExam, durationSec, sessionId, router]);

  // Client tick: decrement every second when in exam
  useEffect(() => {
    if (!isExam || remainingSeconds === null) return;
    if (remainingSeconds <= 0) return;

    tickRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev == null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isExam, remainingSeconds]);

  // When remaining hits 0 (client-side), finish and redirect
  useEffect(() => {
    if (!isExam || remainingSeconds !== 0) return;
    finishSession(sessionId, "time").then(() => {
      router.push(`/session/${sessionId}/results`);
    });
  }, [isExam, remainingSeconds, sessionId, router]);

  const statuses: QuestionStatus[] = questions.map((q) => {
    const a = answers[q.id];
    if (!a) return "unanswered";
    return a.isCorrect ? "correct" : "incorrect";
  });
  statuses[currentIndex] = statuses[currentIndex] === "unanswered" ? "current" : statuses[currentIndex];

  const current = questions[currentIndex];
  const currentAnswer = current ? answers[current.id] : null;
  const isAnswered = Boolean(currentAnswer);
  const isLastQuestion = currentIndex === questions.length - 1;
  const locked = isAnswered || submitting;

  const getOptionState = useCallback(
    (q: QuestionData, optionId: string): OptionItem["state"] => {
      const a = answers[q.id];
      if (!a) return "default";
      if (a.selectedOptionId !== optionId) {
        if (!locked) return "default";
        const opt = q.options.find((o) => o.id === optionId);
        if (opt?.isCorrect) return "correctReveal";
        return "default";
      }
      return a.isCorrect ? "correct" : "incorrect";
    },
    [answers, locked]
  );

  const handleSelectIndex = useCallback(
    (index: number) => {
      if (submitting || examFinished) return;
      if (index < 0 || index >= questions.length) return;
      setCurrentIndex(index);
    },
    [submitting, examFinished, questions.length]
  );

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!current || locked || submitting || examFinished) return;
      setSubmitting(true);
      try {
        const result: SubmitAnswerResult = await submitAnswer(sessionId, current.id, optionId);
        setAnswers((prev) => ({
          ...prev,
          [current.id]: { selectedOptionId: optionId, isCorrect: result.isCorrect },
        }));
        if (result.mistakesCount !== undefined) setMistakesCount(result.mistakesCount);
        if (result.isFinished && result.reason) {
          setExamFinished(true);
          router.push(`/session/${sessionId}/results`);
          return;
        }
        if (!isExam && isLastQuestion) {
          await finishSession(sessionId);
          router.push(`/session/${sessionId}/results`);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [sessionId, current, locked, submitting, isLastQuestion, isExam, examFinished, router]
  );

  const goNext = useCallback(() => {
    if (examFinished) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (isLastQuestion && isAnswered && !isExam) {
      router.push(`/session/${sessionId}/results`);
    } else if (isLastQuestion && isAnswered && isExam) {
      finishSession(sessionId).then(() => router.push(`/session/${sessionId}/results`));
    }
  }, [currentIndex, questions.length, isLastQuestion, isAnswered, isExam, examFinished, sessionId, router]);

  if (questions.length === 0) {
    return (
      <p className="text-gray-500">В этой сессии нет вопросов.</p>
    );
  }

  const optionItems: OptionItem[] = current.options.map((o) => ({
    id: o.id,
    text: o.text,
    state: getOptionState(current, o.id),
  }));

  return (
    <div className="space-y-6">
      {isExam && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="font-medium text-gray-900">Экзамен</span>
          <div className="flex items-center gap-4">
            {remainingSeconds !== null && (
              <span className="text-sm text-gray-600">
                Осталось: {formatTime(remainingSeconds)}
              </span>
            )}
            {maxMistakes != null && (
              <span className="text-sm text-gray-600">
                Ошибки: {mistakesCount} из {maxMistakes}
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-600">
          Вопрос {currentIndex + 1} из {questions.length}
        </p>
        <ProgressBar
          currentIndex={currentIndex}
          statuses={statuses}
          onSelectIndex={handleSelectIndex}
          disabled={examFinished || submitting}
        />
      </div>

      <QuestionCard
        questionText={current.text}
        imageUrl={current.imageUrl}
        explanation={current.explanation}
        options={optionItems}
        onSelectOption={handleSelectOption}
        disabled={locked || submitting || examFinished}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={goNext}
          disabled={!isAnswered || examFinished}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion && isAnswered
            ? "К результатам"
            : "Следующий вопрос"}
        </button>
      </div>
    </div>
  );
}
