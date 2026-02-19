"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal, ModalCloseButton } from "@/components/Modal";
import { StartTrainingButton } from "@/components/StartTrainingButton";

const DESCRIPTION_PREVIEW_LEN = 160;

type SignItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
};

function formatDescription(description: string): React.ReactNode {
  return description
    .split(/\n/)
    .filter((line) => line.trim())
    .map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {paragraph}
      </p>
    ));
}

function getAllSigns(signsByCategory: Record<string, SignItem[]>): SignItem[] {
  return Object.values(signsByCategory).flat();
}

export function SignsList({
  categories,
  signsByCategory,
  topicIdByCategory = {},
}: {
  categories: string[];
  signsByCategory: Record<string, SignItem[]>;
  topicIdByCategory?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const allSigns = useMemo(
    () => getAllSigns(signsByCategory),
    [signsByCategory]
  );
  const signByCode = useMemo(() => {
    const m: Record<string, SignItem> = {};
    for (const s of allSigns) m[s.code] = s;
    return m;
  }, [allSigns]);

  const code = searchParams.get("code");
  const selectedSign = code
    ? signByCode[decodeURIComponent(code)] ?? null
    : null;

  const openModal = useCallback(
    (sign: SignItem) => {
      router.push(`${pathname}?code=${encodeURIComponent(sign.code)}`, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { categories, signsByCategory };
    const byCat: Record<string, SignItem[]> = {};
    for (const cat of categories) {
      const list = (signsByCategory[cat] ?? []).filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
      if (list.length) byCat[cat] = list;
    }
    return { categories: Object.keys(byCat).sort(), signsByCategory: byCat };
  }, [query, categories, signsByCategory]);

  const topicId = selectedSign
    ? topicIdByCategory[selectedSign.category]
    : undefined;

  return (
    <>
      <div className="sticky top-14 z-10 bg-gray-50 py-2 sm:top-[4.5rem]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по коду или названию..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Поиск по коду или названию"
        />
      </div>
      <div className="space-y-8">
        {filtered.categories.map((category) => (
          <section key={category}>
            <h3 className="mb-4 text-lg font-medium text-gray-900">{category}</h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.signsByCategory[category]?.map((sign) => (
                <li key={sign.id}>
                  <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md">
                    {sign.imageUrl && (
                      <div className="flex min-h-[100px] items-center justify-center bg-gray-50 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sign.imageUrl}
                          alt=""
                          className="max-h-24 w-full max-w-[120px] object-contain"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <span className="font-mono text-sm text-gray-500">
                        {sign.code}
                      </span>
                      <span className="mt-1 font-medium text-gray-900">
                        {sign.title}
                      </span>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {sign.description.slice(0, DESCRIPTION_PREVIEW_LEN)}
                        {sign.description.length > DESCRIPTION_PREVIEW_LEN
                          ? "…"
                          : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => openModal(sign)}
                        className="mt-2 text-left text-sm font-medium text-blue-600 hover:underline"
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {filtered.categories.length === 0 && (
        <p className="text-gray-500">Ничего не найдено.</p>
      )}

      <Modal
        open={!!selectedSign}
        onClose={closeModal}
        ariaLabelledby="sign-modal-title"
        initialFocusRef={closeButtonRef}
      >
        {selectedSign && (
          <div className="max-h-[85vh] overflow-y-auto p-6">
            <h2
              id="sign-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {selectedSign.code} — {selectedSign.title}
            </h2>
            {selectedSign.imageUrl && (
              <div className="mt-4 flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSign.imageUrl}
                  alt=""
                  className="max-h-64 w-full max-w-full object-contain"
                />
              </div>
            )}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-700">
              {formatDescription(selectedSign.description)}
            </div>
            {topicId && (
              <div className="mt-4">
                <StartTrainingButton topicId={topicId} />
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <ModalCloseButton
                onClose={closeModal}
                buttonRef={closeButtonRef}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
