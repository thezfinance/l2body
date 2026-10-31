import type { EventType } from "@/lib/events";

// A new event starts every SLOT_INTERVAL_HOURS hours, on even UTC hours (00:00, 02:00, ...).
// The server picks one of the event types at random for each slot, so the type of the next
// event can't be predicted. A later phase will let the owner record what was picked.
export const SLOT_INTERVAL_HOURS = 2;

export const EVENT_TYPES: EventType[] = [
  { id: "mtb", name: "Multi Team Battle", description: "Rules and rewards: to be written." },
  { id: "ctb", name: "Capture The Base", description: "Rules and rewards: to be written." },
  { id: "ebc", name: "Epic Boss Challenge", description: "Rules and rewards: to be written." },
  { id: "ktvt", name: "Korean TvT", description: "Rules and rewards: to be written." },
  { id: "dm", name: "Death Match", description: "Rules and rewards: to be written." },
];
