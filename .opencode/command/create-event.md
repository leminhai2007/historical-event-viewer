---
description: Create a new historical event Markdown file (content/events/<locale>/YYYY.MM.DD_Name.md) from a source document, URL, or pasted text using the project's event schema.
---

# Create Historical Event

Create a new event file for the Historical Event Viewer from the source below.

$ARGUMENTS

---

## What to do

1. **Load the source.** Determine from the user's input whether it is:
   - a **local file** → `Read` it.
   - a **URL** → `WebFetch` it.
   - **pasted text / a passage** → treat the text after the flags as the document body.
   - **nothing** → ask the user (via `question`) for the title, date, regions, people, and body.

2. **Parse any flags** the user included in $ARGUMENTS (strip them from the document text). Supported flags (repeatable for region/people, comma-separated also fine):

   | Flag | Example | Notes |
   |------|---------|-------|
   | `--title` | `--title "Wright Flyer"` | Override auto-detected title |
   | `--date` | `--date 1903-12-17` | Also accepts `YYYY.MM.DD`, bare `YYYY`, or BCE (see step 3) |
   | `--region` | `--region "Thế giới"` | Repeatable; use the **display names** (with diacritics) exactly as they should appear in the region list — vi: `Thế giới`, `Châu Âu`, `Châu Á`, `Bắc Mỹ`, `Nam Mỹ`, `Châu Phi`, `Châu Đại Dương`, `Không gian`; en: `World`, `Europe`, `Asia`, `North America`, `South America`, `Africa`, `Oceania`, `Space`. Names are defined by the event files (all `.md` files are scanned to build the selector list) |
   | `--people` | `--people "Neil Armstrong"` | Repeatable |
   | `--icon` | `--icon rocket.svg` | Filename in content/icons/ (shared across all languages) |
   | `--image` | `--image moon-landing.svg` | Filename in content/images/ (shared across all languages) |
   | `--locale` | `--locale en` | Which language folder to write to. Default `vi` (the site's default). The event should exist in **each** language it should be shown in |
   | `--out` | `--out content/events/vi` | Override output directory |
   | `--force` | `--force` | Allow overwriting an existing file |

3. **Derive any missing metadata from the document** (only when the corresponding flag was *not* provided):
   - **title**: first heading (`# ...`) or meaningful opening line, cleaned of markdown.
   - **date**: first clear date in the text — `YYYY-MM-DD`, `YYYY.MM.DD`, `Month D, YYYY`, `D Month YYYY`, or bare `YYYY`. Month/day default to `01`. **BCE dates**: a negative year or a `BC`/`BCE` suffix (e.g. `-0044-03-15`, `44-03-15 BCE`, `44 BCE`) is stored canonically as `-NNNN-MM-DD` (44 BCE → `-0044-03-15`). There is no year 0: year 0 is treated as 1 BCE.
   - **regions**: display names as authored in frontmatter; default is this locale's default region (`Thế giới` for vi, `World` for en) if none detected.
   - **people**: only when names are unambiguous (or explicitly provided).

4. **Validate**:
   - `title` is required.
   - `date` must include at least a year.
   - Normalize the date to canonical form: CE `NNNN-MM-DD`, BCE `-NNNN-MM-DD` (e.g. `-0044-03-15` = 44 BCE).
   - If anything is ambiguous, ask the user before guessing.

5. **Generate the filename and body**:
   - Filename: `YYYY.MM.DD_CamelCaseTitle.md` — title converted to PascalCase with no spaces or special characters. For BCE events, prefix the year with a minus sign: `-0044.03.15_JuliusCaesarAssassination.md`.
   - Body: faithful but concise — a short summary, then key points/sections drawn from the source, **translated into the target locale's language**. Include inline `![alt](file)` images only when the source provides usable image paths.

6. **Write the file** to `content/events/<locale>/<filename>` (or `--out` if provided). Use the **exact** frontmatter shape below. If the event is worth showing in the other language too, mention that the user may want to run the same command with `--locale <other>`.

7. **Verify the asset files** exist:
   - Icon at `content/icons/<icon>` (default `scroll.svg` — already present).
   - Image at `content/images/<image>` if `--image` was given.
   - Warn if they are missing. Icons/images are **shared across languages** and
     live under `content/icons/` / `content/images/` (not `public/`, and not
     per-locale); they are served to the app by the route handler at
     `/content/icons/<file>` and `/content/images/<file>`.

8. **Do not overwrite** an existing file unless `--force` was provided.

9. Finish by reading back the written file to confirm it parses correctly, and print a summary:

   ```
   ✔ Created content/events/vi/1867.03.30_MuaAlaska.md
     title:   Mua Alaska
     date:    1867-03-30
     locale:  vi
     regions: Bắc Mỹ, Thế giới
     people:  William Seward
   ```

---

## Frontmatter format (exact shape)

Omit `image:` when absent. Omit `people:` when empty. `region` is always present.

```
---
title: "Hạ cánh lên Mặt Trăng"
date: "1969-07-20"
icon: "rocket.svg"
image: "moon-landing.svg"
tags:
  region: ["Thế giới", "Không gian"]
  people: ["Neil Armstrong", "Buzz Aldrin"]
---
```

See existing files in `content/events/vi/*.md` and `content/events/en/*.md` and `docs/DESIGN.md` for real examples. Region **display names** differ per language — never mix English names (e.g. `World`) into a vi file or Vietnamese names (e.g. `Thế giới`) into an en file.