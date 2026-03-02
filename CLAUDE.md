# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Chrome extension (Manifest V3) that shows current UTC time, Unix epoch (click to copy), and a configurable second timezone. Built with TypeScript + Webpack.

## Commands

- `npm run build` — Build extension to `dist/`
- `npm test` — Run Jest tests
- `npm run test:watch` — Run tests in watch mode
- `npx jest src/time.test.ts --verbose` — Run a single test file
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
- **Release** (`.github/workflows/publish.yml`): On push to main, reads version from `package.json`, auto-tags if new, and creates a GitHub Release with `extension.zip` attached. Bump version in both `package.json` and `src/manifest.json` before pushing to trigger a release.

## Local Testing

Load unpacked extension from `dist/` in `chrome://extensions` (enable Developer Mode).
