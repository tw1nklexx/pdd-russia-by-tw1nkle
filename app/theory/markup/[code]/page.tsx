import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export default async function MarkupDetailPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);

  const item = await prisma.markup.findUnique({
    where: { code: decoded },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-sm text-gray-500">{item.code}</span>
        <Link
          href="/theory/markup"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Вся разметка
        </Link>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{item.category}</h2>
      {item.imageUrl && (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="max-h-48 w-full max-w-[200px] rounded-lg object-contain"
          />
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="whitespace-pre-wrap text-gray-700">{item.description}</p>
      </div>
    </div>
  );
}
