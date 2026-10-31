import Link from "next/link";
import { notFound } from "next/navigation";
import CraftCalculator from "@/components/crafts/CraftCalculator";
import { getAllRecipes, getRecipe, toCalcState } from "@/lib/recipes";

export function generateStaticParams() {
  return getAllRecipes().map((r) => ({ id: String(r.id) }));
}

export async function generateMetadata({ params }: PageProps<"/crafts/[id]">) {
  const { id } = await params;
  const recipe = getRecipe(Number(id));
  return recipe ? { title: `${recipe.product.name} recipe` } : {};
}

export default async function RecipePage({ params }: PageProps<"/crafts/[id]">) {
  const { id } = await params;
  const recipe = getRecipe(Number(id));
  if (!recipe) notFound();

  const facts: [string, string][] = [
    ["Type", recipe.type === "dwarven" ? "Dwarven craft" : "Common craft"],
    ["Craft level", String(recipe.level)],
    ["Success chance", `${recipe.successRate}%`],
    ["MP used", String(recipe.mp)],
    ["Makes", `${recipe.product.count} x ${recipe.product.name}`],
  ];

  return (
    <section>
      <p className="text-sm text-muted">
        <Link href="/crafts" className="hover:text-gold-bright">
          Crafts
        </Link>
      </p>
      <h1 className="mt-2 text-3xl">{recipe.product.name}</h1>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-panel-edge bg-panel p-4 text-sm sm:max-w-md">
        {facts.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 mb-4 text-xl">Profit calculator</h2>
      <CraftCalculator storageKey={`l2body:calc:${recipe.id}`} initial={toCalcState(recipe)} />
    </section>
  );
}
