export const DEFAULT_TIMEZONE = 'Australia/Sydney';

export const TIMEZONE_OPTIONS: readonly string[] = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Pacific/Auckland',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'US/Hawaii',
] as const;

export function getTimezone(): string {
  return localStorage.getItem('timezone') ?? DEFAULT_TIMEZONE;
}

export function setTimezone(timezone: string): void {
  localStorage.setItem('timezone', timezone);
}
