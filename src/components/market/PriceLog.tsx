"use client";

import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { adena } from "@/lib/crafts";
import { summarize, type PriceEntry } from "@/lib/market";
import { useLocalStorage } from "@/lib/useLocalStorage";

const NO_ENTRIES: PriceEntry[] = [];
const inputClass =
  "w-full rounded-md border border-panel-edge bg-ink px-3 py-2 text-sm placeholder:text-muted focus:border-gold focus:outline-none";

export default function PriceLog() {
  const [entries, setEntries] = useLocalStorage<PriceEntry[]>("l2body:prices", NO_ENTRIES);
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");

  const summaries = summarize(entries);
  const recent = [...entries].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 15);
  const canAdd = item.trim() !== "" && Number(price) > 0;

  const add = () => {
    if (!canAdd) return;
    const entry: PriceEntry = {
      id: crypto.randomUUID(),
      item: item.trim(),
      price: Math.round(Number(price)),
      at: new Date().toISOString(),
    };
    setEntries([...entries, entry]);
    setPrice("");
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="grid gap-3 rounded-lg border border-panel-edge bg-panel p-5 sm:grid-cols-[1fr_10rem_auto]"
      >
        <input
          aria-label="Item name"
          list="known-items"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Item name"
          className={inputClass}
        />
        <datalist id="known-items">
          {summaries.map((s) => (
            <option key={s.item} value={s.item} />
          ))}
        </datalist>
        <input
          aria-label="Price in adena"
          type="number"
          inputMode="numeric"
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (adena)"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!canAdd}
          className="rounded-md border border-gold bg-gold/15 px-4 py-2 text-sm text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add price
        </button>
      </form>

      <section>
        <h2 className="text-xl">Your items</h2>
        {summaries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No prices yet. Add the first one above.</p>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {summaries.map((s) => (
              <li key={s.item} className="rounded-lg border border-panel-edge bg-panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base">{s.item}</h3>
                  {s.changePercent !== null && s.changePercent !== 0 && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        s.changePercent > 0 ? "text-gold-bright" : "text-blood"
                      }`}
                    >
                      {s.changePercent > 0 ? (
                        <TrendingUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="h-4 w-4" aria-hidden="true" />
                      )}
                      {s.changePercent > 0 ? "+" : ""}
                      {s.changePercent.toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xl text-gold-bright">{adena(s.latest)}</p>
                <p className="mt-1 text-xs text-muted">
                  Low {adena(s.min)} · High {adena(s.max)} · {s.count} {s.count === 1 ? "entry" : "entries"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="text-xl">Recent entries</h2>
          <ul className="mt-3 divide-y divide-panel-edge rounded-lg border border-panel-edge bg-panel text-sm">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2">
                <span>{e.item}</span>
                <span className="flex items-center gap-3">
                  <span className="text-gold-bright">{adena(e.price)}</span>
                  <span className="hidden text-xs text-muted sm:inline">
                    {new Date(e.at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <button
                    aria-label={`Delete ${e.item} entry`}
                    onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}
                    className="text-muted hover:text-blood"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted">
        This log is saved in your own browser only. Shared community prices, charts and alerts come
        later, when the database is connected.
      </p>
    </div>
  );
}
