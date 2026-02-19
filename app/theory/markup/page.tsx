import { prisma } from "@/lib/prisma";
import { MarkupList } from "./MarkupList";

export const dynamic = "force-dynamic";

export default async function MarkupPage() {
  const items = await prisma.markup.findMany({
    orderBy: [{ category: "asc" }, { code: "asc" }],
  });

  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    const c = item.category || "Без категории";
    if (!acc[c]) acc[c] = [];
    acc[c].push(item);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Дорожная разметка</h2>
      <MarkupList categories={categories} itemsByCategory={byCategory} />
    </div>
  );
}
