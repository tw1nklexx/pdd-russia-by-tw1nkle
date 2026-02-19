"use client";

import { useState } from "react";
import { OptionButton, type OptionState } from "./OptionButton";
import { ExplanationPanel } from "./ExplanationPanel";

function normalizeImageSrc(raw: string): string {
  const u = (raw ?? "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  if (u.startsWith("/")) return u;

  let s = u.replace(/^\.\/+/, "");
  if (s.startsWith("images/")) return `/${s}`;
  return `/${s}`;
}

export type OptionItem = {
  id: string;
  text: string;
  state: OptionState;
};

let devImageLogged = false;

export function QuestionCard({
  questionText,
  imageUrl,
  explanation,
  options,
  onSelectOption,
  disabled,
}: {
  questionText: string;
  imageUrl: string | null;
  explanation: string | null;
  options: OptionItem[];
  onSelectOption: (optionId: string) => void;
  disabled: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const raw = (imageUrl ?? "").trim();
  const isSentinel =
    raw === "./images/no_image.jpg" || raw === "images/no_image.jpg";
  const src = raw && !isSentinel ? normalizeImageSrc(imageUrl!) : "";

  if (process.env.NODE_ENV !== "production" && src) {
    if (!devImageLogged) {
      devImageLogged = true;
      console.log("[Question image src]", { raw: imageUrl, src });
    }
  }

  return (
    <article className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 sm:text-xl">
        {questionText}
      </h3>
      {src && !imageFailed && (
        <div className="overflow-hidden rounded-lg bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Изображение к вопросу"
            className="w-full h-auto max-w-full object-contain rounded-lg"
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
      {src && imageFailed && (
        <div className="text-sm text-gray-500 opacity-90">
          <p>Изображение не загрузилось.</p>
          {process.env.NODE_ENV !== "production" && (
            <>
              <p className="mt-1">Путь: {src}</p>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-blue-600 underline hover:text-blue-700"
              >
                Открыть изображение
              </a>
            </>
          )}
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {options.map((opt) => (
          <li key={opt.id}>
            <OptionButton
              text={opt.text}
              state={opt.state}
              disabled={disabled}
              onClick={() => onSelectOption(opt.id)}
            />
          </li>
        ))}
      </ul>
      <ExplanationPanel explanation={explanation} />
    </article>
  );
}
