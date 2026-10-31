import EventsBoard from "@/components/events/EventsBoard";
import { EVENT_TYPES, SLOT_INTERVAL_HOURS } from "@/config/events";
import { SERVER } from "@/config/server";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <section>
      <h1 className="text-3xl">Events</h1>
      <p className="mt-2 mb-6 text-muted">
        Server events, with the time in server time, in your own time and in game time.
      </p>
      <EventsBoard
        eventTypes={EVENT_TYPES}
        slotIntervalHours={SLOT_INTERVAL_HOURS}
        serverTimezone={SERVER.timezone}
      />
    </section>
  );
}
