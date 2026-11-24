/** White Friday campaign ends 25 Dec 2026 (Pakistan). */
export const CAMPAIGN_END = new Date("2026-12-25T23:59:59+05:00");

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
};

export function getCountdownParts(now = new Date(), end = CAMPAIGN_END): CountdownParts {
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, ended: false };
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
