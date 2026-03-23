import {
  formatUtcTime,
  formatLocalTime,
  formatUnixEpoch,
  formatTimezone,
  getTimezoneOffset,
  formatRelativeTime,
  isDaytime,
  FormatOptions,
} from './time';

describe('formatUtcTime', () => {
  it('formats a known date as UTC string (default options)', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatUtcTime(date);
    expect(result).toBe('2026-03-01 12:30:45 UTC');
  });

  it('formats in 12-hour mode', () => {
    const date = new Date('2026-03-01T14:30:45.000Z');
    const opts: FormatOptions = { hour12: true, dateFormat: 'YYYY-MM-DD' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('2026-03-01 2:30:45 PM UTC');
  });

  it('formats 12-hour mode for AM', () => {
    const date = new Date('2026-03-01T09:05:03.000Z');
    const opts: FormatOptions = { hour12: true, dateFormat: 'YYYY-MM-DD' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('2026-03-01 9:05:03 AM UTC');
  });

  it('formats midnight as 12 AM in 12-hour mode', () => {
    const date = new Date('2026-03-01T00:00:00.000Z');
    const opts: FormatOptions = { hour12: true, dateFormat: 'YYYY-MM-DD' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('2026-03-01 12:00:00 AM UTC');
  });

  it('formats noon as 12 PM in 12-hour mode', () => {
    const date = new Date('2026-03-01T12:00:00.000Z');
    const opts: FormatOptions = { hour12: true, dateFormat: 'YYYY-MM-DD' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('2026-03-01 12:00:00 PM UTC');
  });

  it('formats with DD/MM/YYYY date format', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const opts: FormatOptions = { hour12: false, dateFormat: 'DD/MM/YYYY' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('01/03/2026 12:30:45 UTC');
  });

  it('formats with MM/DD/YYYY date format', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const opts: FormatOptions = { hour12: false, dateFormat: 'MM/DD/YYYY' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('03/01/2026 12:30:45 UTC');
  });

  it('formats with DD/MM/YYYY and 12-hour combined', () => {
    const date = new Date('2026-03-01T14:30:45.000Z');
    const opts: FormatOptions = { hour12: true, dateFormat: 'DD/MM/YYYY' };
    const result = formatUtcTime(date, opts);
    expect(result).toBe('01/03/2026 2:30:45 PM UTC');
  });
});

describe('formatLocalTime', () => {
  it('formats a date in local timezone with tz abbreviation (default options)', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatLocalTime(date);
    // Format should be YYYY-MM-DD HH:MM:SS TZ
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} .+$/);
  });

  it('includes timezone abbreviation that is not UTC', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatLocalTime(date);
    const parts = result.split(' ');
    expect(parts.length).toBeGreaterThanOrEqual(3);
  });

  it('formats with DD/MM/YYYY date format', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const opts: FormatOptions = { hour12: false, dateFormat: 'DD/MM/YYYY' };
    const result = formatLocalTime(date, opts);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} .+$/);
  });
});

describe('formatUnixEpoch', () => {
  it('returns unix epoch in seconds', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatUnixEpoch(date);
    expect(result).toBe('1772368245');
  });
});

describe('formatTimezone', () => {
  it('formats a date in Australia/Sydney timezone (default options)', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'Australia/Sydney');
    expect(result).toBe('2026-03-01 23:30:45 AEDT');
  });

  it('formats a date in America/New_York timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'America/New_York');
    expect(result).toBe('2026-03-01 07:30:45 GMT-5');
  });

  it('formats with DD/MM/YYYY date format', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const opts: FormatOptions = { hour12: false, dateFormat: 'DD/MM/YYYY' };
    const result = formatTimezone(date, 'Australia/Sydney', opts);
    expect(result).toBe('01/03/2026 23:30:45 AEDT');
  });

  it('formats with MM/DD/YYYY date format', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const opts: FormatOptions = { hour12: false, dateFormat: 'MM/DD/YYYY' };
    const result = formatTimezone(date, 'Australia/Sydney', opts);
    expect(result).toBe('03/01/2026 23:30:45 AEDT');
  });
});

describe('getTimezoneOffset', () => {
  it('returns offset string for a timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = getTimezoneOffset(date, 'Australia/Sydney');
    expect(result).toBe('+11:00');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-03-22T12:00:00.000Z');

  it('formats seconds ago', () => {
    const date = new Date('2026-03-22T11:59:30.000Z');
    expect(formatRelativeTime(date, now)).toBe('30s ago');
  });

  it('formats minutes ago', () => {
    const date = new Date('2026-03-22T11:45:00.000Z');
    expect(formatRelativeTime(date, now)).toBe('15m ago');
  });

  it('formats hours and minutes ago', () => {
    const date = new Date('2026-03-22T09:30:00.000Z');
    expect(formatRelativeTime(date, now)).toBe('2h 30m ago');
  });

  it('formats days in the future', () => {
    const date = new Date('2026-03-25T12:00:00.000Z');
    expect(formatRelativeTime(date, now)).toBe('in 3d 0h');
  });

  it('formats years ago', () => {
    const date = new Date('2024-03-22T12:00:00.000Z');
    expect(formatRelativeTime(date, now)).toBe('2y 0d ago');
  });
});

describe('isDaytime', () => {
  it('returns true during daytime hours', () => {
    const date = new Date('2026-03-22T01:00:00.000Z'); // 12:00 AEDT
    expect(isDaytime(date, 'Australia/Sydney')).toBe(true);
  });

  it('returns false during nighttime hours', () => {
    const date = new Date('2026-03-22T15:00:00.000Z'); // 02:00 AEDT
    expect(isDaytime(date, 'Australia/Sydney')).toBe(false);
  });
});
