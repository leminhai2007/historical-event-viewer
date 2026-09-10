import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { ProcessedEvent } from "@/types/event";

export const EVENTS_DIR = path.join(process.cwd(), "content", "events");

export function parseDateFromFilename(filename: string): string {
  const match = filename.match(/^(\d{4})(?:\.(\d{2}))?(?:\.(\d{2}))?/);
  if (!match) return "";
  const year = match[1];
  const month = match[2] || "01";
  const day = match[3] || "01";
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "Unknown Date";
  const parts = dateStr.split("-");
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (month === "01" && day === "01") return year;
  if (day === "01") return `${year}.${month}`;
  return `${year}.${month}.${day}`;
}

export function extractTitleFromFilename(filename: string): string {
  const match = filename.match(/^\d{4}(?:\.\d{2})?(?:\.\d{2})?_(.+)\.md$/);
  if (match) {
    return match[1].replace(/([A-Z])/g, " $1").trim();
  }
  return filename.replace(/\.md$/, "");
}

export async function getAllEvents(): Promise<ProcessedEvent[]> {
  if (!fs.existsSync(EVENTS_DIR)) return [];

  const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith(".md"));

  const events: ProcessedEvent[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(EVENTS_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const dateFromFilename = parseDateFromFilename(filename);
      const date = data.date || dateFromFilename;
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
            region: data.tags?.region || ["world"],
            people: data.tags?.people || [],
          },
        },
        content,
        parsedDate: new Date(date),
        displayDate: formatDateDisplay(date),
        serializedContent,
      };
    })
  );

  return events.sort(
    (a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()
  );
}