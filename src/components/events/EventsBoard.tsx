"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatCountdown, nextSlots, type EventType } from "@/lib/events";
import { gameTimeAt } from "@/lib/gameClock";

type Props = {
  eventTypes: EventType[];
  slotIntervalHours: number;
  serverTimezone: string;
};

function hhmm(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(ms));
}

// A clock that ticks every 10 seconds (one game minute). It is 0 on the server,
// so the server and browser HTML always match.
let clock = 0;
function subscribeToClock(onChange: () => void) {
  clock = Date.now();
  onChange();
  const id = setInterval(() => {
    clock = Date.now();
    onChange();
  }, 10_000);
  return () => clearInterval(id);
}
const noSubscribe = () => () => {};

export default function EventsBoard({ eventTypes, slotIntervalHours, serverTimezone }: Props) {
  const now = useSyncExternalStore(subscribeToClock, () => clock, () => 0);
  const localZone = useSyncExternalStore(
    noSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  );

  if (now === 0) return <p className="text-sm text-muted">Loading schedule...</p>;

  const slots = nextSlots(now, 6, slotIntervalHours);

  return (
    <div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-panel-edge bg-panel p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Server time</dt>
          <dd className="mt-1 text-2xl text-gold-bright">{hhmm(now, serverTimezone)}</dd>
          <dd className="text-xs text-muted">{serverTimezone}</dd>
        </div>
        <div className="rounded-lg border border-panel-edge bg-panel p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Your time</dt>
          <dd className="mt-1 text-2xl text-gold-bright">{hhmm(now, localZone)}</dd>
          <dd className="text-xs text-muted">{localZone}</dd>
        </div>
        <div className="rounded-lg border border-panel-edge bg-panel p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Game time</dt>
          <dd className="mt-1 text-2xl text-gold-bright">{gameTimeAt(now)}</dd>
          <dd className="text-xs text-muted">In-game day (4 real hours)</dd>
        </div>
      </dl>

      <h2 className="mt-10 text-xl">Next event</h2>
      <p className="mt-1 text-sm text-muted">
        An event starts every {slotIntervalHours} hours. The server picks the type at random, so
        it is one of the {eventTypes.length} below.
      </p>
      <p className="mt-3 text-3xl text-gold-bright">in {formatCountdown(slots[0] - now)}</p>

      <ul className="mt-4 divide-y divide-panel-edge rounded-lg border border-panel-edge bg-panel text-sm">
        {slots.map((s, i) => (
          <li key={s} className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-muted">{i === 0 ? "Next" : `+${i * slotIntervalHours}h`}</span>
            <span>
              {hhmm(s, serverTimezone)} server · <span className="text-gold-bright">{hhmm(s, localZone)}</span> yours
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl">Event types</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {eventTypes.map((e) => (
          <li key={e.id} className="rounded-lg border border-panel-edge bg-panel p-5">
            <h3 className="text-lg">{e.name}</h3>
            <p className="mt-2 text-sm text-muted">{e.description}</p>
            {e.guide && (
              <Link href={e.guide} className="mt-3 inline-block text-sm text-gold-bright underline">
                Read the guide
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
