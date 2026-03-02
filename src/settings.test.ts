import { getTimezone, setTimezone, TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from './settings';

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
