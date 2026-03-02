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

export function getTimezoneOffset(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  return offset.replace('GMT', '');
}
