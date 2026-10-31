"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { GuideMeta } from "@/lib/guides";

type Props = {
  guides: GuideMeta[];
  categories: Record<string, { label: string }>;
  showCategoryFilter?: boolean;
};

export default function GuideBrowser({ guides, categories, showCategoryFilter = true }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(guides, { keys: ["title", "summary", "tags"], threshold: 0.35 }),
    [guides],
  );
  // Tags that repeat a category name are noise (the category buttons already cover them).
  const allTags = useMemo(
    () =>
      [...new Set(guides.flatMap((g) => g.tags))]
        .filter((t) => !(t in categories) && t !== "epic-boss")
        .sort(),
    [guides, categories],
  );

  const results = (query.trim() ? fuse.search(query).map((r) => r.item) : guides).filter(
    (g) => (!category || g.category === category) && (!tag || g.tags.includes(tag)),
  );

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition ${
      active
        ? "border-gold bg-gold/15 text-gold-bright"
        : "border-panel-edge text-muted hover:border-gold"
    }`;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search guides..."
        aria-label="Search guides"
        className="w-full rounded-lg border border-panel-edge bg-panel px-4 py-2 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
      />
      {showCategoryFilter && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={chip(category === null)} onClick={() => setCategory(null)}>
            All
          </button>
          {Object.entries(categories).map(([key, c]) => (
            <button
              key={key}
              className={chip(category === key)}
              onClick={() => setCategory(category === key ? null : key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {allTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button key={t} className={chip(tag === t)} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {results.map((g) => (
          <li key={`${g.category}/${g.slug}`}>
            <Link
              href={`/guides/${g.category}/${g.slug}`}
              className="block h-full rounded-lg border border-panel-edge bg-panel p-5 transition hover:border-gold"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                {categories[g.category]?.label}
                {g.quest && <span className="ml-2 text-gold-bright">· Quest</span>}
              </p>
              <h2 className="mt-1 text-lg">{g.title}</h2>
              <p className="mt-2 text-sm text-muted">{g.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="mt-6 text-sm text-muted">No guides match.</p>}
    </div>
  );
}
