<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Knowledge

This is the **Historical Event Viewer** — a Next.js 16 PWA that renders
historical events on a vertical, region-grouped timeline, deployed to GitHub
Pages as a static export.

## Where to learn about the project (read first)

- `docs/DESIGN.md` — the contract for how this codebase works: data model,
  MDX/rendering architecture, timeline behavior, PWA, debug/skills context.
  Update it whenever behavior or architecture changes.
- `README.md` — plain-language docs for humans: how to run in dev, how to add
  content, PR/review workflow, deployment.
- `.opencode/command/create-event.md` — the event file contract (frontmatter
  schema, filename rules incl. BCE dates) plus the scaffold workflow for
  creating a new event file from a document, URL, or pasted text.

## Data model (quick facts)

- Events live as Markdown files in `content/events/`, named
  `YYYY.MM.DD_CamelCaseTitle.md` (BCE files prefix the year:
  `-0044.03.15_JuliusCaesarAssassination.md`).
- Frontmatter: `title`, `date` (canonical `YYYY-MM-DD`; BCE = negative zero-
  padded year `-0044-03-15`), optional `icon`, `image`, `tags.region`
  (required), `tags.people` (optional).
- Event assets are NOT in `public/`: icons/images live in `content/icons/` and
  `content/images/` and are served by the route handler
  `src/app/content/[...path]/route.ts` (static-exported via `generateStaticParams`).
- Date parsing/formatting/sorting is centralized in `src/lib/date.ts`
  (client-safe, no `fs`); event MD parsing is `src/lib/events.ts`.
- `src/app/page.tsx` is a Server Component; interactive UI lives under
  `src/components/`. `src/lib/paths.ts` handles the GitHub Pages basePath.

## Commands

- `npm run dev` — local dev server (localhost:3000).
- `npm run lint`, `npm run build` — static site build (outputs `out/`).
- Deploy is automatic via `./github/workflows/deploy.yml` on push to `main`;
  set `NEXT_PUBLIC_BASE_PATH` when building for a GitHub Pages project site.

## Engineering notes

- The Next.js block ABOVE is auto-managed by `next dev` — do not remove it.
- Old clock of habits: this repo pre-renders everything (no API routes, no
  server runtime); do not reintroduce request-time dynamic features without
  updating `docs/DESIGN.md` and the deploy workflow.
