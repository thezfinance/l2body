# L2body: Project Plan

## Context
L2body is a personal hub for Lineage 2 Interlude on L2 Reborn x10 Eternal: guides, a YouTube feed, a craft calculator, and a crowd-sourced market tracker. Constraints: near-zero budget (Next.js + Vercel + Supabase free + GitHub), no server access from admins, no packet sniffing or client modification (ban risk), beginner-friendly.

**Folder check:** `F:\PROJECTS\L2BODY` exists and is completely empty. No existing project, no git repo. Greenfield. (Windows is case-insensitive, so `l2body` and `L2BODY` are the same folder.) No code or files in the project will be created until you approve.

---

## 1. Key decisions (plain language)
| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js App Router, TypeScript, Tailwind | Your choice; one codebase does pages + API + bot webhook |
| Hosting | Vercel Hobby | Free, auto-deploys from GitHub. Hobby is for non-commercial use only (no ads/selling) |
| Database | Supabase free (Postgres) | Real SQL for recipes/prices; built-in login; 500 MB; pauses after 1 week of inactivity (see risks) |
| Guides | MDX files in the repo | Free, versioned in git, no DB needed. Search via a build-time index (Fuse.js), tags from frontmatter |
| Auth | Supabase Auth with Discord login | Players already have Discord; one login serves site and bot |
| Discord bot | HTTP "Interactions" endpoint on Vercel (not a 24/7 bot) | Slash commands can be served by a serverless route, so no always-on host and no cost |
| Data fetching | Server-side with caching (ISR/`revalidate`) | Protects YouTube quota and speeds pages |
| Code layout | One repo, one app, no monorepo | Simplest for a beginner |

## 2. Final folder structure
```
l2body/
├─ CLAUDE.md                  # project rules for Claude (draft in section 9)
├─ README.md
├─ package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
├─ .env.example               # names of secrets only, never real values
├─ .gitignore                 # ignores .env.local, node_modules, data/raw-datapack/
├─ content/guides/            # MDX guides, one folder per category
│  ├─ leveling/  farming/  builds/  quests/  rates-x10/
├─ data/
│  ├─ raw-datapack/           # original XML files (untouched, gitignored if license unclear)
│  ├─ overrides/              # x10 changes as small JSON/YAML patch files (committed)
│  └─ generated/              # cleaned output of the import script
├─ scripts/                   # run by hand, not part of the website
│  ├─ import-recipes.ts       # XML -> validated JSON -> Supabase
│  └─ build-search-index.ts
├─ supabase/
│  ├─ migrations/             # numbered .sql files = database history
│  └─ seed.sql
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx, page.tsx, globals.css
│  │  ├─ guides/ [category]/[slug]/
│  │  ├─ videos/
│  │  ├─ crafts/ [recipeId]/ + calculator/
│  │  ├─ market/ [itemId]/ + watchlist/ + submit/
│  │  ├─ account/
│  │  └─ api/
│  │     ├─ youtube/refresh/      # called by cron
│  │     ├─ prices/               # form submissions
│  │     ├─ discord/interactions/ # bot webhook
│  │     ├─ ocr/                  # phase 7
│  │     └─ alerts/run/           # cron: check watchlists
│  ├─ components/ ui/ guides/ videos/ crafts/ market/
│  ├─ lib/
│  │  ├─ supabase/ (browser.ts, server.ts, admin.ts)
│  │  ├─ youtube/ (client.ts, cache.ts)
│  │  ├─ crafts/ (calc.ts, calc.test.ts)    # pure math, fully tested
│  │  ├─ market/ (validate.ts, trends.ts)
│  │  ├─ discord/ (verify.ts, commands.ts)
│  │  └─ env.ts                              # checks secrets exist at startup
│  └─ types/
├─ discord/register-commands.ts               # one-off script to register slash commands
├─ public/
└─ .github/workflows/ci.yml                   # lint + typecheck + tests on each push
```

## 3. Database schema (Supabase / Postgres)
Core idea: **items are the hub**. Recipes, prices, and watchlists all point at an item. Prices are append-only (never edited) so history and trends come for free.

| Table | Key columns | Reasoning |
|---|---|---|
| `items` | `id` (= L2 item ID, integer), `name`, `grade` (D/C/B/A/S), `type`, `icon`, `is_x10_modified`, `source` (datapack/manual) | Using the real L2 item ID as the primary key means datapack data and your data always match |
| `recipes` | `id`, `recipe_item_id`→items (the recipe scroll), `product_item_id`→items, `product_count`, `success_rate` (%), `mp_cost`, `level`, `is_common`, `source`, `overridden` | One row per craftable product |
| `recipe_ingredients` | `recipe_id`, `item_id`, `count` | Separate table because a recipe has many materials |
| `prices` | `id`, `item_id`, `price` (bigint, adena), `kind` (sell/buy), `quantity`, `contributor_id`, `source` (form/discord/ocr), `created_at`, `status` (ok/flagged/hidden) | Append-only log. `source` lets you trust OCR less than manual |
| `price_daily` (view or table) | `item_id`, `day`, `median`, `min`, `max`, `n` | Median not average, so one troll entry can't wreck the chart. Keeps charts fast and the DB small |
| `contributors` | `id` (= auth user id), `discord_id`, `display_name`, `trust_score`, `is_banned`, `created_at` | Needed for abuse control. Trust grows when your entries agree with others |
| `watchlist` | `contributor_id`, `item_id`, `alert_above`, `alert_below`, `notify_via` (site/discord_dm) | Alerts per user per item |
| `alerts_log` | `watchlist_id`, `fired_at`, `price` | Prevents spam: don't re-fire the same alert |
| `youtube_sources` | `id`, `type` (channel/playlist), `external_id`, `label`, `enabled` | The channels you choose |
| `youtube_videos` | `video_id`, `source_id`, `title`, `published_at`, `thumb`, `fetched_at` | The cache |
| `sync_state` | `connector`, `last_ok_at`, `last_error`, `last_run_at` | Powers the health indicator; see section 4 |
| `import_runs` | `id`, `ran_at`, `files`, `added`, `changed`, `rejected` | Audit trail for datapack imports |

Security: **Row Level Security on every table.** Public can read items/recipes/approved prices. Only logged-in contributors can insert prices/watchlist rows, and only their own. Writes from the bot/cron use the server-only service key.

## 4. Connectors and failure isolation
**Rule:** every connector is its own module with its own table(s), its own API route, and its own `sync_state` row. The website reads only from our database, never live from an external service. So if YouTube, Discord, or OCR is down, pages still render from last-known data and show a small "last updated X ago" note.

- **YouTube.** A daily Vercel cron calls `/api/youtube/refresh`. Efficient method: for each channel, read its *uploads playlist* with `playlistItems.list` (1 quota unit) instead of `search.list` (100 units). The free quota is 10,000 units/day, so this is far below the limit. Results are stored in `youtube_videos`; the page reads from there. On failure: keep old videos, record the error in `sync_state`. Optional: filter by keywords to show only L2 content.
- **Datapack import.** A script you run by hand (not on the live site): read XML → validate → apply x10 overrides → write to DB in one transaction. If any file fails validation, nothing is written and the old data stays. Totally decoupled from the website at runtime.
- **Market inputs.** Three doors into one validated function (`lib/market/validate.ts`) that writes to `prices`: (1) web form, (2) Discord slash command, (3) OCR. Validation: item must exist, price must be positive and within a sane band of the recent median (outliers are flagged `status=flagged`, not deleted), rate limit per contributor. If the bot or OCR breaks, the form still works.
- **Discord bot.** Serverless webhook that verifies Discord's signature, then calls the same `addPrice` function. Commands: `/price add item price`, `/price check item`, `/watch add item below:`. Discord requires a reply within 3 seconds, so heavy work is deferred. Alerts go out as DMs or a channel post via a cron job.
- **OCR (last).** Screenshot upload → OCR → *preview table the user must confirm* → saved with `source=ocr`. Free option: Tesseract.js running in the browser (no server cost, nothing leaves the user's machine). Accuracy on game fonts is a real risk, which is why it is last and human-confirmed.

## 5. Datapack source and x10 handling
**Honest uncertainty:** I can't verify the exact files without internet research, and L2 Reborn is a private server whose real data we can't see. So Phase 0 includes a check before any import code is written.
- **Where recipes come from.** Open-source L2J-family Interlude datapacks (e.g. L2J Mobius C6 Interlude, aCis, L2JFrozen) are on GitHub. Recipe data may be XML or, in older packs, CSV/SQL. Item definitions (names, grades) live in separate item XML files, which we also need.
- **Caveat to resolve:** the data is a *baseline*, not truth. Private servers modify recipes, success rates, and add custom items. Items may also have different IDs from stock.
- **Handling x10 changes.** Never edit the raw datapack. Keep it as-is, then layer small **override files** in `data/overrides/` (e.g. "recipe 123: success 100%, product count ×10") applied during import. Benefits: re-importing a newer datapack doesn't erase your fixes, and every difference from stock is visible in git. Rates in the calculator (adena, drop, craft) come from a single `config/server.ts` so x10 assumptions live in one place.
- **Ground truth.** Where in-game or wiki/forum recipe info disagrees with the datapack, the override wins; the `overridden` flag shows it in the UI. Legal note: check the datapack's license and don't republish game icons/assets that you aren't allowed to.

## 6. Phased build order
**Phase 0: Decisions & checks.** Answer questions (section 10); pick datapack; confirm Node version, GitHub, Vercel, Supabase, Discord accounts.
- [ ] Questions answered; datapack candidate confirmed to contain Interlude recipes; accounts exist.

**Phase 1: Skeleton & theme.** Next.js project, Tailwind dark-gold theme (Cinzel/Inter via `next/font`), header/nav, mobile layout, GitHub repo, Vercel deploy, CI.
- [ ] Site live at a Vercel URL; looks right on phone and desktop; `lint`, `typecheck`, `build` pass; no secrets committed.

**Phase 2: Guides.** MDX pipeline, category pages, tags, search, 5 sample guides.
- [ ] Add a guide by creating one file and pushing; search finds it; tag and category filters work; 404s handled.

**Phase 3: Videos.** Supabase connected; YouTube sources table; cron refresh; video grid.
- [ ] Videos show from your chosen channels; quota use logged and under ~5% of daily limit; killing the API key leaves the page working with a "last updated" notice.

**Phase 4: Datapack & crafts.** Schema migrations; import script; override layer; recipe browser; calculator (materials, success chance, expected cost with retries, cost vs sell price, profit); unit tests on the math.
- [ ] Import is repeatable (run twice = same result); a bad XML file is rejected without damaging data; calculator matches 5 hand-checked recipes; prices of materials default to market data when available, manual input otherwise.

**Phase 5: Market via manual form.** Discord login, price form, item search, price page with history chart and trend, validation and rate limits.
- [ ] Logged-out users can read, logged-in can submit; outliers are flagged; chart shows median per day; RLS tested (user can't edit others' rows).

**Phase 6: Watchlist, alerts, Discord bot.** Watchlist UI, alert cron, slash commands, signature verification.
- [ ] `/price add` and `/price check` work in your Discord; an alert fires once, not repeatedly; bot outage doesn't affect the website or the form.

**Phase 7: Screenshot OCR.** Upload → OCR → confirmation table → save.
- [ ] Tested on at least 10 real screenshots; nothing saves without user confirmation; measured accuracy documented; can be turned off with a flag.

**Phase 8: Polish.** Accessibility, SEO, error pages, backups (export script), admin moderation page, docs.
- [ ] Lighthouse mobile ≥ 90; weekly DB export works; a moderation action (hide price, ban contributor) works.

## 7. Risks, free-tier limits, possible future costs
| Item | Free limit | Risk / when it could cost money |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth, limited function time, **cron limited to once per day** on Hobby | Alerts that need to be faster than daily need an external free pinger (e.g. GitHub Actions schedule) or Pro ($20/mo). Non-commercial only |
| Supabase free | 500 MB DB, 1 GB file storage, 50k monthly active users, **project pauses after ~7 days of inactivity** | Paused DB = site down. Mitigation: the daily cron doubles as a keep-alive. Prices table growth is slow, but store daily rollups and prune old raw rows |
| YouTube API | 10,000 units/day | Safe with `playlistItems`; `search.list` would burn quota fast; never call from the browser |
| Discord | Free | Interactions endpoint must respond within 3s. Rate limits apply |
| OCR | Tesseract.js in-browser = free | Cloud OCR (Google Vision etc.) is free only for small volumes; avoid |
| Domain | `*.vercel.app` free | A custom domain is ~$10-15/yr, optional |
| **Data quality** | n/a | Crowd data needs users. Few contributors = thin prices. Expect trolls; trust score + flags + median handle it |
| **Server rules / bans** | n/a | Everything is manual or screenshot-based. No client hooks, no sniffing. Check the server's rules on third-party tools anyway |
| **Copyright** | n/a | NCSoft game assets (icons) and some datapack licenses. Use text/names; ask before bundling icons |
| **Datapack mismatch** | n/a | Biggest accuracy risk; covered by overrides |
| **Beginner pitfalls** | n/a | Leaked keys (use `.env.local`, never commit), Supabase service key must stay server-side |

## 8. Verification approach (once building)
Per phase: run `npm run lint && npm run typecheck && npm test && npm run build`; check the Vercel preview on a phone-size window; for connectors, simulate failure (bad API key, malformed XML, bot offline) and confirm the rest of the site is unaffected. Calculator math has unit tests against hand-computed recipes.

## 9. Draft CLAUDE.md
```markdown
# L2body
Personal hub for Lineage 2 Interlude (L2 Reborn x10 Eternal): guides, YouTube feed,
craft calculator, crowd-sourced market tracker. Owner is a beginner: explain decisions
in plain language, make small steps, and say what each command does.

## Stack
Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres/Auth), Vercel, GitHub.
Budget is ~zero: do not add paid services or dependencies without asking.

## Hard rules
- NEVER suggest or write packet sniffing, client modification, injection, memory reading,
  or automation of the game client. Market data is manual form, Discord bot, or
  user-confirmed screenshot OCR only.
- Never commit secrets. Use .env.local; keep .env.example updated. The Supabase service key
  and Discord/YouTube keys are server-only.
- Do not edit files in data/raw-datapack/. x10 changes go in data/overrides/.
- Every table has Row Level Security. Never disable it to "make it work".
- Database changes only via new numbered files in supabase/migrations/.
- The website reads from our DB, never live from YouTube/Discord. Each connector must fail alone.
- Prices are append-only; use median, not average. Flag outliers; don't delete them.
- Ask before: installing new packages, changing the schema, running deploys, deleting anything.

## Theme
Dark gold fantasy. Cinzel for headings, Inter for body. Mobile-first. Colors live in
tailwind.config.ts tokens, not hard-coded hex.

## Commands
npm run dev | lint | typecheck | test | build
npm run import:recipes (scripts/import-recipes.ts)

## Conventions
TypeScript strict, no `any`. Pure logic in src/lib with tests (calc, trends, validation).
Server components by default; client components only when needed.
Guides are MDX in content/guides/<category>/ with frontmatter: title, tags, updated.

## Definition of done (every phase)
lint, typecheck, tests, build pass; works on mobile width; failure cases tried; the phase
checklist in PLAN.md is ticked; one short summary of what changed and why.
```

## 10. Questions to answer before building
1. **Datapack:** do you know which core L2 Reborn is based on, or should I research candidates (L2J Mobius C6 Interlude, aCis, etc.) and compare recipes to what you see in game?
2. **Recipe data you trust:** can you give 3-5 real in-game recipes (materials, success %) so I can verify the import and the x10 changes?
3. **YouTube:** which channels/playlists (names or URLs) do you want, and should I filter to L2 keywords?
4. **Contributors:** just you at first, or a Discord community? Is login with Discord OK, or do you want anonymous submissions (higher abuse risk)?
5. **Discord:** do you already have a server where you can add a bot? Who would use `/price`?
6. **Alerts:** is daily check enough, or do you need near-real-time (needs a free GitHub Actions pinger)?
7. **Language:** English only, or also Hebrew/RTL? (Affects the layout from day one.)
8. **Domain & branding:** is `*.vercel.app` fine at first? Any logo or color preferences beyond dark gold?
9. **Guides content:** will you write them, or should I draft starting templates? Any categories to add or remove?
10. **Server rules:** have you checked L2 Reborn's rules about third-party sites/tools and screenshots?
11. **Currency:** is adena the only currency, or are there coins/other tradeable currencies on this server?
12. **Public or private:** public site for the community, or personal use only? (Affects moderation and Vercel Hobby terms.)

---

## 11. Your answers and what they change
| # | Answer | Effect on the plan |
|---|---|---|
| 1 | I research | Short research done (see 12). Final pick deferred to Phase 0 |
| 2 | Recipes like retail | Stock Interlude recipes are the baseline; x10 overrides stay near-empty (only rates in `config/server.ts`) |
| 3 | lolthez channel | Need the channel URL/@handle; resolve its uploads playlist once (1 quota unit) |
| 4 | Just you | Only you can write prices; public is read-only. `contributors` table kept for later but trust scores and rate limits are deferred |
| 5 | No bot permission on server | Register commands as a **user-installed app** (works in DMs and any server without admin rights), or use your own private test server |
| 6 | Daily check | Fits Vercel Hobby daily cron. No external pinger |
| 7 | English | No RTL work |
| 8 | Dark fantasy tied to L2 | Original art/colors inspired by L2; no NCSoft icons or logos |
| 9 | Write guides together, each with a YouTube video | Guide frontmatter gets `youtube` (video ID); guide page embeds it (privacy mode) |
| 10 | Server rules OK | Risk closed |
| 11 | Adena only | Single currency, no currency column needed |
| 12 | Public site | Hobby plan is non-commercial: no ads or paid features. Public pages are read-only; writes require your login |

## 12. Datapack research (Q1)
- L2JMobius ships each chronicle as its own distribution, so an Interlude (CT_0) pack exists, but I did not find the exact recipe file path. Confirm in Phase 0 by browsing the repo.
- Older L2J packs may store recipes as CSV/SQL, not XML. The import script will parse whatever format exists.
- L2 Reborn Eternal x10 is a seasonal server (reset ~July/January) with dynamic rates early on (per a Jan 2025 Reddit comment). Confirm current rates on the official site before hard-coding them. Seasonal resets mean prices should be tagged by season.
- Discord supports user-installable apps (`integration_types`) so slash commands can work without server permission.

Sources: [L2JMobius wiki](https://l2jmobius.org/wiki/), [Reddit thread](https://axebps-redlib.hf.space/r/Lineage2/comments/1i27mah/new_reborn_x10), [Discord user-install docs](https://docs.discord.com/developers/tutorials/developing-a-user-installable-app)

---

## 13. Changes after the guides phase (2026-10-31)
- Events page and boss respawn tracker were REMOVED: the game times cannot be connected directly, so they would be hand-maintained. Epic boss GUIDES stay.
- Focus is now: guides, quests, and crafting (materials). Market and videos come after.
- Guide tags no longer show a # sign; tags that repeat a category name are hidden from the filter.
- Guide data: l2hub.info is mainly Gracia Final data, has no license or download option and carries an NCsoft rights notice. Use it as a reference only and write our own text; no bulk copying.
- Crafts idea: generate recipe data once from an Interlude datapack into a JSON file in the repo, and keep calculator prices in the visitor browser. This needs no database, so crafts can ship before Supabase.
- (2026-10-31) Videos page uses a hand-kept list in src/config/videos.ts (no API key needed yet). Crafts is a working manual calculator. Market is a private price log saved in the visitor browser (localStorage). Shared prices, recipe import, YouTube API and alerts remain for the database phases.
- (2026-10-31) Crafts: 871 Interlude recipes imported from the L2J Mobius CT0 Interlude datapack (fork dOmi666/L2J_Mobius_CT_0_Interlude, commit d509f31) with `node scripts/import-recipes.mjs <datapack>/dist/game/data` into src/data/recipes.json. Pages: /crafts (search + filters), /crafts/[id] (recipe + calculator), /crafts/calculator (manual). Stock retail values; x10 server differences go in an overrides file if any are found. Items were not copied, only names/numbers.
