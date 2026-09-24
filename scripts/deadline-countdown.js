function getLang() {
  return window.DppI18n?.getLang?.() === 'en' ? 'en' : 'de';
}

function formatSr(days, expired) {
  const lang = getLang();
  if (expired) {
    return lang === 'en' ? 'Battery passport is now mandatory.' : 'Batteriepass-Pflicht ist jetzt in Kraft.';
  }
  if (lang === 'en') {
    return `${days} days until battery passport mandatory`;
  }
  return `Noch ${days} Tage bis zur Batteriepass-Pflicht`;
}

function ensureDigitSlots(container, segmentName) {
  const segment = container.querySelector(`[data-countdown-segment="${segmentName}"]`);
  if (!segment) return [];

  const digitsRoot = segment.querySelector('[data-countdown-digits]');
  if (!digitsRoot) return [];

  const slots = [...digitsRoot.querySelectorAll('[data-countdown-digit]')];
  if (slots.length > 0) return slots;

  const count = Number(segment.getAttribute('data-countdown-digit-count')) || 2;
  digitsRoot.textContent = '';
  return Array.from({ length: count }, () => {
    const span = document.createElement('span');
    span.className = 'deadline-timer__digit';
    span.setAttribute('data-countdown-digit', '');
    span.textContent = '0';
    digitsRoot.appendChild(span);
    return span;
  });
}

function setDigits(slots, value) {
  const str = String(Math.max(0, value)).padStart(slots.length, '0');
  slots.forEach((el, i) => {
    el.textContent = str[i] ?? '0';
  });
}

function updateTimer(root) {
  const deadlineRaw = root.getAttribute('data-deadline');
  if (!deadlineRaw) return;

  const target = Date.parse(deadlineRaw);
  if (Number.isNaN(target)) return;

  const now = Date.now();
  let diff = Math.max(0, target - now);

  const dayMs = 24 * 60 * 60 * 1000;

  const days = Math.floor(diff / dayMs);

  const expired = target <= now;

  const daySlots = ensureDigitSlots(root, 'days');
  setDigits(daySlots, days);

  root.classList.toggle('is-expired', expired);

  const expiredEl = root.querySelector('.deadline-timer__expired');
  const bodyEl = root.querySelector('.deadline-timer__body');
  if (expiredEl) expiredEl.hidden = !expired;
  if (bodyEl) bodyEl.hidden = expired;

  const sr = root.querySelector('[data-countdown-sr]');
  if (sr) sr.textContent = formatSr(days, expired);
}

function initTimer(root) {
  updateTimer(root);

  const tick = () => updateTimer(root);
  const intervalId = window.setInterval(tick, 60 * 60 * 1000);

  window.addEventListener('dppflash:langchange', tick);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });

  root._countdownIntervalId = intervalId;
}

function initAll() {
  document.querySelectorAll('[data-deadline]').forEach(initTimer);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
