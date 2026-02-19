"use client";

import { useTransition } from "react";

type StartAction = (topicId: string) => Promise<never>;

export function TrainingTopicCard({
  topicId,
  name,
  questionCount,
  startAction,
}: {
  topicId: string;
  name: string;
  questionCount: number;
  startAction: StartAction;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(() => {
      startAction(topicId);
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="mt-1 text-sm text-gray-500">
        Вопросов: {questionCount}
      </p>
      <button
        type="button"
        onClick={handleStart}
        disabled={isPending || questionCount === 0}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Загрузка…" : "Начать тренировку"}
      </button>
    </div>
  );
}
