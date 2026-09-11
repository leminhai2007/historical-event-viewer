"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Timeline from "@/components/Timeline";
import FloatingRegionPanel from "@/components/FloatingRegionPanel";
import PwaSupport from "@/components/PwaSupport";
import { extractUniqueRegions, filterEventsByRegions } from "@/lib/regions";
import { ProcessedEvent } from "@/types/event";
import { template, useLocale } from "@/components/LocaleProvider";

type Listener = () => void;
const listeners = new Set<Listener>();
const cachedRegions: Record<string, string[]> = {};

function regionStorageKey(locale: string): string {
  return `historical-viewer-regions:${locale}`;
}

function readStoredRegions(locale: string, fallback: string[]): string[] {
  const cached = cachedRegions[locale];
  if (cached !== undefined) return cached;
  let value: string[] = fallback;
  try {
    const raw = localStorage.getItem(regionStorageKey(locale));
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      value = parsed
        .map((r: string) => String(r).trim())
        .filter((r: string) => r.length > 0);
    }
  } catch {
    // Ignore unreadable storage.
  }
  cachedRegions[locale] = value;
  return value;
}

function subscribe(callback: Listener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function updateRegions(locale: string, next: string[], fallback: string[]) {
  const value = next.length ? next : fallback;
  cachedRegions[locale] = value;
  try {
    localStorage.setItem(regionStorageKey(locale), JSON.stringify(value));
  } catch {
    // Ignore storage write failures.
  }
  listeners.forEach((listener) => listener());
}

export default function TimelineApp({
  locale,
  events,
}: {
  locale: string;
  events: ProcessedEvent[];
}) {
  const { config, t, defaultRegions, regionLabel, locales } = useLocale();

  const fallbackRegions = useMemo(() => defaultRegions, [defaultRegions]);
  const getSnapshot = useCallback(
    () => readStoredRegions(locale, fallbackRegions),
    [locale, fallbackRegions]
  );
  const getServerSnapshot = useCallback(() => fallbackRegions, [fallbackRegions]);

  const storedRegions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const allRegions = useMemo(
    () => extractUniqueRegions(events, locale),
    [events, locale]
  );
  const selectedRegions = useMemo(
    () => storedRegions.filter((r) => allRegions.includes(r)),
    [storedRegions, allRegions]
  );
  const onSelectionChange = useCallback(
    (next: string[]) => updateRegions(locale, next, fallbackRegions),
    [locale, fallbackRegions]
  );

  const filteredEvents = filterEventsByRegions(events, selectedRegions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t["app.title"]}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {template(t["subtitle.events"], { n: filteredEvents.length })}
              {selectedRegions.length > 0 &&
                template(t["subtitle.regions"], {
                  regions: selectedRegions.map(regionLabel).join(", "),
                })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Timeline events={filteredEvents} selectedRegions={selectedRegions} />
      </main>

      <FloatingRegionPanel
        availableRegions={allRegions}
        selectedRegions={selectedRegions}
        onSelectionChange={onSelectionChange}
      />

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-500">
          <a
            href="https://github.com/leminhai2007/historical-event-viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {t["footer.contribute"]}
          </a>

          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="sr-only">{t["footer.language"]}</span>
            <select
              value={locale}
              onChange={(e) => {
                const target = e.target.value;
                const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
                const href =
                  target === config.defaultLocale
                    ? `${base}/`
                    : `${base}/${target}/`;
                window.location.href = href;
              }}
              className="appearance-none bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              {locales.map((l) => (
                <option key={l} value={l}>
                  {config.localeNames[l] ?? l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </footer>

      <PwaSupport />
    </div>
  );
}