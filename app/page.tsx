import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">Главная</h2>
        <p className="mt-2 text-gray-600">
          Выберите режим: тренировка по темам или экзамен.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/training"
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <span className="text-lg font-medium text-gray-900">Тренировка</span>
          <span className="mt-1 text-sm text-gray-500">
            Решайте вопросы по темам с подсказками и объяснениями
          </span>
        </Link>
        <Link
          href="/exam"
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
        >
          <span className="text-lg font-medium text-gray-900">Экзамен</span>
          <span className="mt-1 text-sm text-gray-500">
             Симулятор настоящего экзамена
          </span>
        </Link>
      </section>
    </div>
  );
}
