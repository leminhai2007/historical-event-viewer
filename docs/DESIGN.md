# Historical Event Viewer - Design Document

## Overview

A responsive Progressive Web App (PWA) that renders historical events as a
multi-column timeline. Events are stored as Markdown files in
`content/events/`, one file per event. Users pick which regions to display;
each selected region becomes its own column. Clicking an event card opens a
detail modal.

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
│   ├── events/                  # Markdown event files (YYYY.MM.DD_Name.md)
│   ├── icons/                   # Event icons (SVG) — served at /content/icons/
│   └── images/                  # Event images (SVG) — served at /content/images/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout: fonts, PWA meta, SW registration
│   │   ├── page.tsx             # Server Component: loads + serializes events
│   │   ├── content/[...path]/route.ts  # Serves files from content/ (icons, images)
│   │   └── globals.css          # Tailwind + custom styles/animations
│   ├── components/
│   │   ├── TimelineApp.tsx       # Client shell: region state + persistence
│   │   ├── Timeline.tsx          # Column-grid timeline table
│   │   ├── EventCard.tsx         # Compact round card (click to open details)
│   │   ├── EventTooltip.tsx      # Click-to-open detail modal
│   │   ├── MDXContent.tsx        # Client MDX renderer (+ image path resolution)
│   │   ├── FloatingRegionPanel.tsx # Draggable region picker w/ search
│   │   └── PwaSupport.tsx        # SW registration + install prompt button
│   ├── lib/
│   │   ├── events.ts             # MD parsing + MDX serialization
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
icon: "rocket.svg"                       # Optional: file in content/icons/
image: "moon-landing.svg"                # Optional: file in content/images/
tags:
  region: ["world", "space"]             # Required: at least one region
  people: ["Neil Armstrong"]             # Optional: related people
---
```

### Content

Standard Markdown rendered below the frontmatter. Images referenced by bare
filename (e.g. `![Alt](moon-landing.svg)`) are resolved to
`/content/images/<filename>` by `MDXContent`. Full URLs and `/`-prefixed
paths are left untouched. Event icons/images live under `content/` (not
`public/`) and are served by the catch-all route handler
`src/app/content/[...path]/route.ts`. Use the opencode command `/create-event`
to scaffold a new event from a document, URL, or pasted text.

## Rendering Architecture

```
content/events/*.md
   │  gray-matter + next-mdx-remote/serialize (rehype-unwrap-images)
   ▼
src/lib/events.ts  ──►  ProcessedEvent[] (server, build time / static)
   │
   ▼
src/app/page.tsx (Server Component)
   │
   ▼
<TimelineApp/> (client)
   ├── selectedRegions state (localStorage persisted)
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
- Renders a CSS grid with `130px repeat(N, minmax(170px, 1fr))` columns.
- Column 1 is the date/timeline lane (monospace date + blue dot on a right
  border); columns 2..n+1 map to `selectedRegions` in order.
- One row per unique event date; events that match multiple selected regions
  appear in each matching column.
- Horizontally scrollable when there are more columns than fit the viewport.
- Header row shows the region name + colored dot for each column.

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
- Quick actions: **Select All** (all available regions) and **Reset to World**.

### 5. TimelineApp (`TimelineApp.tsx`)

- Default selection `["world"]`, persisted to localStorage under
  `historical-viewer-regions`.
- On mount, saved selections are filtered against currently available regions.
- Header shows the number of visible events and the selected regions.

## Data Flow & State

- `selectedRegions` lives in `TimelineApp` (useState + localStorage).
- Timeline receives `events` already filtered by `filterEventsByRegions`.
- Modal open state (`active`) lives in `Timeline`.

```typescript
// Persistence
const STORAGE_KEY = "historical-viewer-regions";
// default: ["world"]
```

## PWA

- `public/manifest.json` — app name, standalone display, icon set
  (any + maskable), theme color `#3b82f6`.
- `src/components/PwaSupport.tsx` (production only):
  - Registers `/sw.js` on load.
  - Listens for `beforeinstallprompt` and shows an install button;
    hides it once the PWA is installed (`appinstalled`).
- `public/sw.js`:
  - Pre-caches the app shell (`/`, manifest, `/pwa/*` icons) at install.
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