export type PriceEntry = { id: string; item: string; price: number; at: string }; // at = ISO date

export type ItemSummary = {
  item: string;
  latest: number;
  changePercent: number | null; // latest vs the entry before it
  min: number;
  max: number;
  count: number;
  lastAt: string;
};

const key = (name: string) => name.trim().toLowerCase();

/** One summary per item (case-insensitive), sorted by name. */
export function summarize(entries: PriceEntry[]): ItemSummary[] {
  const groups = new Map<string, PriceEntry[]>();
  for (const e of entries) {
    const k = key(e.item);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return [...groups.values()]
    .map((list) => {
      const sorted = [...list].sort((a, b) => a.at.localeCompare(b.at));
      const last = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      const prices = sorted.map((e) => e.price);
      return {
        item: last.item,
        latest: last.price,
        changePercent: prev && prev.price > 0 ? ((last.price - prev.price) / prev.price) * 100 : null,
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: sorted.length,
        lastAt: last.at,
      };
    })
    .sort((a, b) => a.item.localeCompare(b.item));
}

/** Latest price for an item name, or null. */
export function latestPrice(entries: PriceEntry[], name: string): number | null {
  const mine = entries.filter((e) => key(e.item) === key(name)).sort((a, b) => a.at.localeCompare(b.at));
  return mine.length ? mine[mine.length - 1].price : null;
}
