import { formatUtcTime, formatUnixEpoch, formatTimezone, getTimezoneOffset } from './time';
import { getTimezone, setTimezone, TIMEZONE_OPTIONS } from './settings';

let currentTimezone = 'Australia/Sydney';

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

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', init);
