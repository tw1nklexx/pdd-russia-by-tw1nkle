"use client";

import { useState } from "react";

export function ExplanationPanel({ explanation }: { explanation: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!explanation || explanation.trim() === "") {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-t-xl px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-100"
      >
        {isOpen ? "Скрыть объяснение" : "Смотреть объяснение"}
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Объяснение</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
