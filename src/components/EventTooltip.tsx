"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ProcessedEvent } from "@/types/event";
import Image from "next/image";
import MDXContent from "./MDXContent";
import { contentUrl } from "@/lib/paths";
import { useLocale } from "@/components/LocaleProvider";

export interface EventAnchor {
  left: number;
  top: number;
  bottom: number;
}

interface EventTooltipProps {
  event: ProcessedEvent;
  anchor: EventAnchor;
  onClose: () => void;
}

export default function EventTooltip({ event, anchor, onClose }: EventTooltipProps) {
  const { locale, t, regionLabel } = useLocale();
  const imagePath = event.metadata.image
    ? contentUrl(locale, `images/${event.metadata.image}`)
    : null;

  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = Math.max(8, Math.min(anchor.left, vw - width - 8));

    let top: number;
    const below = anchor.bottom + 8;
    if (below + height <= vh - 8) {
      // Fits below the card.
      top = below;
    } else {
      const above = anchor.top - 8 - height;
      if (above >= 8) {
        // Fits above the card.
        top = above;
      } else {
        // Neither side fits entirely: pin to the top and scroll within.
        top = 8;
        el.style.maxHeight = `${vh - 16}px`;
      }
    }

    setPos({ left, top });
  }, [anchor, event]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={event.metadata.title}
      className="fixed z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-y-auto overscroll-contain"
      style={{
        left: pos?.left ?? 8,
        top: pos?.top ?? 8,
        opacity: pos === null ? 0 : 1,
      }}
    >
      <div className="sticky top-0 z-10 flex justify-end p-2 bg-white/90 backdrop-blur-sm rounded-t-xl">
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          aria-label={t["tooltip.close"]}
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="px-5 pb-5 -mt-2">
        {imagePath && (
          <Image
            src={imagePath}
            alt={event.metadata.title}
            width={380}
            height={160}
            className="w-full h-36 object-cover rounded-lg mb-3"
            unoptimized
          />
        )}

        <h3 className="text-lg font-bold text-gray-900">
          {event.metadata.title}
        </h3>
        <p className="text-xs text-gray-500 font-mono mb-3">
          {event.displayDate}
        </p>

        <div className="text-sm text-gray-700">
          <MDXContent serialized={event.serializedContent} />
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {event.metadata.tags.region.map((region) => (
              <span
                key={region}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {regionLabel(region)}
              </span>
            ))}
          </div>

          {event.metadata.tags.people &&
            event.metadata.tags.people.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">{t["regions.people"]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {event.metadata.tags.people.map((person) => (
                    <span
                      key={person}
                      className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}