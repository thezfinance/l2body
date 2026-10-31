import PriceLog from "@/components/market/PriceLog";

export const metadata = { title: "Market" };

export default function MarketPage() {
  return (
    <section>
      <h1 className="text-3xl">Market</h1>
      <p className="mt-2 mb-6 text-muted">
        Keep track of the adena price of any item, and see how it moves. The craft calculator can
        use these prices.
      </p>
      <PriceLog />
    </section>
  );
}
