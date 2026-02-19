import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StartTrainingButton } from "@/components/StartTrainingButton";

type Props = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export default async function SignDetailPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);

  const sign = await prisma.sign.findUnique({
    where: { code: decoded },
  });

  if (!sign) {
    notFound();
  }

  const topicByName = sign.category
    ? await prisma.topic.findUnique({ where: { name: sign.category }, select: { id: true } })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-sm text-gray-500">{sign.code}</span>
        <Link
          href="/theory/signs"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Все знаки
        </Link>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{sign.title}</h2>
      {sign.imageUrl && (
        <div className="flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sign.imageUrl}
            alt=""
            className="max-h-48 w-full max-w-[200px] rounded-lg object-contain"
          />
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="whitespace-pre-wrap text-gray-700">{sign.description}</p>
      </div>
      {topicByName && (
        <StartTrainingButton topicId={topicByName.id} />
      )}
    </div>
  );
}
