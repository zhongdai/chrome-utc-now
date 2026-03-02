# Chrome UTC/Unix Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome extension that shows current UTC time and Unix epoch (click to copy), plus a configurable second timezone, with CI/CD to publish to Chrome Web Store.

**Architecture:** Manifest V3 popup extension. Pure `time.ts` module handles formatting/conversion (fully testable). `popup.ts` wires DOM updates, clipboard, and timezone selection. `settings.ts` wraps `chrome.storage.local` for timezone preference. GitHub Actions CI runs lint+test+build on PRs; publish workflow builds zip and uploads to Chrome Web Store on version tags.

**Tech Stack:** TypeScript, Webpack 5, Jest, ESLint, Prettier, chrome-webstore-upload, GitHub Actions

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `webpack.config.js`
- Create: `jest.config.js`
- Create: `.eslintrc.json`
- Create: `.prettierrc`
- Create: `.gitignore`

**Step 1: Initialize npm and install dependencies**

```bash
cd /Users/zdai/rokt/chrome-utc-unix
npm init -y
npm install --save-dev typescript webpack webpack-cli ts-loader copy-webpack-plugin jest ts-jest @types/jest @types/chrome eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 3: Create webpack.config.js**

```js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/popup.css', to: 'popup.css' },
      ],
    }),
  ],
};
```

**Step 4: Create jest.config.js**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
};
```

**Step 5: Create .eslintrc.json**

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

**Step 6: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

**Step 7: Create .gitignore**

```
node_modules/
dist/
*.zip
.DS_Store
```

**Step 8: Add scripts to package.json**

Add these scripts:
```json
{
  "scripts": {
    "build": "webpack",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint 'src/**/*.ts'",
    "format": "prettier --write 'src/**/*.ts'",
    "package": "npm run build && cd dist && zip -r ../extension.zip ."
  }
}
```

**Step 9: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold project with TS, Webpack, Jest, ESLint"
```

---

### Task 2: Time Formatting Module (TDD)

**Files:**
- Create: `src/time.ts`
- Create: `src/time.test.ts`

**Step 1: Write failing tests**

```ts
// src/time.test.ts
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
    expect(result).toBe('1772191845');
  });
});

describe('formatTimezone', () => {
  it('formats a date in Australia/Sydney timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'Australia/Sydney');
    // Sydney is UTC+11 in March (AEDT)
    expect(result).toBe('2026-03-01 23:30:45 AEDT');
  });

  it('formats a date in America/New_York timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = formatTimezone(date, 'America/New_York');
    expect(result).toBe('2026-03-01 07:30:45 EST');
  });
});

describe('getTimezoneOffset', () => {
  it('returns offset string for a timezone', () => {
    const date = new Date('2026-03-01T12:30:45.000Z');
    const result = getTimezoneOffset(date, 'Australia/Sydney');
    expect(result).toBe('+11:00');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/time.test.ts -v
```

Expected: FAIL — module not found.

**Step 3: Implement time.ts**

```ts
// src/time.ts

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

export function getTimezoneOffset(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  // offset is like "GMT+11:00", strip "GMT"
  return offset.replace('GMT', '');
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/time.test.ts -v
```

Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/time.ts src/time.test.ts
git commit -m "feat: add time formatting module with tests"
```

---

### Task 3: Settings Module (TDD)

**Files:**
- Create: `src/settings.ts`
- Create: `src/settings.test.ts`

**Step 1: Write failing tests**

```ts
// src/settings.test.ts
import { getTimezone, setTimezone, TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from './settings';

// Mock chrome.storage.local
const mockStorage: Record<string, unknown> = {};
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
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/settings.test.ts -v
```

Expected: FAIL

**Step 3: Implement settings.ts**

```ts
// src/settings.ts

export const DEFAULT_TIMEZONE = 'Australia/Sydney';

export const TIMEZONE_OPTIONS: readonly string[] = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Pacific/Auckland',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'US/Hawaii',
] as const;

export function getTimezone(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['timezone'], (result) => {
      resolve((result['timezone'] as string) ?? DEFAULT_TIMEZONE);
    });
  });
}

export function setTimezone(timezone: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ timezone }, () => resolve());
  });
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/settings.test.ts -v
```

Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/settings.ts src/settings.test.ts
git commit -m "feat: add settings module for timezone preference"
```

---

### Task 4: Manifest, Popup HTML, and CSS

**Files:**
- Create: `src/manifest.json`
- Create: `src/popup.html`
- Create: `src/popup.css`

**Step 1: Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "UTC/Unix Clock",
  "version": "1.0.0",
  "description": "Shows current UTC time and Unix epoch with a configurable second timezone.",
  "permissions": ["storage"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "UTC/Unix Clock"
  },
  "icons": {}
}
```

Note: `clipboardWrite` is not needed in MV3 — `navigator.clipboard.writeText` works in extension popups without it.

**Step 2: Create popup.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>UTC / Unix Clock</h1>

    <section class="time-block">
      <label>UTC</label>
      <div id="utc-time" class="time-value"></div>
      <div class="epoch-row">
        <span id="unix-epoch" class="epoch-value" title="Click to copy"></span>
        <span id="copy-feedback" class="copy-feedback">Copied!</span>
      </div>
    </section>

    <section class="time-block">
      <div class="tz-header">
        <select id="tz-select"></select>
      </div>
      <div id="tz-time" class="time-value"></div>
      <div id="tz-offset" class="offset-value"></div>
    </section>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

**Step 3: Create popup.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  width: 320px;
  background: #1a1a2e;
  color: #e0e0e0;
}

.container {
  padding: 16px;
}

h1 {
  font-size: 14px;
  text-align: center;
  color: #a0a0c0;
  margin-bottom: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.time-block {
  background: #16213e;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.time-block label {
  font-size: 11px;
  color: #7a7aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 18px;
  color: #ffffff;
  margin: 4px 0;
}

.epoch-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.epoch-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  color: #4fc3f7;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.epoch-value:hover {
  background: #1a3a5c;
}

.copy-feedback {
  font-size: 11px;
  color: #4caf50;
  opacity: 0;
  transition: opacity 0.3s;
}

.copy-feedback.visible {
  opacity: 1;
}

.tz-header {
  margin-bottom: 8px;
}

#tz-select {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #3a3a5e;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  width: 100%;
  cursor: pointer;
}

.offset-value {
  font-size: 11px;
  color: #7a7aaa;
  margin-top: 2px;
}
```

**Step 4: Commit**

```bash
git add src/manifest.json src/popup.html src/popup.css
git commit -m "feat: add manifest, popup HTML, and CSS"
```

---

### Task 5: Popup Logic

**Files:**
- Create: `src/popup.ts`

**Step 1: Implement popup.ts**

```ts
// src/popup.ts
import { formatUtcTime, formatUnixEpoch, formatTimezone, getTimezoneOffset } from './time';
import { getTimezone, setTimezone, TIMEZONE_OPTIONS } from './settings';

let currentTimezone = 'Australia/Sydney';
let intervalId: ReturnType<typeof setInterval> | null = null;

function updateDisplay(): void {
  const now = new Date();

  const utcEl = document.getElementById('utc-time');
  const epochEl = document.getElementById('unix-epoch');
  const tzTimeEl = document.getElementById('tz-time');
  const tzOffsetEl = document.getElementById('tz-offset');

  if (utcEl) utcEl.textContent = formatUtcTime(now);
  if (epochEl) epochEl.textContent = formatUnixEpoch(now);
  if (tzTimeEl) tzTimeEl.textContent = formatTimezone(now, currentTimezone);
  if (tzOffsetEl) tzOffsetEl.textContent = `UTC${getTimezoneOffset(now, currentTimezone)}`;
}

function populateTimezoneSelect(select: HTMLSelectElement): void {
  for (const tz of TIMEZONE_OPTIONS) {
    const option = document.createElement('option');
    option.value = tz;
    option.textContent = tz.replace(/_/g, ' ');
    select.appendChild(option);
  }
  select.value = currentTimezone;
}

async function handleEpochClick(): Promise<void> {
  const epochEl = document.getElementById('unix-epoch');
  const feedbackEl = document.getElementById('copy-feedback');
  if (!epochEl?.textContent) return;

  await navigator.clipboard.writeText(epochEl.textContent);

  if (feedbackEl) {
    feedbackEl.classList.add('visible');
    setTimeout(() => feedbackEl.classList.remove('visible'), 1500);
  }
}

async function handleTimezoneChange(event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement;
  currentTimezone = select.value;
  await setTimezone(currentTimezone);
  updateDisplay();
}

async function init(): Promise<void> {
  currentTimezone = await getTimezone();

  const select = document.getElementById('tz-select') as HTMLSelectElement | null;
  if (select) {
    populateTimezoneSelect(select);
    select.addEventListener('change', handleTimezoneChange);
  }

  const epochEl = document.getElementById('unix-epoch');
  if (epochEl) {
    epochEl.addEventListener('click', handleEpochClick);
  }

  updateDisplay();
  intervalId = setInterval(updateDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', init);
```

**Step 2: Build and verify manually**

```bash
npm run build
```

Expected: `dist/` folder with `popup.js`, `popup.html`, `popup.css`, `manifest.json`.

**Step 3: Commit**

```bash
git add src/popup.ts
git commit -m "feat: add popup logic with live clock, clipboard, timezone select"
```

---

### Task 6: CI/CD GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/publish.yml`

**Step 1: Create CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: extension-dist
          path: dist/
```

**Step 2: Create publish workflow**

```yaml
# .github/workflows/publish.yml
name: Publish to Chrome Web Store

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run package
      - name: Upload to Chrome Web Store
        uses: mnao305/chrome-extension-upload@v5.0.0
        with:
          file-path: extension.zip
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

**Step 3: Commit**

```bash
mkdir -p .github/workflows
git add .github/workflows/ci.yml .github/workflows/publish.yml
git commit -m "ci: add CI and Chrome Web Store publish workflows"
```

---

### Task 7: CLAUDE.md and Final Verification

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Chrome extension (Manifest V3) that shows current UTC time, Unix epoch (click to copy), and a configurable second timezone. Built with TypeScript + Webpack.

## Commands

- `npm run build` — Build extension to `dist/`
- `npm test` — Run Jest tests
- `npm run test:watch` — Run tests in watch mode
- `npx jest src/time.test.ts -v` — Run a single test file
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run package` — Build + zip for Chrome Web Store upload

## Architecture

- `src/time.ts` — Pure time formatting functions (UTC, Unix epoch, timezone conversion via `Intl.DateTimeFormat`). All logic is testable without DOM or Chrome APIs.
- `src/settings.ts` — Reads/writes timezone preference to `chrome.storage.local`. Exports `TIMEZONE_OPTIONS` list.
- `src/popup.ts` — DOM entry point. Wires live clock (1s interval), clipboard copy, and timezone `<select>`. Imports from `time.ts` and `settings.ts`.
- `src/manifest.json` — MV3 manifest. Permissions: `storage` only.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): lint + test + build on push/PR to main.
- **Publish** (`.github/workflows/publish.yml`): On `v*` tag, builds zip and uploads to Chrome Web Store. Requires GitHub secrets: `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`.

## Local Testing

Load unpacked extension from `dist/` in `chrome://extensions` (enable Developer Mode).
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```

**Step 3: Run full verification**

```bash
npm run lint && npm test && npm run build
```

Expected: All pass, `dist/` has `popup.js`, `popup.html`, `popup.css`, `manifest.json`.
