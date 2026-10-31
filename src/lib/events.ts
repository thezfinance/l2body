export type EventType = {
  id: string;
  name: string;
  description: string;
  guide?: string; // optional link to a guide page
};

/**
 * Start times of the next `count` event slots after `from` (ms since epoch).
 * Slots begin on UTC hours that are multiples of `intervalHours` (every 2 hours = 00:00, 02:00, ...).
 */
export function nextSlots(from: number, count: number, intervalHours: number): number[] {
  const step = intervalHours * 3_600_000;
  const first = Math.floor(from / step) * step + step; // epoch is 00:00 UTC, so this aligns to UTC hours
  return Array.from({ length: count }, (_, i) => first + i * step);
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}
