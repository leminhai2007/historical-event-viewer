"use client";

import { useMemo, useState } from "react";
import { ProcessedEvent } from "@/types/event";
import EventCard from "./EventCard";
import EventTooltip, { EventAnchor } from "./EventTooltip";
import { formatDateDisplay, sortDateKey } from "@/lib/date";
import { useLocale } from "@/components/LocaleProvider";

interface TimelineProps {
  events: ProcessedEvent[];
  selectedRegions: string[];
}

const regionDotColors: string[] = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getRegionDotColor(region: string): string {
  const s = region.toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return regionDotColors[Math.abs(hash) % regionDotColors.length];
}

export default function Timeline({ events, selectedRegions }: TimelineProps) {
  const { locale, t, regionLabel } = useLocale();
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
    const keys = Array.from(new Set(events.map((e) => e.metadata.date)));
    return keys.sort((a, b) => sortDateKey(a) - sortDateKey(b));
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
        <p className="text-lg">{t["empty.title"]}</p>
        <p className="text-sm">{t["empty.body"]}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `130px repeat(${selectedRegions.length}, minmax(170px, 230px))`,
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
            <span className="text-sm font-semibold text-gray-700">
              {regionLabel(region)}
            </span>
          </div>
        ))}

        {/* Timeline rows */}
        {matrix.map(({ key, cells }) => (
          <div key={key} className="contents">
            {/* Date cell (timeline column) */}
            <div className="relative border-r border-gray-200 py-2.5 pr-4 text-right">
              <span className="text-xs font-mono text-gray-600">
                {formatDateDisplay(key, locale)}
              </span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            </div>

            {/* Region cells */}
            {cells.map((cellEvents, ci) => (
              <div
                key={ci}
                className="px-3 py-2 min-h-[40px] flex flex-wrap gap-1.5 items-center justify-start"
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