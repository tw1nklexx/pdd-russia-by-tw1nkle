export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { startTrainingAndRedirect } from "@/app/actions/session";
import { TrainingTopicCard } from "./TrainingTopicCard";

export default async function TrainingPage() {
  const prisma = getPrisma();
  const topics = await prisma.topic.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Тренировка</h2>
      <p className="text-gray-600">
        Выберите тему и решайте 20 случайных вопросов с подсказками.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <li key={topic.id}>
            <TrainingTopicCard
              topicId={topic.id}
              name={topic.name}
              questionCount={topic._count.questions}
              startAction={startTrainingAndRedirect}
            />
          </li>
        ))}
      </ul>
      {topics.length === 0 && (
        <p className="text-gray-500">Нет доступных тем. Запустите сид базы данных.</p>
      )}
    </div>
  );
}
