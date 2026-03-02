# UTC/Unix Clock — Chrome Extension

A minimal Chrome extension that shows the current UTC time and Unix epoch at a glance. Click the epoch to copy it to your clipboard.

## Why?

**Database timestamps are Unix epochs.** When debugging production data or querying databases that store timestamps as integers, you need the current epoch *right now* — not after googling "unix timestamp converter" for the hundredth time.

**Incident reports need both UTC and local time.** Writing a post-mortem at 2am and need to reference "the alert fired at 14:32 UTC (01:32 AEDT)"? This extension shows both side by side, updating live.

## Features

- **Live UTC clock** — current date and time in UTC, updates every second
- **Unix epoch** — click to copy to clipboard instantly
- **Second timezone** — configurable dropdown (default: Sydney). Handy for distributed teams or referencing local time alongside UTC
- **Dark theme** — easy on the eyes during late-night incidents

## Install

### From Chrome Web Store

*(Coming soon)*

### Load Locally (Developer Mode)

```bash
git clone git@github.com:zhongdai/chrome-utc-now.git
cd chrome-utc-now
npm install
npm run build
```

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder

## Development

Requires Node.js 20+.

```bash
npm install          # install dependencies
just test            # run all tests
just lint            # eslint
just build           # build to dist/
just check           # lint + test + build
just install         # build + open Chrome extensions page
just package         # build + zip for store upload
```

Run a single test file:

```bash
just test-file src/time.test.ts
```

## CI/CD

- **CI** runs lint, test, and build on every push/PR to `main`
- **Publish** builds and uploads to Chrome Web Store on `v*` tags

Publishing requires these GitHub secrets:

| Secret | Description |
|--------|-------------|
| `CHROME_EXTENSION_ID` | Your extension's ID from the Chrome Web Store |
| `CHROME_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `CHROME_CLIENT_SECRET` | OAuth client secret |
| `CHROME_REFRESH_TOKEN` | OAuth refresh token for the Chrome Web Store API |

## License

MIT
