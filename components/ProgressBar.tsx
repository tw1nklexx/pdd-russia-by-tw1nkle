"use client";

export type QuestionStatus = "unanswered" | "current" | "correct" | "incorrect";

const statusColors: Record<QuestionStatus, string> = {
  unanswered: "bg-gray-200",
  current: "bg-blue-500",
  correct: "bg-green-500",
  incorrect: "bg-red-500",
};

export function ProgressBar({
  currentIndex = 0,
  statuses,
  onSelectIndex,
  disabled = false,
}: {
  currentIndex?: number;
  statuses: QuestionStatus[];
  onSelectIndex?: (index: number) => void;
  disabled?: boolean;
}) {
  const isInteractive = onSelectIndex != null && !disabled;

  return (
    <div
      className="flex flex-wrap gap-1"
      role={isInteractive ? "navigation" : "progressbar"}
      aria-label={isInteractive ? "Навигация по вопросам" : "Прогресс по вопросам"}
      aria-valuenow={isInteractive ? undefined : statuses.filter((s) => s !== "unanswered").length}
      aria-valuemin={isInteractive ? undefined : 0}
      aria-valuemax={isInteractive ? undefined : statuses.length}
    >
      {statuses.map((status, index) => {
        const colorClass = statusColors[status] ?? statusColors.unanswered;
        const label = `Перейти к вопросу ${index + 1}`;

        if (isInteractive) {
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectIndex(index)}
              aria-label={label}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`h-2 min-w-[8px] flex-1 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 hover:opacity-90 sm:h-3 sm:min-w-[12px] ${colorClass}`}
            />
          );
        }

        return (
          <span
            key={index}
            className={`h-2 min-w-[8px] flex-1 rounded-full transition-colors sm:h-3 sm:min-w-[12px] ${colorClass}`}
            title={`Вопрос ${index + 1}: ${status === "unanswered" ? "без ответа" : status === "current" ? "текущий" : status === "correct" ? "верно" : "ошибка"}`}
          />
        );
      })}
    </div>
  );
}
