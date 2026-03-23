export type TimeFormat = 'iso' | 'iso-short' | 'rfc2822';

export const DEFAULT_FORMAT: TimeFormat = 'iso-short';

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatUtcIso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function formatUtcIsoShort(date: Date): string {
  const y = date.getUTCFullYear();
  const m = padTwo(date.getUTCMonth() + 1);
  const d = padTwo(date.getUTCDate());
  const h = padTwo(date.getUTCHours());
  const min = padTwo(date.getUTCMinutes());
  const s = padTwo(date.getUTCSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s} UTC`;
}

function formatUtcRfc2822(date: Date): string {
  const day = DAY_NAMES[date.getUTCDay()];
  const d = padTwo(date.getUTCDate());
  const mon = MONTH_NAMES[date.getUTCMonth()];
  const y = date.getUTCFullYear();
  const h = padTwo(date.getUTCHours());
  const min = padTwo(date.getUTCMinutes());
  const s = padTwo(date.getUTCSeconds());
  return `${day}, ${d} ${mon} ${y} ${h}:${min}:${s} GMT`;
}

export function formatUtcTime(date: Date, format: TimeFormat = DEFAULT_FORMAT): string {
  switch (format) {
    case 'iso':
      return formatUtcIso(date);
    case 'rfc2822':
      return formatUtcRfc2822(date);
    default:
      return formatUtcIsoShort(date);
  }
}

export function formatUnixEpoch(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString();
}

function getIntlParts(date: Date, timezone: string | undefined): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
    weekday: get('weekday'),
    tzName: get('timeZoneName'),
  };
}

function getOffsetString(date: Date, timezone: string | undefined): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
}

function formatLocalIso(date: Date, timezone: string | undefined): string {
  const p = getIntlParts(date, timezone);
  const offset = getOffsetString(date, timezone).replace('GMT', '');
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${offset || 'Z'}`;
}

function formatLocalIsoShort(date: Date, timezone: string | undefined): string {
  const p = getIntlParts(date, timezone);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} ${p.tzName}`;
}

function formatLocalRfc2822(date: Date, timezone: string | undefined): string {
  const p = getIntlParts(date, timezone);
  const offset = getOffsetString(date, timezone).replace('GMT', '').replace(':', '');
  return `${p.weekday}, ${p.day} ${MONTH_NAMES[parseInt(p.month, 10) - 1]} ${p.year} ${p.hour}:${p.minute}:${p.second} ${offset || '+0000'}`;
}

function formatWithFormat(
  date: Date,
  timezone: string | undefined,
  format: TimeFormat,
): string {
  switch (format) {
    case 'iso':
      return formatLocalIso(date, timezone);
    case 'rfc2822':
      return formatLocalRfc2822(date, timezone);
    default:
      return formatLocalIsoShort(date, timezone);
  }
}

export function formatTimezone(
  date: Date,
  timezone: string,
  format: TimeFormat = DEFAULT_FORMAT,
): string {
  return formatWithFormat(date, timezone, format);
}

export function formatLocalTime(
  date: Date,
  format: TimeFormat = DEFAULT_FORMAT,
): string {
  return formatWithFormat(date, undefined, format);
}

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absDiff = Math.abs(diffMs);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let value: string;
  if (seconds < 60) value = `${seconds}s`;
  else if (minutes < 60) value = `${minutes}m`;
  else if (hours < 24) value = `${hours}h ${minutes % 60}m`;
  else if (days < 365) value = `${days}d ${hours % 24}h`;
  else value = `${Math.floor(days / 365)}y ${days % 365}d`;

  return diffMs >= 0 ? `in ${value}` : `${value} ago`;
}

export function getTimezoneHour(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(date), 10);
}

export function isDaytime(date: Date, timezone: string): boolean {
  const hour = getTimezoneHour(date, timezone);
  return hour >= 6 && hour < 18;
}

export function parseDateTime(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // ISO short: "2026-03-22 11:30:45" or "2026-03-22 11:30:45 UTC/AEDT/etc"
  // Must check before native Date parse, which treats "YYYY-MM-DD HH:MM:SS" as local time
  const isoShortMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(?:\s+[A-Za-z/]+)?$/,
  );
  if (isoShortMatch) {
    const date = new Date(`${isoShortMatch[1]}T${isoShortMatch[2]}Z`);
    if (!isNaN(date.getTime())) return date;
  }

  // Native Date parse (handles ISO 8601, RFC 2822)
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;

  return null;
}

export function getTimezoneOffset(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  return offset.replace('GMT', '');
}
