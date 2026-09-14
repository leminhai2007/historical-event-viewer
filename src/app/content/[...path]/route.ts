import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const CONTENT_DIR = path.join(process.cwd(), "content");

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
}

export function generateStaticParams() {
  const roots = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(CONTENT_DIR, entry.name));

  return roots.flatMap((root) =>
    walk(root)
      .filter((file) => MIME_TYPES[path.extname(file).toLowerCase()])
      .map((file) => ({
        path: path.relative(CONTENT_DIR, file).split(path.sep),
      }))
  );
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const relative = segments.join(path.sep);
  const resolved = path.resolve(CONTENT_DIR, relative);

  if (!resolved.startsWith(CONTENT_DIR + path.sep) || segments.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  return new NextResponse(new Uint8Array(fs.readFileSync(resolved)), {
    headers: {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}