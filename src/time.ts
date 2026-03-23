export interface FormatOptions {
  hour12: boolean;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  hour12: false,
  dateFormat: 'YYYY-MM-DD',
};

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

function orderDateParts(
  year: string,
  month: string,
  day: string,
  dateFormat: FormatOptions['dateFormat'],
): string {
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function formatHour12(hours: number, minutes: string, seconds: string): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes}:${seconds} ${period}`;
}

export function formatUtcTime(date: Date, options: FormatOptions = DEFAULT_FORMAT_OPTIONS): string {
  const y = date.getUTCFullYear().toString();
  const m = padTwo(date.getUTCMonth() + 1);
  const d = padTwo(date.getUTCDate());
  const h = date.getUTCHours();
  const min = padTwo(date.getUTCMinutes());
  const s = padTwo(date.getUTCSeconds());

  const datePart = orderDateParts(y, m, d, options.dateFormat);
  const timePart = options.hour12 ? formatHour12(h, min, s) : `${padTwo(h)}:${min}:${s}`;

  return `${datePart} ${timePart} UTC`;
}

export function formatUnixEpoch(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString();
}

function formatWithIntl(
  date: Date,
  timezone: string | undefined,
  options: FormatOptions,
): string {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: options.hour12,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  const second = get('second');
  const dayPeriod = get('dayPeriod');
  const tzName = get('timeZoneName');

  const datePart = orderDateParts(year, month, day, options.dateFormat);
  const timePart = options.hour12
    ? `${hour}:${minute}:${second} ${dayPeriod}`
    : `${hour}:${minute}:${second}`;

  return `${datePart} ${timePart} ${tzName}`;
}

export function formatTimezone(
  date: Date,
  timezone: string,
  options: FormatOptions = DEFAULT_FORMAT_OPTIONS,
): string {
  return formatWithIntl(date, timezone, options);
}

export function formatLocalTime(
  date: Date,
  options: FormatOptions = DEFAULT_FORMAT_OPTIONS,
): string {
  return formatWithIntl(date, undefined, options);
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

export function getTimezoneOffset(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  return offset.replace('GMT', '');
}
