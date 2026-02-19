export const runtime = "nodejs";

import Link from "next/link";
import ExamStartButton from "./ExamStartButton";

export default function ExamPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Экзамен</h2>
      <p className="text-gray-600">
        Симулятор настоящего экзамена: 20 случайных вопросов, 20 минут, допускается 2 ошибки.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ExamStartButton />
        <Link
          href="/training"
          className="rounded-lg border-2 border-gray-300 px-6 py-2.5 text-center font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
        >
          Тренировка
        </Link>
      </div>
    </div>
  );
}
