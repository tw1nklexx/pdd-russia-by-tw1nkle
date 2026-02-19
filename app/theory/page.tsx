export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";

export default function TheoryPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Теория</h2>
      <p className="text-gray-600">
        Дорожные знаки, разметка и штрафы для подготовки к экзамену.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link
            href="/theory/signs"
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-lg font-medium text-gray-900">Дорожные знаки</span>
            <span className="mt-1 text-sm text-gray-500">
              Описание и изображения знаков
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/theory/markup"
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-lg font-medium text-gray-900">Дорожная разметка</span>
            <span className="mt-1 text-sm text-gray-500">
              Горизонтальная и вертикальная разметка
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/theory/penalties"
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-lg font-medium text-gray-900">Штрафы</span>
            <span className="mt-1 text-sm text-gray-500">
              КоАП РФ — статьи и наказания
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
