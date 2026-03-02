import { formatUtcTime, formatUnixEpoch, formatTimezone, getTimezoneOffset } from './time';

describe('formatUtcTime', () => {
  it('formats a known date as UTC string', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatUtcTime(date);
    expect(result).toBe('2026-03-01 12:30:45 UTC');
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
  it('formats a date in Australia/Sydney timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'Australia/Sydney');
    expect(result).toBe('2026-03-01 23:30:45 AEDT');
  });

  it('formats a date in America/New_York timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'America/New_York');
    expect(result).toBe('2026-03-01 07:30:45 GMT-5');
  });
});

describe('getTimezoneOffset', () => {
  it('returns offset string for a timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = getTimezoneOffset(date, 'Australia/Sydney');
    expect(result).toBe('+11:00');
  });
});
