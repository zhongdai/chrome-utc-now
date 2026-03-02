import { getTimezone, setTimezone, TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from './settings';

// Mock chrome.storage.local
const mockStorage: Record<string, unknown> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn((keys: string[], cb: (result: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          if (key in mockStorage) result[key] = mockStorage[key];
        }
        cb(result);
      }),
      set: jest.fn((items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(mockStorage, items);
        cb?.();
      }),
    },
  },
};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
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
  it('returns default when nothing stored', async () => {
    const tz = await getTimezone();
    expect(tz).toBe('Australia/Sydney');
  });

  it('returns stored timezone', async () => {
    mockStorage['timezone'] = 'America/New_York';
    const tz = await getTimezone();
    expect(tz).toBe('America/New_York');
  });
});

describe('setTimezone', () => {
  it('stores timezone', async () => {
    await setTimezone('Europe/London');
    expect(mockStorage['timezone']).toBe('Europe/London');
  });
});
