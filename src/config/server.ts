// Settings that describe the game server. Change them here, not in the pages.
export const SERVER = {
  name: "L2 Reborn Eternal x10 (Interlude)",
  // Timezone of the server clock. Checked against the owner on 2026-10-31:
  // server time 18:34 when the owner's local time (UTC+2) was 20:34, so the server runs on UTC.
  timezone: "UTC",
} as const;

// The in-game day/night clock is separate from real time: one game day lasts 4 real hours,
// so one game minute is 10 real seconds. We calibrate it from one real reading.
// If the clock on the site drifts from the game, update these two lines with a fresh reading.
export const GAME_CLOCK = {
  minutesPerDay: 1440,
  realMsPerGameMinute: 10_000,
  calibration: { realUtc: "2026-10-31T18:34:00Z", gameTime: "21:43" },
} as const;
