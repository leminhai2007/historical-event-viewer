import { getAllEvents } from "@/lib/events";
import TimelineApp from "@/components/TimelineApp";

export default async function Home() {
  const events = await getAllEvents();

  return <TimelineApp events={events} />;
}