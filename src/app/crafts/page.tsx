import CraftCalculator from "@/components/crafts/CraftCalculator";

export const metadata = { title: "Crafts" };

export default function CraftsPage() {
  return (
    <section>
      <h1 className="text-3xl">Craft Calculator</h1>
      <p className="mt-2 mb-6 text-muted">
        Enter a recipe and your prices to see the real cost, the expected sales and the profit.
        The recipe browser comes later; for now you type the recipe yourself.
      </p>
      <CraftCalculator />
    </section>
  );
}
