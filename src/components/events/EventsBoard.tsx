"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatCountdown, KIND_LABELS, nextStart, type GameEvent } from "@/lib/events";

type Props = { events: GameEvent[]; serverTimezone: string };

function fmt(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(ms));
}

// A clock that ticks every 30 seconds. It is 0 on the server, so server and browser HTML match.
let clock = 0;
function subscribeToClock(onChange: () => void) {
  clock = Date.now();
  onChange();
  const id = setInterval(() => {
    clock = Date.now();
    onChange();
  }, 30_000);
  return () => clearInterval(id);
}
const noSubscribe = () => () => {};

export default function EventsBoard({ events, serverTimezone }: Props) {
  const now = useSyncExternalStore(subscribeToClock, () => clock, () => 0);
  const localZone = useSyncExternalStore(
    noSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  );

  if (now === 0) return <p className="text-sm text-muted">Loading schedule...</p>;

  const rows = events
    .map((e) => ({ event: e, next: nextStart(e, now) }))
    .sort((a, b) => (a.next ?? Infinity) - (b.next ?? Infinity));

  return (
    <div>
      <p className="mb-4 text-xs text-muted">
        Server time zone: {serverTimezone} · Your time zone: {localZone}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ event, next }) => (
          <li key={event.id} className="rounded-lg border border-panel-edge bg-panel p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg">{event.name}</h2>
              <span className="shrink-0 rounded-full border border-panel-edge px-2 py-0.5 text-xs text-muted">
                {KIND_LABELS[event.kind]}
              </span>
            </div>
            {event.template && (
              <p className="mt-1 text-xs text-blood">Template data, not a real schedule</p>
            )}
            <p className="mt-2 text-sm text-muted">{event.description}</p>
            {next !== null ? (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted">Starts in</dt>
                <dd className="text-gold-bright">{formatCountdown(next - now)}</dd>
                <dt className="text-muted">Server</dt>
                <dd>{fmt(next, serverTimezone)}</dd>
                <dt className="text-muted">Yours</dt>
                <dd>{fmt(next, localZone)}</dd>
                {event.durationMinutes && (
                  <>
                    <dt className="text-muted">Lasts</dt>
                    <dd>{event.durationMinutes} min</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted">No upcoming time.</p>
            )}
            {event.guide && (
              <Link href={event.guide} className="mt-3 inline-block text-sm text-gold-bright underline">
                Read the guide
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
