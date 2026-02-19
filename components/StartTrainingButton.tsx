"use client";

import { useTransition } from "react";
import { startTrainingAndRedirect } from "@/app/actions/session";

export function StartTrainingButton({ topicId }: { topicId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          startTrainingAndRedirect(topicId);
        });
      }}
      disabled={isPending}
      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Загрузка…" : "Тренировать вопросы по теме"}
    </button>
  );
}
