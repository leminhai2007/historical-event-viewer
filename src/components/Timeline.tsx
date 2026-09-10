"use client";

import { useMemo, useState } from "react";
import { ProcessedEvent } from "@/types/event";
import EventCard from "./EventCard";
import EventTooltip, { EventAnchor } from "./EventTooltip";

interface TimelineProps {
  events: ProcessedEvent[];
  selectedRegions: string[];
}

const regionDotColors: Record<string, string> = {
  world: "bg-blue-500",
  europe: "bg-emerald-500",
  asia: "bg-amber-500",
  "north-america": "bg-red-500",
  "south-america": "bg-orange-500",
  africa: "bg-yellow-500",
  oceania: "bg-cyan-500",
  space: "bg-purple-500",
};

function getRegionDotColor(region: string): string {
  const key = region.toLowerCase();
  return regionDotColors[key] || "bg-gray-500";
}

function formatKey(key: string): string {
  const [y, m, d] = key.split("-");
  return `${y}.${m}.${d}`;
}

export default function Timeline({ events, selectedRegions }: TimelineProps) {
  const [active, setActive] = useState<{
    event: ProcessedEvent;
    anchor: EventAnchor;
  } | null>(null);

  const toggleTooltip = (event: ProcessedEvent, anchor: EventAnchor) => {
    setActive((prev) =>
      prev && prev.event.slug === event.slug ? null : { event, anchor }
    );
  };

  const dates = useMemo(() => {
    const keys = events.map((e) => e.metadata.date);
    return Array.from(new Set(keys.length ? keys : [])).sort();
  }, [events]);

  const matrix = useMemo(() => {
    if (events.length === 0) return [];
    return dates.map((key) => ({
      key,
      cells: selectedRegions.map((region) => {
        const rl = region.toLowerCase();
        return events.filter(
          (e) =>
            e.metadata.date === key &&
            e.metadata.tags.region.some((r) => r.toLowerCase() === rl)
        );
      }),
    }));
  }, [dates, selectedRegions, events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg">No events found</p>
        <p className="text-sm">Try selecting different regions</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div
        className="grid min-w-[680px]"
        style={{
          gridTemplateColumns: `130px repeat(${selectedRegions.length}, minmax(170px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="border-b border-gray-200" />
        {selectedRegions.map((region) => (
          <div
            key={region}
            className="border-b border-gray-200 px-3 pb-3 flex items-center justify-center gap-1.5"
          >
            <span
              className={`w-2 h-2 rounded-full ${getRegionDotColor(region)}`}
            />
            <span className="text-sm font-semibold text-gray-700 capitalize">
              {region}
            </span>
          </div>
        ))}

        {/* Timeline rows */}
        {matrix.map(({ key, cells }) => (
          <div key={key} className="contents">
            {/* Date cell (timeline column) */}
            <div className="relative border-r border-gray-200 py-2.5 pr-4 text-right">
              <span className="text-xs font-mono text-gray-600">
                {formatKey(key)}
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            </div>

            {/* Region cells */}
            {cells.map((cellEvents, ci) => (
              <div
                key={ci}
                className="px-3 py-2 min-h-[40px] flex flex-wrap gap-1.5 items-center justify-center"
              >
                {cellEvents.map((event) => (
                  <EventCard
                    key={event.slug}
                    event={event}
                    isActive={active?.event.slug === event.slug}
                    onSelect={toggleTooltip}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Click-away backdrop + tooltip */}
      {active && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActive(null)}
            aria-hidden="true"
          />
          <EventTooltip
            event={active.event}
            anchor={active.anchor}
            onClose={() => setActive(null)}
          />
        </>
      )}
    </div>
  );
}