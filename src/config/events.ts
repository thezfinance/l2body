import type { GameEvent } from "@/lib/events";

// The event list. Times are UTC. Replace the template rows with real server events.
// To add an event, copy one block, give it a unique id, and set the days and time.
export const EVENTS: GameEvent[] = [
  {
    id: "example-pvp",
    name: "Example PvP Event",
    kind: "pvp",
    description: "Template row: replace with a real event (for example a team battle).",
    schedule: [{ days: [1, 3, 5], time: "18:00" }],
    durationMinutes: 60,
    template: true,
  },
  {
    id: "example-siege",
    name: "Example Castle Siege",
    kind: "siege",
    description: "Template row: replace with the real siege schedule.",
    schedule: [{ days: [0], time: "20:00" }],
    durationMinutes: 120,
    template: true,
  },
];
