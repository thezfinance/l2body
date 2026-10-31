"use client";

import { Plus, Trash2 } from "lucide-react";
import { adena, calculateCraft, type CalcState, type Material } from "@/lib/crafts";
import { latestPrice, type PriceEntry } from "@/lib/market";
import { useLocalStorage } from "@/lib/useLocalStorage";

const NO_PRICES: PriceEntry[] = [];

const inputClass =
  "w-full rounded-md border border-panel-edge bg-ink px-3 py-2 text-sm placeholder:text-muted focus:border-gold focus:outline-none";

function NumberInput({
  value,
  onChange,
  label,
  min = 0,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      min={min}
      max={max}
      value={value === 0 ? "" : value}
      placeholder="0"
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      className={inputClass}
    />
  );
}

export default function CraftCalculator({
  storageKey,
  initial,
}: {
  storageKey: string; // where this calculator saves its numbers in the browser
  initial: CalcState;
}) {
  const [s, setS] = useLocalStorage<CalcState>(storageKey, initial);
  const [prices] = useLocalStorage<PriceEntry[]>("l2body:prices", NO_PRICES);
  const result = calculateCraft(s);

  const setMaterial = (i: number, patch: Partial<Material>) =>
    setS({ ...s, materials: s.materials.map((m, j) => (j === i ? { ...m, ...patch } : m)) });

  const fillFromMarket = () =>
    setS({
      ...s,
      productPrice: latestPrice(prices, s.productName) ?? s.productPrice,
      materials: s.materials.map((m) => ({ ...m, price: latestPrice(prices, m.name) ?? m.price })),
    });

  const profitClass = result.expectedProfitPerAttempt >= 0 ? "text-gold-bright" : "text-blood";

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        <section className="rounded-lg border border-panel-edge bg-panel p-5">
          <h2 className="text-lg">Product</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-muted sm:col-span-2">
              Item name
              <input
                value={s.productName}
                onChange={(e) => setS({ ...s, productName: e.target.value })}
                placeholder="What you craft"
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-sm text-muted">
              Success chance (%)
              <div className="mt-1">
                <NumberInput label="Success chance" value={s.successRate} max={100} onChange={(n) => setS({ ...s, successRate: n })} />
              </div>
            </label>
            <label className="text-sm text-muted">
              Items per success
              <div className="mt-1">
                <NumberInput label="Items per success" value={s.productCount} min={1} onChange={(n) => setS({ ...s, productCount: n })} />
              </div>
            </label>
            <label className="text-sm text-muted">
              Selling price (adena each)
              <div className="mt-1">
                <NumberInput label="Selling price" value={s.productPrice} onChange={(n) => setS({ ...s, productPrice: n })} />
              </div>
            </label>
            <label className="text-sm text-muted">
              Crafts planned
              <div className="mt-1">
                <NumberInput label="Crafts planned" value={s.attempts} min={1} onChange={(n) => setS({ ...s, attempts: n })} />
              </div>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-panel-edge bg-panel p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg">Materials</h2>
            <button
              onClick={fillFromMarket}
              className="rounded-md border border-panel-edge px-3 py-1 text-xs text-muted hover:border-gold hover:text-gold-bright"
            >
              Fill prices from Market
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {s.materials.map((m, i) => (
              <li key={i} className="grid grid-cols-[1fr_5rem_7rem_auto] items-center gap-2">
                <input
                  aria-label={`Material ${i + 1} name`}
                  value={m.name}
                  onChange={(e) => setMaterial(i, { name: e.target.value })}
                  placeholder="Material"
                  className={inputClass}
                />
                <NumberInput label={`Material ${i + 1} quantity`} value={m.qty} min={1} onChange={(n) => setMaterial(i, { qty: n })} />
                <NumberInput label={`Material ${i + 1} price each`} value={m.price} onChange={(n) => setMaterial(i, { price: n })} />
                <button
                  aria-label={`Remove material ${i + 1}`}
                  onClick={() => setS({ ...s, materials: s.materials.filter((_, j) => j !== i) })}
                  className="rounded-md p-2 text-muted hover:text-blood"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Columns: name, quantity, price each (adena).</p>
          <button
            onClick={() => setS({ ...s, materials: [...s.materials, { name: "", qty: 1, price: 0 }] })}
            className="mt-3 inline-flex items-center gap-1 rounded-md border border-panel-edge px-3 py-1.5 text-sm hover:border-gold"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add material
          </button>
        </section>
      </div>

      <aside className="h-fit rounded-lg border border-gold/40 bg-panel p-5 lg:sticky lg:top-4">
        <h2 className="text-lg">Result</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Materials per craft" value={`${adena(result.costPerAttempt)} adena`} />
          <Row
            label="Real cost per item"
            value={result.expectedCostPerItem === null ? "no chance" : `${adena(result.expectedCostPerItem)} adena`}
          />
          <Row label="Expected sales per craft" value={`${adena(result.expectedRevenuePerAttempt)} adena`} />
          <div className="flex items-baseline justify-between gap-3 border-t border-panel-edge pt-2">
            <dt className="text-muted">Profit per craft</dt>
            <dd className={`text-lg ${profitClass}`}>{adena(result.expectedProfitPerAttempt)} adena</dd>
          </div>
          <Row
            label="Margin"
            value={result.marginPercent === null ? "n/a" : `${result.marginPercent.toFixed(1)}%`}
          />
          <Row label={`Total cost (${s.attempts || 0} crafts)`} value={`${adena(result.totalCost)} adena`} />
          <Row label="Total profit" value={`${adena(result.totalProfit)} adena`} />
        </dl>
        <p className="mt-4 text-xs text-muted">
          A failed craft is assumed to use up its materials. Results are averages over many crafts.
          Your entries are saved in this browser only.
        </p>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
