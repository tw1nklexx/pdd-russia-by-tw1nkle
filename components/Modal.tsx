"use client";

import { useCallback, useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  ariaLabelledby,
  initialFocusRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabelledby: string;
  initialFocusRef?: React.RefObject<HTMLButtonElement | HTMLAnchorElement | null>;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusTimer = requestAnimationFrame(() => {
      initialFocusRef?.current?.focus();
    });
    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({
  onClose,
  buttonRef,
  className = "",
}: {
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClose}
      className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      Закрыть
    </button>
  );
}
