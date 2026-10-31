"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { RecipeListItem } from "@/lib/recipes";

const PAGE_SIZE = 40;

export default function RecipeBrowser({ recipes }: { recipes: RecipeListItem[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "dwarven" | "common">("all");
  const [level, setLevel] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  const fuse = useMemo(
    () => new Fuse(recipes, { keys: ["name", "materials"], threshold: 0.3 }),
    [recipes],
  );
  const levels = useMemo(() => [...new Set(recipes.map((r) => r.level))].sort((a, b) => a - b), [recipes]);

  const results = (query.trim() ? fuse.search(query).map((r) => r.item) : recipes).filter(
    (r) => (type === "all" || r.type === type) && (level === null || r.level === level),
  );

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition ${
      active ? "border-gold bg-gold/15 text-gold-bright" : "border-panel-edge text-muted hover:border-gold"
    }`;
  const reset = () => setShown(PAGE_SIZE);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          reset();
        }}
        placeholder="Search by item or material, e.g. Mithril Ore"
        aria-label="Search recipes"
        className="w-full rounded-lg border border-panel-edge bg-panel px-4 py-2 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {(["all", "dwarven", "common"] as const).map((t) => (
          <button
            key={t}
            className={chip(type === t)}
            onClick={() => {
              setType(t);
              reset();
            }}
          >
            {t === "all" ? "All types" : t === "dwarven" ? "Dwarven" : "Common"}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {levels.map((l) => (
          <button
            key={l}
            className={chip(level === l)}
            onClick={() => {
              setLevel(level === l ? null : l);
              reset();
            }}
          >
            Level {l}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">{results.length} recipes</p>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {results.slice(0, shown).map((r) => (
          <li key={r.id}>
            <Link
              href={`/crafts/${r.id}`}
              className="block h-full rounded-lg border border-panel-edge bg-panel p-4 transition hover:border-gold"
            >
              <h2 className="text-base">
                {r.name}
                {r.count > 1 && <span className="text-muted"> x{r.count}</span>}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {r.type === "dwarven" ? "Dwarven" : "Common"} · Level {r.level} · {r.successRate}% success
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{r.materials.join(", ")}</p>
            </Link>
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="mt-6 text-sm text-muted">No recipes match.</p>}
      {shown < results.length && (
        <button
          onClick={() => setShown(shown + PAGE_SIZE)}
          className="mt-6 rounded-md border border-panel-edge px-4 py-2 text-sm hover:border-gold"
        >
          Show more
        </button>
      )}
    </div>
  );
}
