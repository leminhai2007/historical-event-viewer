# Historical Event Viewer

A website that shows historical events on a vertical timeline, grouped by region.
Click an event card to read more about it.

The live website is hosted on **GitHub Pages**. Whenever changes are merged into
the **main** branch, the site is built and published automatically (it takes a
minute or two).

---

## Run the website on your computer (for previewing)

You don't need any special tools to browse the site, but to work on it you need:

1. **Node.js** installed (get it free at https://nodejs.org — pick the LTS version).
2. A terminal opened in this project's folder.

Then run these commands:

```bash
# First time only: install the required files
npm install

# Start the website locally
npm run dev
```

Open http://localhost:3000 in your browser to see it. The page updates by
itself when you change a file, so keep the terminal running and just refresh.

---

## Add or edit an event (you don't need to be a developer)

The site is bilingual (**Vietnamese** is the default, **English** is
available via the language switcher). Each language has its own events folder:
`content/events/vi/` for Vietnamese and `content/events/en/` for English.
Each event is one text file in that language's folder:

```md
---
title: "Hạ cánh lên Mặt Trăng"
date: "1969-07-20"
icon: "rocket.svg"
image: "moon-landing.svg"
tags:
  region: ["Thế giới", "Không gian"]
  people: ["Neil Armstrong", "Buzz Aldrin"]
---

Chuyến bay Apollo 11 là chuyến bay vũ trụ đầu tiên đưa con người lên Mặt Trăng.

![Apollo 11 cất cánh](moon-landing.svg)
```

### Rules

- **Language folder:** put the file in `content/events/vi/` for Vietnamese
  or `content/events/en/` for English.
- **File name:** start with the date, then an underscore and the event name,
  for example `1969-07-20_MoonLanding.md`. Dates use `YYYY.MM.DD`.
- **`title`** — the name shown on the event card, in that language.
- **`date`** — the event date, in quotes, with dashes (`1969-07-20`).
  For events before year 1, use a **negative year**: 44 BCE is
  `"-0044-03-15"` and the file is `-0044.03.15_JuliusCaesarAssassination.md`.
  These are shown as "44 BCE" (or "44 TCN" in Vietnamese) on the timeline and
  appear before CE events.
- **`icon`** — a small picture used on the card. Icons are **shared by all
  languages**: the file goes in the `content/icons/` folder.
- **`image`** — (optional) a bigger picture shown in the event popup. Images
  are **shared by all languages**: the file goes in the `content/images/`
  folder.
- **`tags.region`** — at least one region name, written as the **display name
  with accents** exactly as it should appear in the region list (e.g.
  `Thế giới`, `Châu Âu`, `Bắc Mỹ` in Vietnamese; `World`, `Europe`,
  `North America` in English). Events from the same region appear in the same
  column. The region list is built automatically by scanning every event file
  in that language — the site reads all `.md` files to know which regions to
  offer. You can invent new region names inside a language.
- **`tags.people`** — (optional) names of the people involved.
- **The body** — the description, written in plain Markdown, in that language.

The easiest way to start is to **copy an existing event file** in the same
language and change the details. To preview, start the dev server (see above)
and refresh the page. Pictures, icons, and event files are all just normal
files in this repository.

---

## How work gets reviewed and published

This project uses a **Pull Request** workflow so every change is checked by
someone before it goes live.

1. **Make your changes** — add or edit the event files in
   `content/events/<language>/` (and, if you add new artwork, its icon in the
   shared `content/icons/` folder or image in `content/images/`).
2. **Create a pull request (PR)** — this asks for your changes to be added to
   the `main` branch.
3. **Someone reviews it** — a reviewer looks over the change, asks questions
   or requests fixes if needed, and approves it when it looks good.
   **A change can only be merged into `main` after it has been reviewed and
   approved** — never merge your own PR without a second person checking it.
4. **Merge it** — once approved, the PR is merged into `main`.
5. **It goes live automatically** — a few minutes after the merge, GitHub
   Actions rebuilds the site and publishes it to GitHub Pages.

---

## Deploying (for maintainers)

The site is a static export run through GitHub Pages:

- The workflow **`.github/workflows/deploy.yml`** builds with
  `NEXT_PUBLIC_BASE_PATH` set to the repo name and uploads the `out/` folder.
- On GitHub, enable Pages at **Settings → Pages → Source → GitHub Actions** once.
- After that, every push to `main` deploys automatically.
- To test the exact production build locally:

  ```bash
  NEXT_PUBLIC_BASE_PATH="/<repo-name>" npm run build
  ```

  The result appears in the `out/` folder.

## Add a new language

Each language is a folder under `content/` plus an entry in
`content/config.json` — no code changes needed.

1. Create `content/events/<locale>/` and translate the event files. Icons and
   images are shared: put new artwork in `content/icons/` or `content/images/`
   (reused across all languages) instead of per-locale folders.
2. In `content/config.json`:
   - `defaultLocale` — which language builds at `/` (change with care).
   - `localeOrder` — add the new locale; other locales build at `/<locale>/`
     (e.g. `/en/`).
   - `localeNames` — display label used in the language switcher.
   - `defaultRegions` — map of locale → the region name that is selected by
     default for new visitors (same shape as `localeNames`, e.g.
     `{ "vi": "Thế giới", "en": "World" }`). Use names exactly as written in
     that language's event files.
3. UI chrome strings (header, footer, etc.) live in `src/lib/i18n.ts` — add a
   dictionary entry for the new locale.

## Project layout (short version)

```
content/config.json     ← locale config (default language, default region per locale)
content/events/         ← event files: events/vi/ and events/en/
content/icons/          ← shared event icons (all languages)
content/images/         ← shared event images (all languages)
public/                 ← website icons, manifest, service worker
src/                    ← the website's code (React/Next.js)
.github/workflows/      ← automatic build + deploy to GitHub Pages
```