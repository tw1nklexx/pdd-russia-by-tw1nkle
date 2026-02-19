import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Подготовка к экзамену ПДД",
  description: "Тренировка и экзамен по правилам дорожного движения",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-lg font-semibold sm:text-xl">
              Подготовка к экзамену ПДД
            </h1>
            <nav className="flex flex-wrap gap-2 sm:gap-4" aria-label="Основная навигация">
              <a
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Главная
              </a>
              <a
                href="/theory"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Теория
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
