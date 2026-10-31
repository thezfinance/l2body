import Link from "next/link";
import CraftCalculator from "@/components/crafts/CraftCalculator";
import { EMPTY_CALC } from "@/lib/crafts";

export const metadata = { title: "Manual Craft Calculator" };

export default function ManualCalculatorPage() {
  return (
    <section>
      <p className="text-sm text-muted">
        <Link href="/crafts" className="hover:text-gold-bright">
          Crafts
        </Link>
      </p>
      <h1 className="mt-2 text-3xl">Manual Calculator</h1>
      <p className="mt-2 mb-6 text-muted">
        Type any recipe and your prices to see the real cost, the expected sales and the profit.
      </p>
      <CraftCalculator storageKey="l2body:calc" initial={EMPTY_CALC} />
    </section>
  );
}
