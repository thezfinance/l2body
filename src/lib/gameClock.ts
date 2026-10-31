import { GAME_CLOCK } from "@/config/server";

/** In-game time of day ("HH:MM") at a real moment (ms since epoch). */
export function gameTimeAt(realMs: number): string {
  const { minutesPerDay, realMsPerGameMinute, calibration } = GAME_CLOCK;
  const [h, m] = calibration.gameTime.split(":").map(Number);
  const gameMinutesSinceCalibration = (realMs - Date.parse(calibration.realUtc)) / realMsPerGameMinute;
  const minuteOfDay =
    (((h * 60 + m + Math.floor(gameMinutesSinceCalibration)) % minutesPerDay) + minutesPerDay) %
    minutesPerDay;
  const hh = String(Math.floor(minuteOfDay / 60)).padStart(2, "0");
  const mm = String(minuteOfDay % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
