import type { Metadata } from "next";
import { getConfig } from "@/lib/config";
import { getAllEvents } from "@/lib/events";
import { getStrings } from "@/lib/i18n";
import TimelineApp from "@/components/TimelineApp";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const config = getConfig();
  return config.localeOrder
    .filter((locale) => locale !== config.defaultLocale)
    .map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getStrings(locale);
  return {
    title: t["app.title"],
    description: t["app.tagline"],
    openGraph: {
      title: t["app.title"],
      description: t["app.tagline"],
    },
    twitter: {
      title: t["app.title"],
      description: t["app.tagline"],
    },
  };
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const events = await getAllEvents(locale);

  return <TimelineApp locale={locale} events={events} />;
}