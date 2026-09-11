"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { AppConfig } from "@/lib/config";
import { getStrings, template } from "@/lib/i18n";

export interface LocaleContextValue {
  locale: string;
  config: AppConfig;
  locales: string[];
  t: Record<string, string>;
  defaultRegions: string[];
  regionLabel: (region: string) => string;
  localeHref: (locale: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveLocale(pathname: string, locales: string[], fallback: string) {
  const first = pathname?.split("/").filter(Boolean)[0];
  return first && locales.includes(first) ? first : fallback;
}

export function LocaleProvider({
  config,
  children,
}: {
  config: AppConfig;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const locales = config.localeOrder;

  const locale = resolveLocale(pathname, locales, config.defaultLocale);

  const value = useMemo<LocaleContextValue>(() => {
    const defaultRegion = config.defaultRegions[locale];
    const defaultRegions = defaultRegion ? [defaultRegion] : [];

    return {
      locale,
      config,
      locales,
      t: getStrings(locale),
      defaultRegions,
      regionLabel: (region) => region,
      localeHref: (target) =>
        target === config.defaultLocale ? "/" : `/${target}/`,
    };
  }, [locale, config, locales]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

export function useT(): LocaleContextValue["t"] {
  return useLocale().t;
}

export function useRegionLabel(): (
  region: string
) => string {
  return useLocale().regionLabel;
}

export { template };