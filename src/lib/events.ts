import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { ProcessedEvent } from "@/types/event";
import {
  formatDateDisplay,
  normalizeDateString,
  parseDateFromFilename,
  sortDateKey,
} from "./date";
import { getConfig } from "./config";

export function eventsDir(locale: string): string {
  return path.join(process.cwd(), "content", "events", locale);
}

export function extractTitleFromFilename(filename: string): string {
  const match = filename.match(/^-?\d{4}(?:\.\d{2})?(?:\.\d{2})?_(.+)\.md$/);
  if (match) {
    return match[1].replace(/([A-Z])/g, " $1").trim();
  }
  return filename.replace(/\.md$/, "");
}

export async function getAllEvents(locale = "en"): Promise<ProcessedEvent[]> {
  const dir = eventsDir(locale);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const events: ProcessedEvent[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const filenameDate = parseDateFromFilename(filename);
      let date: string;
      if (data.date instanceof Date && !isNaN(data.date.getTime())) {
        date = data.date.toISOString().slice(0, 10);
      } else {
        const raw = String(data.date ?? "").trim();
        date = raw ? normalizeDateString(raw) : filenameDate;
      }
      const title = data.title || extractTitleFromFilename(filename);

      const serializedContent = await serialize(content, {
        mdxOptions: {
          rehypePlugins: [rehypeUnwrapImages],
        },
      });

      return {
        slug: filename.replace(/\.md$/, ""),
        filename,
        metadata: {
          title,
          date,
          icon: data.icon,
          image: data.image,
          tags: {
            region: data.tags?.region?.length
              ? data.tags.region
              : [getConfig().defaultRegions[locale] ?? "World"],
            people: data.tags?.people || [],
          },
        },
        content,
        dateSortKey: sortDateKey(date),
        displayDate: formatDateDisplay(date, locale),
        serializedContent,
      };
    })
  );

  return events.sort((a, b) => a.dateSortKey - b.dateSortKey);
}