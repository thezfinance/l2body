import EventsBoard from "@/components/events/EventsBoard";
import { EVENTS } from "@/config/events";
import { SERVER } from "@/config/server";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <section>
      <h1 className="text-3xl">Events</h1>
      <p className="mt-2 mb-6 text-muted">
        Upcoming server events, in server time and in your own time.
      </p>
      <EventsBoard events={EVENTS} serverTimezone={SERVER.timezone} />
    </section>
  );
}
