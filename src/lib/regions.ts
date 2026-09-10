import { ProcessedEvent } from "@/types/event";

export function extractUniqueRegions(events: ProcessedEvent[]): string[] {
  const regionSet = new Set<string>();

  events.forEach((event) => {
    event.metadata.tags.region.forEach((region) => {
      regionSet.add(region.toLowerCase());
    });
  });

  return Array.from(regionSet).sort();
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
