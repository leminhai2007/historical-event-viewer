export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function contentUrl(locale: string, path: string): string {
  return `${basePath}/content/${locale}/${path.replace(/^\/+/, "")}`;
}

export function pwaUrl(path: string): string {
  return `${basePath}/pwa/${path.replace(/^\/+/, "")}`;
}