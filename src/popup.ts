import {
  formatUtcTime,
  formatLocalTime,
  formatUnixEpoch,
  formatTimezone,
  getTimezoneOffset,
  formatRelativeTime,
  isDaytime,
  parseDateTime,
  TimeFormat,
} from './time';
import {
  getTimezone,
  setTimezone,
  getTheme,
  setTheme,
  getFormat,
  setFormat,
  getReverseConverter,
  setReverseConverter,
  TIMEZONE_OPTIONS,
  Theme,
} from './settings';

let currentTimezone = 'Australia/Sydney';
let currentFormat: TimeFormat = 'iso-short';
let reverseEnabled = false;

function updateDisplay(): void {
  const now = new Date();

  const utcEl = document.getElementById('utc-time');
  const localEl = document.getElementById('local-time');
  const epochEl = document.getElementById('unix-epoch');
  const tzTimeEl = document.getElementById('tz-time');
  const tzOffsetEl = document.getElementById('tz-offset');
  const tzDayNightEl = document.getElementById('tz-daynight');

  if (utcEl) utcEl.textContent = formatUtcTime(now, currentFormat);
  if (localEl) localEl.textContent = formatLocalTime(now, currentFormat);
  if (epochEl) epochEl.textContent = formatUnixEpoch(now);
  if (tzTimeEl) tzTimeEl.textContent = formatTimezone(now, currentTimezone, currentFormat);
  if (tzOffsetEl) tzOffsetEl.textContent = `UTC${getTimezoneOffset(now, currentTimezone)}`;
  if (tzDayNightEl) tzDayNightEl.textContent = isDaytime(now, currentTimezone) ? '\u2600' : '\u263E';
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

async function copyAndFeedback(el: HTMLElement, feedbackEl: HTMLElement | null): Promise<void> {
  if (!el.textContent) return;
  await navigator.clipboard.writeText(el.textContent);
  if (feedbackEl) {
    feedbackEl.classList.add('visible');
    setTimeout(() => feedbackEl.classList.remove('visible'), 1500);
  }
}

async function handleEpochClick(): Promise<void> {
  const epochEl = document.getElementById('unix-epoch');
  const feedbackEl = document.getElementById('copy-feedback');
  if (!epochEl) return;
  await copyAndFeedback(epochEl, feedbackEl);
}

function tryParseEpoch(raw: string): Date | null {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99999999999) return null;
  return new Date(parsed * 1000);
}

function handleEpochInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const resultsEl = document.getElementById('convert-results');
  const utcEl = document.getElementById('convert-utc');
  const localEl = document.getElementById('convert-local');
  const relativeEl = document.getElementById('convert-relative');
  const epochRowEl = document.getElementById('convert-epoch-row');
  const epochEl = document.getElementById('convert-epoch');

  if (!resultsEl || !utcEl || !localEl) return;

  const raw = input.value.trim();
  if (!raw) {
    resultsEl.style.display = 'none';
    return;
  }

  // Try epoch first (all-digit input)
  let date = tryParseEpoch(raw);
  let isReverse = false;

  // If not a valid epoch and reverse is enabled, try parsing as date string
  if (!date && reverseEnabled) {
    date = parseDateTime(raw);
    isReverse = date !== null;
  }

  if (!date) {
    resultsEl.style.display = 'none';
    return;
  }

  // Show epoch row only for reverse conversion
  if (epochRowEl && epochEl) {
    if (isReverse) {
      epochEl.textContent = formatUnixEpoch(date);
      epochRowEl.style.display = 'block';
    } else {
      epochRowEl.style.display = 'none';
    }
  }

  utcEl.textContent = formatUtcTime(date, currentFormat);
  localEl.textContent = formatLocalTime(date, currentFormat);
  if (relativeEl) relativeEl.textContent = formatRelativeTime(date);
  resultsEl.style.display = 'block';
}

function handleTimezoneChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  currentTimezone = select.value;
  setTimezone(currentTimezone);
  updateDisplay();
}

function applyTheme(theme: Theme): void {
  document.body.classList.toggle('light', theme === 'light');
}

function init(): void {
  currentTimezone = getTimezone();

  // Load settings
  const theme = getTheme();
  currentFormat = getFormat();
  reverseEnabled = getReverseConverter();
  applyTheme(theme);

  // Timezone select
  const select = document.getElementById('tz-select') as HTMLSelectElement | null;
  if (select) {
    populateTimezoneSelect(select);
    select.addEventListener('change', handleTimezoneChange);
  }

  // Epoch click-to-copy
  const epochEl = document.getElementById('unix-epoch');
  if (epochEl) {
    epochEl.addEventListener('click', handleEpochClick);
  }

  // Click-to-copy on time values
  document.querySelectorAll('.copyable-row .time-value').forEach((el) => {
    el.addEventListener('click', () => {
      const feedback = el.nextElementSibling as HTMLElement | null;
      copyAndFeedback(el as HTMLElement, feedback);
    });
  });

  // Epoch converter input
  const epochInput = document.getElementById('epoch-input');
  if (epochInput) {
    epochInput.addEventListener('input', handleEpochInput);
  }

  // Settings panel toggle
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Theme select
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement | null;
  if (themeSelect) {
    themeSelect.value = theme;
    themeSelect.addEventListener('change', () => {
      const newTheme = themeSelect.value as Theme;
      setTheme(newTheme);
      applyTheme(newTheme);
    });
  }

  // Format select
  const formatSelect = document.getElementById('format-select') as HTMLSelectElement | null;
  if (formatSelect) {
    formatSelect.value = currentFormat;
    formatSelect.addEventListener('change', () => {
      currentFormat = formatSelect.value as TimeFormat;
      setFormat(currentFormat);
      updateDisplay();
    });
  }

  // Reverse converter toggle
  const reverseToggle = document.getElementById('reverse-toggle') as HTMLInputElement | null;
  const epochInput2 = document.getElementById('epoch-input') as HTMLInputElement | null;
  if (reverseToggle) {
    reverseToggle.checked = reverseEnabled;
    if (epochInput2) {
      epochInput2.placeholder = reverseEnabled
        ? 'Enter epoch or date string...'
        : 'Enter unix timestamp...';
    }
    reverseToggle.addEventListener('change', () => {
      reverseEnabled = reverseToggle.checked;
      setReverseConverter(reverseEnabled);
      if (epochInput2) {
        epochInput2.placeholder = reverseEnabled
          ? 'Enter epoch or date string...'
          : 'Enter unix timestamp...';
      }
    });
  }

  // Version footer
  const versionEl = document.getElementById('version');
  if (versionEl) {
    const version = chrome.runtime.getManifest().version;
    versionEl.textContent = `v${version}`;
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', init);
