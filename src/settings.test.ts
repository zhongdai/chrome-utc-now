import {
  getTimezone,
  setTimezone,
  getTheme,
  setTheme,
  getHour12,
  setHour12,
  getDateFormat,
  setDateFormat,
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
    const tz = getTimezone();
    expect(tz).toBe('Australia/Sydney');
  });

  it('returns stored timezone', () => {
    mockStorage['timezone'] = 'America/New_York';
    const tz = getTimezone();
    expect(tz).toBe('America/New_York');
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

describe('getHour12', () => {
  it('returns false when nothing stored', () => {
    expect(getHour12()).toBe(false);
  });

  it('returns true when stored as "true"', () => {
    mockStorage['hour12'] = 'true';
    expect(getHour12()).toBe(true);
  });

  it('returns false when stored as "false"', () => {
    mockStorage['hour12'] = 'false';
    expect(getHour12()).toBe(false);
  });
});

describe('setHour12', () => {
  it('stores true', () => {
    setHour12(true);
    expect(mockStorage['hour12']).toBe('true');
  });

  it('stores false', () => {
    setHour12(false);
    expect(mockStorage['hour12']).toBe('false');
  });
});

describe('getDateFormat', () => {
  it('returns YYYY-MM-DD when nothing stored', () => {
    expect(getDateFormat()).toBe('YYYY-MM-DD');
  });

  it('returns stored date format', () => {
    mockStorage['dateFormat'] = 'DD/MM/YYYY';
    expect(getDateFormat()).toBe('DD/MM/YYYY');
  });
});

describe('setDateFormat', () => {
  it('stores date format', () => {
    setDateFormat('MM/DD/YYYY');
    expect(mockStorage['dateFormat']).toBe('MM/DD/YYYY');
  });
});
