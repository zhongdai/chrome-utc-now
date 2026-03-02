export type Theme = 'dark' | 'light';
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';

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

export function getTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) ?? 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem('theme', theme);
}

export function getHour12(): boolean {
  return localStorage.getItem('hour12') === 'true';
}

export function setHour12(value: boolean): void {
  localStorage.setItem('hour12', String(value));
}

export function getDateFormat(): DateFormat {
  return (localStorage.getItem('dateFormat') as DateFormat) ?? 'YYYY-MM-DD';
}

export function setDateFormat(format: DateFormat): void {
  localStorage.setItem('dateFormat', format);
}
