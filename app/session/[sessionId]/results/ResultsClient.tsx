"use client";

import Link from "next/link";
import { useTransition } from "react";
import { createMistakesTrainingFromSession } from "@/app/actions/session";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ResultsClient({
  mode,
  correct,
  mistakes,
  total,
  percent,
  maxMistakes,
  durationSec,
  timeUsedSec,
  sessionId,
  examQuote,
}: {
  mode: string;
  correct: number;
  mistakes: number;
  total: number;
  percent: number;
  maxMistakes?: number;
  durationSec?: number;
  timeUsedSec?: number;
  sessionId: string;
  examQuote?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isExam = mode === "exam";

  let title: string;
  if (isExam) {
    if (maxMistakes != null && mistakes > maxMistakes) {
      title = "Экзамен не сдан";
    } else if (maxMistakes != null && total < 20) {
      title = "Экзамен завершён";
    } else {
      title = "Экзамен сдан";
    }
  } else {
    title = "Тренировка завершена";
  }

  const hasMistakes = mistakes > 0;
  const handleMistakesReview = () => {
    startTransition(() => {
      createMistakesTrainingFromSession(sessionId);
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
        {title}
      </h2>
      {isExam && examQuote && (
        <blockquote className="rounded-xl bg-gray-50 px-4 py-5 text-center text-lg text-gray-700 sm:px-6 sm:py-6 sm:text-xl">
          {examQuote}
        </blockquote>
      )}
      <dl className="space-y-3">
        {isExam ? (
          <>
            <div className="flex justify-between">
              <dt className="text-gray-600">Правильных ответов:</dt>
              <dd className="font-medium text-gray-900">{correct} из 20</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Ошибок:</dt>
              <dd className="font-medium text-gray-900">{mistakes} из {maxMistakes ?? 2}</dd>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <dt className="text-gray-600">Правильных ответов:</dt>
              <dd className="font-medium text-gray-900">{correct}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Ошибок:</dt>
              <dd className="font-medium text-gray-900">{mistakes}</dd>
            </div>
          </>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-3">
          <dt className="text-gray-600">Процент:</dt>
          <dd className="font-medium text-gray-900">{percent}%</dd>
        </div>
        {isExam && durationSec != null && timeUsedSec != null && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Время:</dt>
            <dd className="font-medium text-gray-900">
              использовано {formatTime(timeUsedSec)} из {formatTime(durationSec)}
            </dd>
          </div>
        )}
      </dl>
      <div className="flex flex-col gap-3 pt-4">
        {isExam ? (
          <>
            <Link
              href="/exam"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Повторить экзамен
            </Link>
            {hasMistakes ? (
              <button
                type="button"
                onClick={handleMistakesReview}
                disabled={isPending}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
              >
                {isPending ? "Загрузка…" : "Разобрать ошибки"}
              </button>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Ошибок нет — разбор не нужен.
              </p>
            )}
          </>
        ) : (
          <Link
            href="/training"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
          >
            Начать новую тренировку
          </Link>
        )}
      </div>
    </div>
  );
}
