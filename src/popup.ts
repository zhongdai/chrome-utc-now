import {
  formatUtcTime,
  formatLocalTime,
  formatUnixEpoch,
  formatTimezone,
  getTimezoneOffset,
  FormatOptions,
} from './time';
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
  Theme,
  DateFormat,
} from './settings';

let currentTimezone = 'Australia/Sydney';
let formatOptions: FormatOptions = { hour12: false, dateFormat: 'YYYY-MM-DD' };

function updateDisplay(): void {
  const now = new Date();

  const utcEl = document.getElementById('utc-time');
  const localEl = document.getElementById('local-time');
  const epochEl = document.getElementById('unix-epoch');
  const tzTimeEl = document.getElementById('tz-time');
  const tzOffsetEl = document.getElementById('tz-offset');

  if (utcEl) utcEl.textContent = formatUtcTime(now, formatOptions);
  if (localEl) localEl.textContent = formatLocalTime(now, formatOptions);
  if (epochEl) epochEl.textContent = formatUnixEpoch(now);
  if (tzTimeEl) tzTimeEl.textContent = formatTimezone(now, currentTimezone, formatOptions);
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

function handleEpochInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const resultsEl = document.getElementById('convert-results');
  const utcEl = document.getElementById('convert-utc');
  const localEl = document.getElementById('convert-local');

  if (!resultsEl || !utcEl || !localEl) return;

  const raw = input.value.trim();
  if (!raw) {
    resultsEl.style.display = 'none';
    return;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99999999999) {
    resultsEl.style.display = 'none';
    return;
  }

  const date = new Date(parsed * 1000);
  utcEl.textContent = formatUtcTime(date, formatOptions);
  localEl.textContent = formatLocalTime(date, formatOptions);
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
  const hour12 = getHour12();
  const dateFormat = getDateFormat();
  formatOptions = { hour12, dateFormat };
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

  // Convert value click-to-copy
  document.querySelectorAll('.convert-value').forEach((el) => {
    el.addEventListener('click', () => {
      const feedback = el.nextElementSibling as HTMLElement | null;
      copyAndFeedback(el as HTMLElement, feedback);
    });
  });

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

  // Hour format select
  const hourSelect = document.getElementById('hour-select') as HTMLSelectElement | null;
  if (hourSelect) {
    hourSelect.value = hour12 ? '12h' : '24h';
    hourSelect.addEventListener('change', () => {
      const newHour12 = hourSelect.value === '12h';
      setHour12(newHour12);
      formatOptions = { ...formatOptions, hour12: newHour12 };
      updateDisplay();
    });
  }

  // Date format select
  const dateFormatSelect = document.getElementById('date-format-select') as HTMLSelectElement | null;
  if (dateFormatSelect) {
    dateFormatSelect.value = dateFormat;
    dateFormatSelect.addEventListener('change', () => {
      const newDateFormat = dateFormatSelect.value as DateFormat;
      setDateFormat(newDateFormat);
      formatOptions = { ...formatOptions, dateFormat: newDateFormat };
      updateDisplay();
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
