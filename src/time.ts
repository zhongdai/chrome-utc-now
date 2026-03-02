function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatUtcTime(date: Date): string {
  const y = date.getUTCFullYear();
  const m = padTwo(date.getUTCMonth() + 1);
  const d = padTwo(date.getUTCDate());
  const h = padTwo(date.getUTCHours());
  const min = padTwo(date.getUTCMinutes());
  const s = padTwo(date.getUTCSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s} UTC`;
}

export function formatUnixEpoch(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString();
}

export function formatTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
  const tzName = get('timeZoneName');

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${tzName}`;
}

export function formatLocalTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
  const tzName = get('timeZoneName');

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${tzName}`;
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
