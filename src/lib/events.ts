export type EventKind = "boss" | "pvp" | "siege" | "other";

export type GameEvent = {
  id: string;
  name: string;
  kind: EventKind;
  description: string;
  // Weekly schedule in UTC. days: 0 = Sunday ... 6 = Saturday. time: "HH:MM" (24h).
  schedule: { days: number[]; time: string }[];
  durationMinutes?: number;
  guide?: string; // optional link to a guide page, e.g. "/guides/epic-bosses/valakas"
  template?: boolean; // true = placeholder data, shown with a warning badge
};

export const KIND_LABELS: Record<EventKind, string> = {
  boss: "Boss",
  pvp: "PvP",
  siege: "Siege / Castle",
  other: "Other",
};

/** Next start time (ms since epoch) of an event after `from`, or null if it has no schedule. */
export function nextStart(event: GameEvent, from: number): number | null {
  const start = new Date(from);
  let best: number | null = null;
  for (let offset = 0; offset <= 7; offset++) {
    for (const slot of event.schedule) {
      const [h, m] = slot.time.split(":").map(Number);
      const day = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + offset, h, m),
      );
      if (!slot.days.includes(day.getUTCDay())) continue;
      const t = day.getTime();
      if (t > from && (best === null || t < best)) best = t;
    }
  }
  return best;
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  return [d ? `${d}d` : "", h || d ? `${h}h` : "", `${m}m`].filter(Boolean).join(" ");
}
