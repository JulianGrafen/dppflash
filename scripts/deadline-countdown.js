function pad2(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function getLang() {
  return window.DppI18n?.getLang?.() === 'en' ? 'en' : 'de';
}

function formatSr(days, hours, minutes, expired) {
  const lang = getLang();
  if (expired) {
    return lang === 'en' ? 'Battery passport is now mandatory.' : 'Batteriepass-Pflicht ist jetzt in Kraft.';
  }
  if (lang === 'en') {
    return `${days} days, ${hours} hours, and ${minutes} minutes until battery passport mandatory`;
  }
  return `Noch ${days} Tage, ${hours} Stunden und ${minutes} Minuten bis zur Batteriepass-Pflicht`;
}

function ensureDigitSlots(container, segmentName) {
  const segment = container.querySelector(`[data-countdown-segment="${segmentName}"]`);
  if (!segment) return [];

  const digitsRoot = segment.querySelector('[data-countdown-digits]');
  if (!digitsRoot) return [];

  const slots = [...digitsRoot.querySelectorAll('[data-countdown-digit]')];
  if (slots.length === 2) return slots;

  digitsRoot.textContent = '';
  return [0, 1].map(() => {
    const span = document.createElement('span');
    span.className = 'deadline-timer__digit';
    span.setAttribute('data-countdown-digit', '');
    span.textContent = '0';
    digitsRoot.appendChild(span);
    return span;
  });
}

function setDigits(slots, value) {
  const str = pad2(value);
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

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  const days = Math.floor(diff / dayMs);
  diff -= days * dayMs;
  const hours = Math.floor(diff / hourMs);
  diff -= hours * hourMs;
  const minutes = Math.floor(diff / minuteMs);

  const expired = target <= now;

  const daysEl = root.querySelector('[data-countdown-days]');
  if (daysEl) daysEl.textContent = String(days);

  const hourSlots = ensureDigitSlots(root, 'hours');
  const minSlots = ensureDigitSlots(root, 'minutes');
  setDigits(hourSlots, hours);
  setDigits(minSlots, minutes);

  root.classList.toggle('is-expired', expired);

  const expiredEl = root.querySelector('.deadline-timer__expired');
  const bodyEl = root.querySelector('.deadline-timer__body');
  if (expiredEl) expiredEl.hidden = !expired;
  if (bodyEl) bodyEl.hidden = expired;

  const sr = root.querySelector('[data-countdown-sr]');
  if (sr) sr.textContent = formatSr(days, hours, minutes, expired);
}

function initTimer(root) {
  updateTimer(root);

  const tick = () => updateTimer(root);
  const intervalId = window.setInterval(tick, 60_000);

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
