import Link from "next/link";
import RecipeBrowser from "@/components/crafts/RecipeBrowser";
import { getAllRecipes, toListItem } from "@/lib/recipes";

export const metadata = { title: "Crafts" };

export default function CraftsPage() {
  const recipes = getAllRecipes().map(toListItem);
  return (
    <section>
      <h1 className="text-3xl">Crafts</h1>
      <p className="mt-2 text-muted">
        Interlude recipes with a profit calculator. Pick a recipe, enter your prices, see your profit.
      </p>
      <p className="mt-2 mb-6 text-sm text-muted">
        Want to type a recipe yourself?{" "}
        <Link href="/crafts/calculator" className="text-gold-bright underline">
          Open the manual calculator
        </Link>
        .
      </p>
      <RecipeBrowser recipes={recipes} />
      <p className="mt-10 text-xs text-muted">
        Recipe data comes from the open-source L2J Mobius Interlude datapack. L2 Reborn may change
        some recipes, so double-check anything important in game.
      </p>
    </section>
  );
}
