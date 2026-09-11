"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Timeline from "@/components/Timeline";
import FloatingRegionPanel from "@/components/FloatingRegionPanel";
import { extractUniqueRegions, filterEventsByRegions } from "@/lib/regions";
import { ProcessedEvent } from "@/types/event";

const STORAGE_KEY = "historical-viewer-regions";
const DEFAULT_REGIONS: string[] = ["world"];

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedRegions: string[] | null = null;

function readStoredRegions(): string[] {
  if (cachedRegions !== null) return cachedRegions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    cachedRegions =
      Array.isArray(parsed) && parsed.length > 0
        ? parsed.map((r: string) => String(r).toLowerCase())
        : DEFAULT_REGIONS;
  } catch {
    cachedRegions = DEFAULT_REGIONS;
  }
  return cachedRegions;
}

function getSnapshot(): string[] {
  return readStoredRegions();
}

function getServerSnapshot(): string[] {
  return DEFAULT_REGIONS;
}

function subscribe(callback: Listener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function updateRegions(next: string[]) {
  cachedRegions = next.length ? next : DEFAULT_REGIONS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedRegions));
  listeners.forEach((listener) => listener());
}

export default function TimelineApp({ events }: { events: ProcessedEvent[] }) {
  const storedRegions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const allRegions = useMemo(() => extractUniqueRegions(events), [events]);
  const selectedRegions = useMemo(
    () => storedRegions.filter((r) => allRegions.includes(r)),
    [storedRegions, allRegions]
  );
  const onSelectionChange = useCallback((next: string[]) => {
    updateRegions(next.map((r) => r.toLowerCase()));
  }, []);

  const filteredEvents = filterEventsByRegions(events, selectedRegions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Historical Event Viewer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore {filteredEvents.length} events
            {selectedRegions.length > 0 &&
              ` in ${selectedRegions.join(", ")}`}
          </p>
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
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <a
            href="https://github.com/leminhai2007/historical-event-viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Contribute content on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}