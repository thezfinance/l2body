@AGENTS.md

# L2body
Personal hub for Lineage 2 Interlude (L2 Reborn x10 Eternal): guides, YouTube feed
(channel: @lolThez), craft calculator, crowd-sourced market tracker. The owner is a beginner:
explain decisions in plain language, work in small steps, say what each command does.
The full plan and phase checklists are in PLAN.md.

## Stack
Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres/Auth), Vercel Hobby, GitHub.
Budget is ~zero: no paid services or new dependencies without asking. Vercel Hobby is
non-commercial: no ads or paid features.

## Hard rules
- NEVER suggest or write packet sniffing, client modification, injection, memory reading, or
  game-client automation. Market data comes only from the manual form, the Discord bot, or
  user-confirmed screenshot OCR.
- Never commit secrets. Use .env.local; keep .env.example updated. Supabase service key and
  Discord/YouTube keys are server-only.
- Do not edit data/raw-datapack/. x10 changes go in data/overrides/.
- Every table has Row Level Security. Never disable it to "make it work".
- Database changes only via new numbered files in supabase/migrations/.
- The site reads from our DB, never live from YouTube/Discord. Each connector must fail alone.
- Prices are append-only; use median, not average. Flag outliers, don't delete them.
- Only the owner can write data; public visitors are read-only. Currency is adena only.
- No NCSoft icons or logos; theme art must be original.
- Ask before: installing packages, changing the schema, deploying, deleting anything.

## Theme
Dark gold fantasy. Cinzel headings, Inter body. Mobile-first. Colors are tokens in
src/app/globals.css (bg-ink, text-gold, ...), not hard-coded hex.

## Commands
npm run dev | lint | build   (typecheck: npx tsc --noEmit)

## Conventions
TypeScript strict, no `any`. Pure logic in src/lib with tests. Server components by default.
Guides are MDX in content/guides/<category>/ with frontmatter: title, tags, updated, youtube.

## Definition of done (every phase)
lint, typecheck, build pass; works at phone width; failure cases tried; the phase checklist in
PLAN.md is ticked; a short summary of what changed and why.
