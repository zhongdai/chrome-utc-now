export type Theme = 'dark' | 'light';
export type TimeFormat = 'iso' | 'iso-short' | 'rfc2822';

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

export function getFormat(): TimeFormat {
  return (localStorage.getItem('format') as TimeFormat) ?? 'iso-short';
}

export function setFormat(format: TimeFormat): void {
  localStorage.setItem('format', format);
}

export function getReverseConverter(): boolean {
  return localStorage.getItem('reverseConverter') === 'true';
}

export function setReverseConverter(value: boolean): void {
  localStorage.setItem('reverseConverter', String(value));
}
