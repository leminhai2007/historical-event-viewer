import fs from "fs";
import path from "path";

export interface AppConfig {
  defaultLocale: string;
  localeOrder: string[];
  localeNames: Record<string, string>;
  defaultRegions: Record<string, string>;
}

const CONFIG_PATH = path.join(process.cwd(), "content", "config.json");
const CONTENT_DIR = path.join(process.cwd(), "content");

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const raw = fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"))
    : {};

  const localeOrder = Array.isArray(raw.localeOrder) ? raw.localeOrder : [];

  const folderLocales = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "events" &&
        entry.name !== "icons" &&
        entry.name !== "images"
    )
    .map((entry) => entry.name);

  const allLocales = Array.from(new Set([...localeOrder, ...folderLocales]));

  cached = {
    defaultLocale: raw.defaultLocale && allLocales.includes(raw.defaultLocale)
      ? raw.defaultLocale
      : allLocales[0] ?? "en",
    localeOrder: allLocales,
    localeNames: raw.localeNames ?? {},
    defaultRegions: raw.defaultRegions ?? {},
  };
  return cached;
}

export function isLocale(locale: string): boolean {
  return getConfig().localeOrder.includes(locale);
}