import { ProcessedEvent } from "@/types/event";

export function extractUniqueRegions(
  events: ProcessedEvent[],
  locale?: string
): string[] {
  const seen = new Map<string, string>();

  events.forEach((event) => {
    event.metadata.tags.region.forEach((region) => {
      const normalized = region.trim();
      if (!normalized) return;
      const key = normalized.toLowerCase();
      if (!seen.has(key)) seen.set(key, normalized);
    });
  });

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, locale ?? undefined)
  );
}

export function filterEventsByRegions(
  events: ProcessedEvent[],
  selectedRegions: string[]
): ProcessedEvent[] {
  if (selectedRegions.length === 0) {
    return events;
  }

  const normalizedRegions = selectedRegions.map((r) => r.toLowerCase());

  return events.filter((event) =>
    event.metadata.tags.region.some((region) =>
      normalizedRegions.includes(region.toLowerCase())
    )
  );
}