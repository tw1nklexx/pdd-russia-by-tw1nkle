"use client";

import { useMemo, useState } from "react";

type PenaltyItem = {
  id: string;
  articlePart: string;
  text: string;
  penalty: string;
};

export function PenaltiesList({ penalties }: { penalties: PenaltyItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q)
      return penalties;
    return penalties.filter(
      (p) =>
        p.articlePart.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.penalty.toLowerCase().includes(q)
    );
  }, [query, penalties]);

  return (
    <>
      <div className="sticky top-14 z-10 bg-gray-50 py-2 sm:top-[4.5rem]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по статье или тексту..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Поиск по статье или тексту"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-900">Статья</th>
              <th className="px-4 py-3 font-medium text-gray-900">Описание</th>
              <th className="px-4 py-3 font-medium text-gray-900">Наказание</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-700">
                  {p.articlePart}
                </td>
                <td className="px-4 py-3 text-gray-700">{p.text}</td>
                <td className="px-4 py-3 text-gray-700">{p.penalty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="text-gray-500">Ничего не найдено.</p>
      )}
    </>
  );
}
