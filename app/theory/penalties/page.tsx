import { prisma } from "@/lib/prisma";
import { PenaltiesList } from "./PenaltiesList";

export const dynamic = "force-dynamic";

export default async function PenaltiesPage() {
  const penalties = await prisma.penalty.findMany({
    orderBy: { articlePart: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Штрафы</h2>
      <p className="text-gray-600">
        Статьи КоАП РФ и наказания за нарушения ПДД.
      </p>
      <PenaltiesList penalties={penalties} />
    </div>
  );
}
