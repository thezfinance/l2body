import { notFound } from "next/navigation";
import GuideBrowser from "@/components/guides/GuideBrowser";
import { CATEGORIES, getAllGuides, toMeta } from "@/lib/guides";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[category]">) {
  const { category } = await params;
  return { title: CATEGORIES[category]?.label ?? "Guides" };
}

export default async function CategoryPage({ params }: PageProps<"/guides/[category]">) {
  const { category } = await params;
  const cat = CATEGORIES[category];
  if (!cat) notFound();
  const guides = getAllGuides()
    .filter((g) => g.category === category)
    .map(toMeta);
  return (
    <section>
      <h1 className="text-3xl">{cat.label}</h1>
      <p className="mt-2 mb-6 text-muted">{cat.blurb}</p>
      <GuideBrowser guides={guides} categories={CATEGORIES} showCategoryFilter={false} />
    </section>
  );
}
