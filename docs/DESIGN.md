# Historical Event Viewer - Design Document

## Overview

A responsive Progressive Web App (PWA) that renders historical events as a
multi-column timeline. Content is **localized by language folders**:
`content/<locale>/` holds that language's `events/`, `icons/`, and `images/`.
Users pick which regions to display; each selected region becomes its own
column. Clicking an event card opens a detail modal.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router, Turbopack) | React framework, static generation |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| gray-matter | MD frontmatter parsing |
| next-mdx-remote v6 | MDX serialization (server) + rendering (client) |
| rehype-unwrap-images | Wraps images in `<figure>` for hydration safety |
| Service Worker (manual) | Offline caching / PWA |

> **Note:** `next-mdx-remote/rsc` exports MDXRemote as an async Server
> Component, which cannot be rendered inside client components. Therefore MDX
> is serialized in the Server Component (`src/app/page.tsx`) via `serialize()`
> and rendered client-side with the client build of `next-mdx-remote`.

## Project Structure

```
historical-event-viewer/
├── public/
│   ├── pwa/                     # PWA app icons (icon-192/512, apple-touch-icon)
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker (offline caching)
│   └── favicon.ico
├── content/
│   ├── config.json               # locale config (default, order, names, region labels)
│   ├── vi/                       # Vietnamese content (default locale)
│   │   ├── events/               # Markdown event files (YYYY.MM.DD_Name.md)
│   │   ├── icons/                # Event icons (SVG)
│   │   └── images/               # Event images (SVG)
│   └── en/                       # English content
│       ├── events/
│       ├── icons/
│       └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: fonts, PWA meta, LocaleProvider
│   │   ├── page.tsx              # Server Component for the default locale (`/`)
│   │   ├── [locale]/page.tsx     # Server Component for other locales (`/en/`)
│   │   ├── content/[...path]/route.ts  # Serves files from content/<locale>/ (icons, images)
│   │   └── globals.css           # Tailwind + custom styles/animations
│   ├── components/
│   │   ├── LocaleProvider.tsx    # Resolves locale, provides useLocale/useT/useRegionLabel
│   │   ├── TimelineApp.tsx       # Client shell: region state + persistence + switcher
│   │   ├── Timeline.tsx          # Column-grid timeline table
│   │   ├── EventCard.tsx         # Compact round card (click to open details)
│   │   ├── EventTooltip.tsx      # Click-to-open detail modal
│   │   ├── MDXContent.tsx        # Client MDX renderer (+ localized image paths)
│   │   ├── FloatingRegionPanel.tsx # Draggable region picker w/ search
│   │   └── PwaSupport.tsx        # SW registration + install prompt button
│   ├── lib/
│   │   ├── config.ts             # Loads content/config.json (cached)
│   │   ├── i18n.ts               # UI string dictionaries per locale
│   │   ├── events.ts             # Locale-aware MD parsing + MDX serialization
│   │   ├── date.ts               # Locale-aware date parsing/formatting (TCN/BCE)
│   │   ├── paths.ts              # Locale content URL helpers (contentUrl)
│   │   └── regions.ts            # Region extraction/filtering helpers
│   └── types/
│       └── event.ts              # TypeScript interfaces
├── .opencode/
│   └── command/
│       └── create-event.md       # opencode command: generate event MD from a source
├── docs/
│   └── DESIGN.md                 # This document
└── package.json
```

## Markdown File Format

### Naming Convention

```
YYYY.MM.DD_EventName.md
```

- `YYYY` - Year (required)
- `MM` - Month (optional, defaults to 01)
- `DD` - Day (optional, defaults to 01)
- `EventName` - CamelCase, derived from the event title

**Examples:**
- `1776.07.04_Independence.md`
- `1969.07.20_MoonLanding.md`

### Frontmatter Schema

```yaml
---
title: "Moon Landing"                    # Required: Display name
date: "1969-07-20"                       # Required: ISO date (YYYY-MM-DD)
```
BCE events use a **negative, zero-padded year**: `date: "-0044-03-15"` =
44 BCE (year is the BCE number; there is no year 0 — 0 becomes 1 BCE). The
file name mirrors it: `-0044.03.15_JuliusCaesarAssassination.md`. Dates are
sorted by a numeric key (`yyyymmdd`, negative for BCE), not by `Date`.
icon: "rocket.svg"                       # Optional: file in content/<locale>/icons/
image: "moon-landing.svg"                # Optional: file in content/<locale>/images/
tags:
  region: ["World", "Space"]                # Required: display names as authored
  people: ["Neil Armstrong"]             # Optional: related people
---
```

### Content

Standard Markdown rendered below the frontmatter. Images referenced by bare
filename (e.g. `![Alt](moon-landing.svg)`) are resolved to
`content/<locale>/images/<filename>` by `MDXContent`. Full URLs and
`/`-prefixed paths are left untouched. Event icons/images live under
`content/<locale>/` (not `public/`) and are served by the catch-all route
handler `src/app/content/[...path]/route.ts`, whose first path segment selects
the locale. Use the opencode command `/create-event` to scaffold a new event
from a document, URL, or pasted text.

## Internationalization

### Configuration (`content/config.json`)

```json
{
  "defaultLocale": "vi",
  "localeOrder": ["vi", "en"],
  "localeNames": { "vi": "Tiếng Việt", "en": "English" },
  "defaultRegions": { "vi": "Thế giới", "en": "World" }
}
```

- `defaultLocale` — built at `/`, no prefix (matches the `html lang` in the
  root layout).
- `localeOrder` — other locales build at `/<locale>/` via
  `generateStaticParams` in `src/app/[locale]/page.tsx`.
- `localeNames` — display labels used in the language switcher.
- `defaultRegions` — same shape as `localeNames`: a map of locale → the region
  name selected by default for that language (written exactly as it appears
  in that language's event files).
- **Region labels are NOT configured here.** Region names are authored directly
  in each event file's `tags.region` (display form, e.g. `"Thế giới"` /
  `"World"`). The site reads through every `.md` file of a locale to build the
  region selector list.
- `src/lib/config.ts` reads this at build time (server-side, cached; the
  client shell also passes relevant bits through). Adding a language means
  adding a `content/<locale>/` folder and a config entry — no code changes.

### Locale plumbing

- `src/components/LocaleProvider.tsx` (client) resolves the locale from the
  `pathname` (`"/"` → default), syncs `document.documentElement.lang`, and
  exposes `useLocale()`, `useT()` (UI strings), `useRegionLabel()`, and
  `useLocaleHref()`. `useRegionLabel()` is an identity pass-through — a region
  **is** its display name.
- UI chrome (header, footer, install text, labels) sources its wording from
  `src/lib/i18n.ts` dictionaries; era suffixes come from locale (vi → `TCN`,
  en → `BCE`) in `src/lib/date.ts`.
- The region selector list is computed on the client by scanning every event
  file of the locale (`extractUniqueRegions` in `src/lib/regions.ts`), which
  dedupes case-insensitively while preserving the first-seen authored spelling.
- Region selection is persisted **per locale** under
  `historical-viewer-regions:<locale>` so switching languages keeps each
  language's own columns.
- Metadata (`generateMetadata`, `src/app/page.tsx` + `[locale]/page.tsx`)
  localizes the `<title>` per locale.

## Rendering Architecture

```
content/<locale>/events/*.md
   │  gray-matter + next-mdx-remote/serialize (rehype-unwrap-images)
   ▼
src/lib/events.ts  ──►  ProcessedEvent[] (server, build time / static, per locale)
   │
   ▼
src/app/page.tsx    (default locale)   ─┐
src/app/[locale]/page.tsx (other)      ─┴─ Server Component
   │
   ▼
src/components/LocaleProvider.tsx (client context: locale, t, region names)
   │
   ▼
<TimelineApp/> (client)
   ├── selectedRegions state (localStorage, per-locale key)
   ├── <Timeline events filteredByRegions/>
   │     └── CSS grid: column 1 = dates, column n = selected region n
   │           └── <EventCard/> → onClick → <EventTooltip/> (modal)
   └── <FloatingRegionPanel/>  — pick/search regions, drag, select-all
```

## Component Design

### 1. Timeline (`Timeline.tsx`)

**Props:**
```typescript
interface TimelineProps {
  events: ProcessedEvent[];
  selectedRegions: string[];
}
```

**Behavior:**
- Renders a CSS grid with `130px repeat(N, minmax(170px, 230px))` columns.
  Region columns are capped at 230px so they sit close together instead of
  stretching to fill the viewport; the grid no longer forces a 680px minimum,
  so with a single region selected the timeline fits mobile widths without
  horizontal scroll.
- Column 1 is the date/timeline lane (monospace date + blue dot on a right
  border); columns 2..n+1 map to `selectedRegions` in order.
- One row per unique event date; events that match multiple selected regions
  appear in each matching column.
- Horizontally scrollable when there are more columns than fit the viewport.
- Header row shows the region name + colored dot for each column. Dot colors
  are assigned deterministically from a hash of the region name (region names
  are free-form display strings, so there is no slug → color mapping).

**Grid keys** use the raw `metadata.date` string (e.g. `1989-11-09` or
`-0044-03-15`) to avoid timezone shifts from `Date` parsing; unique keys are
sorted with `sortDateKey`. `src/lib/date.ts` owns parsing/formatting (BCE →
"44 BCE").

### 2. EventCard (`EventCard.tsx`)

**Props:**
```typescript
interface EventCardProps {
  event: ProcessedEvent;
  isActive: boolean;
  onSelect: (event, x: number, y: number) => void;
}
```

**Layout:**
```
[◎ icon] Declaratio…
```
A compact pill: 24px circular icon (gradient background) + truncated title.
It is a `<button>` — clicking calls `onSelect` with the card's position.
`isActive` highlights the card while its modal is open.

### 3. EventTooltip (`EventTooltip.tsx`)

**Props:**
```typescript
interface EventTooltipProps {
  event: ProcessedEvent;
  x: number;
  y: number;
  onClose: () => void;
}
```

**Behavior:**
- Fixed-position modal (380px) positioned below the clicked card, clamped to
  the viewport edge.
- Shows: optional image, title, formatted date, full MDX content, region
  badges, and people badges.
- Opens **only on click** (no hover trigger). Closes via: clicking the same
  card again (toggle), a transparent full-screen backdrop behind the modal,
  or the sticky close (×) button.

### 4. FloatingRegionPanel (`FloatingRegionPanel.tsx`)

**Props:**
```typescript
interface FloatingRegionPanelProps {
  availableRegions: string[];
  selectedRegions: string[];
  onSelectionChange: (regions: string[]) => void;
}
```

**Behavior:**
- Collapses to a circular globe button; expands to a draggable panel.
- Contains a **search box** that filters the region list live
  (case-insensitive substring). Shows "No regions match ..." when empty.
- Only regions declared in event frontmatter are listed (no custom regions).
- Quick actions: **Select All** (all available regions) and **Reset to
  Default** (this locale's `defaultRegions`), labels localized.
- **Placement:** mobile (< 640px) is a fixed bottom-left circular button.
  Desktop (≥ 1024px) anchors itself to the left of the page title (12px gap)
  once the header is measured; at 640–1023px it tucks below the header.
  A `userMoved` flag (set on drag) stops it from re-anchoring.

### 5. TimelineApp (`TimelineApp.tsx`)

- Rendered inside `LocaleProvider`; reads the locale via `useLocale()`.
- Default selection comes from `config.locales[locale].defaultRegions`, and is
  persisted to localStorage under `historical-viewer-regions:<locale>`.
- On mount, saved selections are filtered against currently available regions
  of that locale.
- The footer holds the **language switcher**: a localized `<select>` (Native
  language names). Changing it navigates to `/<locale>/` — the raw href is
  built from `NEXT_PUBLIC_BASE_PATH` + locale because `window.location`
  navigation does not auto-prepend Next's `basePath` (unlike `<Link>`).
- Also hosts `PwaSupport` (needs the provider context).

## Data Flow & State

- `selectedRegions` lives in `TimelineApp` (useState + localStorage).
- Timeline receives `events` already filtered by `filterEventsByRegions`.
- Modal open state (`active`) lives in `Timeline`.

```typescript
// Persistence (per locale)
const STORAGE_KEY = (locale: string) => `historical-viewer-regions:${locale}`;
// default: config.locales[locale].defaultRegions
```

## PWA

- `public/manifest.json` — app name, standalone display, icon set
  (any + maskable), theme color `#3b82f6`. Its `id`, `start_url`, and `scope`
  are the path-relative value `"."` so an installed app opens the site's own
  subpath (`https://<user>.github.io/<repo>/`) instead of the profile root.
- `src/components/PwaSupport.tsx` (production only, rendered by
  `TimelineApp`):
  - Registers `/sw.js` on load.
  - Listens for `beforeinstallprompt` and shows an install button;
    hides it once the PWA is installed (`appinstalled`).
- `public/sw.js`:
  - Pre-caches the app shell (the locale URLs `/` and `/en/`, manifest,
    `/pwa/*` icons) at install.
  - Navigation requests: network-first, falling back to the cached shell.
  - Same-origin assets (`/_next/*`, `/content/*`, `/pwa/*`):
    stale-while-revalidate.
  - Old caches purged on activate (`history-viewer-*`).

## Responsive Behavior

| Width | Timeline |
|-------|----------|
| Mobile (< 640px) | Grid scrolls horizontally; one timeline column plus region columns |
| Desktop | Centered container, same grid layout |

## Accessibility

- Cards are real `<button>`s (focus/Enter/Space work).
- `aria-expanded` reflects the open modal; `aria-label` on icon buttons.
- Focus-visible outlines defined in `globals.css`.

## Roadmap Notes

- Invoke `/create-event` in opencode to scaffold a new event MD file from a
  local file, URL, or pasted text, auto-deriving the title, date, and body.
- Favicon / metadata already set in `layout.tsx`.