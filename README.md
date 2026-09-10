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

All the content lives in the **`content/events/`** folder. Each event is one
text file that looks like this:

```md
---
title: "Moon Landing"
date: "1969-07-20"
icon: "rocket.svg"
image: "moon-landing.svg"
tags:
  region: ["world", "space"]
  people: ["Neil Armstrong", "Buzz Aldrin"]
---

Apollo 11 was the spaceflight that first landed humans on the Moon.

![Apollo 11 lifting off](moon-landing.svg)
```

### Rules

- **File name:** start with the date, then an underscore and the event name,
  for example `1969-07-20_MoonLanding.md`. Dates use `YYYY.MM.DD`.
- **`title`** — the name shown on the event card.
- **`date`** — the event date, in quotes, with dashes (`1969-07-20`).
- **`icon`** — a small picture used on the card. The file goes in the
  **`content/icons/`** folder.
- **`image`** — (optional) a bigger picture shown in the event popup. The file
  goes in the **`content/images/`** folder.
- **`tags.region`** — at least one region name. Events from the same region
  appear in the same column. You can invent new region names.
- **`tags.people`** — (optional) names of the people involved.
- **The body** — the description, written in plain Markdown.

The easiest way to start is to **copy an existing event file** and change the
details. To preview, start the dev server (see above) and refresh the page.
Pictures, icons, and event files are all just normal files in this repository.

---

## How work gets reviewed and published

This project uses a **Pull Request** workflow so every change is checked by
someone before it goes live.

1. **Make your changes** — add or edit the event files in `content/events/`
   (and any icons or images in `content/icons/` / `content/images/`).
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

## Project layout (short version)

```
content/events/    ← every event lives here (one .md file each)
content/icons/     ← small card icons
content/images/    ← bigger pictures used in event popups
public/            ← website icons, manifest, service worker
src/               ← the website's code (React/Next.js)
.github/workflows/ ← automatic build + deploy to GitHub Pages
```