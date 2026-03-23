import {
  formatUtcTime,
  formatLocalTime,
  formatUnixEpoch,
  formatTimezone,
  getTimezoneOffset,
  formatRelativeTime,
  isDaytime,
} from './time';

describe('formatUtcTime', () => {
  const date = new Date('2026-03-01T12:30:45.000Z');

  it('formats as ISO short (default)', () => {
    expect(formatUtcTime(date)).toBe('2026-03-01 12:30:45 UTC');
  });

  it('formats as ISO short explicitly', () => {
    expect(formatUtcTime(date, 'iso-short')).toBe('2026-03-01 12:30:45 UTC');
  });

  it('formats as ISO 8601', () => {
    expect(formatUtcTime(date, 'iso')).toBe('2026-03-01T12:30:45Z');
  });

  it('formats as RFC 2822', () => {
    expect(formatUtcTime(date, 'rfc2822')).toBe('Sun, 01 Mar 2026 12:30:45 GMT');
  });

  it('formats midnight as ISO 8601', () => {
    const midnight = new Date('2026-03-01T00:00:00.000Z');
    expect(formatUtcTime(midnight, 'iso')).toBe('2026-03-01T00:00:00Z');
  });
});

describe('formatLocalTime', () => {
  const date = new Date('2026-03-01T12:30:45.000Z');

  it('formats as ISO short (default)', () => {
    const result = formatLocalTime(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} .+$/);
  });

  it('formats as ISO 8601', () => {
    const result = formatLocalTime(date, 'iso');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[Z+-]/);
  });

  it('formats as RFC 2822', () => {
    const result = formatLocalTime(date, 'rfc2822');
    expect(result).toMatch(/^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/);
  });
});

describe('formatUnixEpoch', () => {
  it('returns unix epoch in seconds', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    expect(formatUnixEpoch(date)).toBe('1772368245');
  });
});

describe('formatTimezone', () => {
  const date = new Date('2026-03-01T12:30:45.000Z');

  it('formats Sydney as ISO short (default)', () => {
    expect(formatTimezone(date, 'Australia/Sydney')).toBe('2026-03-01 23:30:45 AEDT');
  });

  it('formats New York as ISO short', () => {
    expect(formatTimezone(date, 'America/New_York')).toBe('2026-03-01 07:30:45 GMT-5');
  });

  it('formats Sydney as ISO 8601', () => {
    expect(formatTimezone(date, 'Australia/Sydney', 'iso')).toBe('2026-03-01T23:30:45+11:00');
  });

  it('formats Sydney as RFC 2822', () => {
    expect(formatTimezone(date, 'Australia/Sydney', 'rfc2822')).toBe('Sun, 01 Mar 2026 23:30:45 +1100');
  });
});

describe('getTimezoneOffset', () => {
  it('returns offset string for a timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    expect(getTimezoneOffset(date, 'Australia/Sydney')).toBe('+11:00');
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
