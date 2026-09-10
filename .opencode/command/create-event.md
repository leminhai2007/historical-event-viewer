---
description: Create a new historical event Markdown file (content/events/YYYY.MM.DD_Name.md) from a source document, URL, or pasted text using the project's event schema.
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
   | `--date` | `--date 1903-12-17` | Also accepts `YYYY.MM.DD` or bare `YYYY` |
   | `--region` | `--region world` | Repeatable; lowercase; default `world` |
   | `--people` | `--people "Neil Armstrong"` | Repeatable |
   | `--icon` | `--icon rocket.svg` | Filename in content/icons/ |
   | `--image` | `--image moon-landing.svg` | Filename in content/images/ |
   | `--out` | `--out content/events` | Override output directory |
   | `--force` | `--force` | Allow overwriting an existing file |

3. **Derive any missing metadata from the document** (only when the corresponding flag was *not* provided):
   - **title**: first heading (`# ...`) or meaningful opening line, cleaned of markdown.
   - **date**: first clear date in the text — `YYYY-MM-DD`, `YYYY.MM.DD`, `Month D, YYYY`, `D Month YYYY`, or bare `YYYY`. Month/day default to `01`.
   - **regions**: always lowercase; default `["world"]` if none detected.
   - **people**: only when names are unambiguous (or explicitly provided).

4. **Validate**:
   - `title` is required.
   - `date` must include at least a year.
   - If anything is ambiguous, ask the user before guessing.

5. **Generate the filename and body**:
   - Filename: `YYYY.MM.DD_CamelCaseTitle.md` — title converted to PascalCase with no spaces or special characters.
   - Body: faithful but concise — a short summary, then key points/sections drawn from the source. Include inline `![alt](file)` images only when the source provides usable image paths.

6. **Write the file** to `content/events/<filename>` (or `--out` if provided). Use the **exact** frontmatter shape below.

7. **Verify the asset files** exist:
   - Icon at `content/icons/<icon>` (default `scroll.svg` — already present).
   - Image at `content/images/<image>` if `--image` was given.
   - Warn if they are missing. Event assets live under `content/` (not `public/`); they are served to the app by the route handler at `/content/...`.

8. **Do not overwrite** an existing file unless `--force` was provided.

9. Finish by reading back the written file to confirm it parses correctly, and print a summary:

   ```
   ✔ Created content/events/1867.03.30_AlaskaPurchase.md
     title:  Alaska Purchase
     date:   1867-03-30
     regions: north-america, world
     people:  William Seward
   ```

---

## Frontmatter format (exact shape)

Omit `image:` when absent. Omit `people:` when empty. `region` is always present.

```
---
title: "Moon Landing"
date: "1969-07-20"
icon: "rocket.svg"
image: "moon-landing.svg"
tags:
  region: ["world", "space"]
  people: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins"]
---
```

See existing files in `content/events/*.md` and `docs/DESIGN.md` for real examples.
