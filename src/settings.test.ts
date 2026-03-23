import {
  getTimezone,
  setTimezone,
  getTheme,
  setTheme,
  getFormat,
  setFormat,
  TIMEZONE_OPTIONS,
  DEFAULT_TIMEZONE,
} from './settings';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  jest.clearAllMocks();
});

describe('DEFAULT_TIMEZONE', () => {
  it('is Australia/Sydney', () => {
    expect(DEFAULT_TIMEZONE).toBe('Australia/Sydney');
  });
});

describe('TIMEZONE_OPTIONS', () => {
  it('contains common timezones', () => {
    expect(TIMEZONE_OPTIONS.length).toBeGreaterThan(5);
    expect(TIMEZONE_OPTIONS).toContain('Australia/Sydney');
    expect(TIMEZONE_OPTIONS).toContain('America/New_York');
    expect(TIMEZONE_OPTIONS).toContain('Europe/London');
  });
});

describe('getTimezone', () => {
  it('returns default when nothing stored', () => {
    expect(getTimezone()).toBe('Australia/Sydney');
  });

  it('returns stored timezone', () => {
    mockStorage['timezone'] = 'America/New_York';
    expect(getTimezone()).toBe('America/New_York');
  });
});

describe('setTimezone', () => {
  it('stores timezone', () => {
    setTimezone('Europe/London');
    expect(mockStorage['timezone']).toBe('Europe/London');
  });
});

describe('getTheme', () => {
  it('returns dark when nothing stored', () => {
    expect(getTheme()).toBe('dark');
  });

  it('returns stored theme', () => {
    mockStorage['theme'] = 'light';
    expect(getTheme()).toBe('light');
  });
});

describe('setTheme', () => {
  it('stores theme', () => {
    setTheme('light');
    expect(mockStorage['theme']).toBe('light');
  });
});

describe('getFormat', () => {
  it('returns iso-short when nothing stored', () => {
    expect(getFormat()).toBe('iso-short');
  });

  it('returns stored format', () => {
    mockStorage['format'] = 'iso';
    expect(getFormat()).toBe('iso');
  });

  it('returns rfc2822 when stored', () => {
    mockStorage['format'] = 'rfc2822';
    expect(getFormat()).toBe('rfc2822');
  });
});

describe('setFormat', () => {
  it('stores format', () => {
    setFormat('rfc2822');
    expect(mockStorage['format']).toBe('rfc2822');
  });
});
