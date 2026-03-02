import { formatUtcTime, formatLocalTime, formatUnixEpoch, formatTimezone, getTimezoneOffset } from './time';
import { getTimezone, setTimezone, TIMEZONE_OPTIONS } from './settings';

let currentTimezone = 'Australia/Sydney';
let showUtc = true;

function updateDisplay(): void {
  const now = new Date();

  const utcEl = document.getElementById('utc-time');
  const utcLabel = document.getElementById('utc-label');
  const epochEl = document.getElementById('unix-epoch');
  const tzTimeEl = document.getElementById('tz-time');
  const tzOffsetEl = document.getElementById('tz-offset');

  if (utcEl) utcEl.textContent = showUtc ? formatUtcTime(now) : formatLocalTime(now);
  if (utcLabel) utcLabel.textContent = showUtc ? 'UTC' : 'LOCAL';
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
  utcEl.textContent = formatUtcTime(date);
  localEl.textContent = formatLocalTime(date);
  resultsEl.style.display = 'block';
}

function handleTimezoneChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  currentTimezone = select.value;
  setTimezone(currentTimezone);
  updateDisplay();
}

function init(): void {
  currentTimezone = getTimezone();

  const select = document.getElementById('tz-select') as HTMLSelectElement | null;
  if (select) {
    populateTimezoneSelect(select);
    select.addEventListener('change', handleTimezoneChange);
  }

  const epochEl = document.getElementById('unix-epoch');
  if (epochEl) {
    epochEl.addEventListener('click', handleEpochClick);
  }

  const utcEl = document.getElementById('utc-time');
  if (utcEl) {
    utcEl.addEventListener('click', () => {
      showUtc = !showUtc;
      updateDisplay();
    });
  }

  const epochInput = document.getElementById('epoch-input');
  if (epochInput) {
    epochInput.addEventListener('input', handleEpochInput);
  }

  document.querySelectorAll('.convert-value').forEach((el) => {
    el.addEventListener('click', () => {
      const feedback = el.nextElementSibling as HTMLElement | null;
      copyAndFeedback(el as HTMLElement, feedback);
    });
  });

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', init);
