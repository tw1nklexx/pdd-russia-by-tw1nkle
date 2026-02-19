export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { SignsList } from "./SignsList";

export default async function SignsPage() {
  const signs = await prisma.sign.findMany({
    orderBy: [{ category: "asc" }, { code: "asc" }],
  });

  const byCategory = signs.reduce<Record<string, typeof signs>>((acc, sign) => {
    const c = sign.category || "Без категории";
    if (!acc[c]) acc[c] = [];
    acc[c].push(sign);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort();
  const categoryNames = [...new Set(signs.map((s) => s.category || "Без категории"))];
  const topics = await prisma.topic.findMany({
    where: { name: { in: categoryNames } },
    select: { id: true, name: true },
  });
  const topicIdByCategory: Record<string, string> = {};
  for (const t of topics) topicIdByCategory[t.name] = t.id;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Дорожные знаки</h2>
      <SignsList
        categories={categories}
        signsByCategory={byCategory}
        topicIdByCategory={topicIdByCategory}
      />
    </div>
  );
}
