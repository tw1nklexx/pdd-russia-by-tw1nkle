"use client";

export type OptionState = "default" | "selected" | "correct" | "incorrect" | "correctReveal" | "incorrectReveal";

const stateStyles: Record<OptionState, string> = {
  default:
    "border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50",
  selected:
    "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500",
  correct:
    "border-green-500 bg-green-50 text-green-900",
  incorrect:
    "border-red-500 bg-red-50 text-red-900",
  correctReveal:
    "border-green-500 bg-green-100 text-green-900",
  incorrectReveal:
    "border-red-500 bg-red-100 text-red-900",
};

export function OptionButton({
  text,
  state,
  disabled,
  onClick,
}: {
  text: string;
  state: OptionState;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition sm:py-4 sm:text-base disabled:cursor-not-allowed ${stateStyles[state]}`}
    >
      {text}
    </button>
  );
}
