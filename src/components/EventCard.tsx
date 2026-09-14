"use client";

import { ProcessedEvent } from "@/types/event";
import Image from "next/image";
import { EventAnchor } from "./EventTooltip";
import { contentUrl } from "@/lib/paths";

interface EventCardProps {
  event: ProcessedEvent;
  isActive: boolean;
  onSelect: (event: ProcessedEvent, anchor: EventAnchor) => void;
}

export default function EventCard({ event, isActive, onSelect }: EventCardProps) {
  const iconPath = event.metadata.icon
    ? contentUrl(`icons/${event.metadata.icon}`)
    : null;

  return (
    <button
      type="button"
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        onSelect(event, {
          left: rect.left,
          top: rect.top,
          bottom: rect.bottom,
        });
      }}
      className={`
        inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer
        ${
          isActive
            ? "bg-blue-50 border-blue-300 shadow-md"
            : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200"
        }
      `}
      aria-expanded={isActive}
    >
      {/* Circle icon */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
        {iconPath ? (
          <Image
            src={iconPath}
            alt={event.metadata.title}
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        ) : (
          <svg
            className="w-3.5 h-3.5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* Event name */}
      <span className="text-xs font-medium text-gray-800 truncate">
        {event.metadata.title}
      </span>
    </button>
  );
}