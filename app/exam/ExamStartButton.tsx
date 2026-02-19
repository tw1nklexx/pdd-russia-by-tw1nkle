"use client";

import { useTransition } from "react";
import { startExamAndRedirect } from "@/app/actions/session";

export default function ExamStartButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => startExamAndRedirect())}
      disabled={isPending}
      className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Загрузка…" : "Начать экзамен"}
    </button>
  );
}
