"use client";

import { useState, useEffect, useRef } from "react";

interface FloatingRegionPanelProps {
  availableRegions: string[];
  selectedRegions: string[];
  onSelectionChange: (regions: string[]) => void;
}

export default function FloatingRegionPanel({
  availableRegions,
  selectedRegions,
  onSelectionChange,
}: FloatingRegionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const userMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        userMoved.current = true;
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const place = () => {
      if (userMoved.current) return;
      const container = document.querySelector<HTMLElement>("header .max-w-4xl");
      const left = container ? container.getBoundingClientRect().left : 20;
      if (left - 52 >= 12) {
        setPosition({ x: left - 52, y: 20 });
      } else {
        const header = document.querySelector<HTMLElement>("header");
        const bottom = header ? header.getBoundingClientRect().bottom : 88;
        setPosition({ x: 12, y: bottom + 12 });
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [isMobile]);

  const toggleRegion = (region: string) => {
    const normalized = region.toLowerCase();
    if (selectedRegions.includes(normalized)) {
      onSelectionChange(selectedRegions.filter((r) => r !== normalized));
    } else {
      onSelectionChange([...selectedRegions, normalized]);
    }
  };

  const filteredRegions = availableRegions.filter((r) =>
    r.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 ${isMobile ? "bottom-6 left-6" : ""}`}
      style={isMobile ? undefined : { left: position.x, top: position.y }}
    >
      {!isOpen ? (
        <button
          onClick={() => {
            setSearch("");
            setIsOpen(true);
          }}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          aria-label="Open region filter"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      ) : (
        <div
          className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72"
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 cursor-move">
            <h3 className="font-semibold text-gray-900">Regions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Close panel"
            >
              <svg
                className="w-5 h-5 text-gray-500"
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

          {/* Search */}
          <div className="p-3 pb-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search regions..."
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                aria-label="Search regions"
              />
            </div>
          </div>

          {/* Region list */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {availableRegions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No regions available
              </p>
            ) : filteredRegions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No regions match &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="space-y-2">
                {filteredRegions.map((region) => (
                  <label
                    key={region}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(region)}
                      onChange={() => toggleRegion(region)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {region}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => onSelectionChange(availableRegions)}
                className="flex-1 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => onSelectionChange(["world"])}
                className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset to World
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}