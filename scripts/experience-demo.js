const URLS = [
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new/extract',
  'app.dppflash.de/passports/powercell-500',
  'app.dppflash.de/passports/powercell-500/publish',
  'app.dppflash.de/p/powercell-500',
];

const SIDEBAR_ACTIVE = ['new', 'new', 'new', 'passports', 'passports', 'registry'];
const STEP_COUNT = 6;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

function initInlineCountdown() {
  const root = document.querySelector('[data-exp-countdown]');
  if (!root) return;

  const deadlineRaw = root.getAttribute('data-deadline');
  const target = Date.parse(deadlineRaw || '');
  if (Number.isNaN(target)) return;

  const daySlots = [...root.querySelectorAll('[data-countdown-segment="days"] [data-countdown-digit]')];
  const hourSlots = [...root.querySelectorAll('[data-countdown-segment="hours"] [data-countdown-digit]')];
  const minSlots = [...root.querySelectorAll('[data-countdown-segment="minutes"] [data-countdown-digit]')];

  function pad(slots, value) {
    const str = String(Math.max(0, value)).padStart(slots.length, '0');
    slots.forEach((el, i) => {
      el.textContent = str[i] ?? '0';
    });
  }

  function tick() {
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
    pad(daySlots, days);
    pad(hourSlots, hours);
    pad(minSlots, minutes);
  }

  tick();
  window.setInterval(tick, 30_000);
}

function initExperience() {
  const root = document.getElementById('expRoot');
  const urlEl = document.getElementById('expUrl');
  const storySteps = [...document.querySelectorAll('.exp-story-step')];
  const screens = [...document.querySelectorAll('.exp-screen')];
  const dots = [...document.querySelectorAll('[data-step-dot]')];
  const sidebarItems = [...document.querySelectorAll('[data-exp-sidebar]')];
  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');
  const extractScreen = document.getElementById('expScreenExtract');
  const extractPct = document.getElementById('expExtractPct');
  const barFill = document.getElementById('expBarFill');
  const checks = [...document.querySelectorAll('[data-exp-check]')];

  if (!root || !storySteps.length) return;

  let current = 0;
  let scrollLock = false;
  let extractAnimId = 0;
  let checkAnimTimers = [];

  initInlineCountdown();

  function clearCheckTimers() {
    checkAnimTimers.forEach((id) => window.clearTimeout(id));
    checkAnimTimers = [];
  }

  function resetExtractAnim() {
    extractAnimId += 1;
    if (extractScreen) {
      extractScreen.classList.remove('is-anim-extract');
    }
    if (extractPct) extractPct.textContent = '0%';
    if (barFill) barFill.style.width = '0%';
  }

  function resetChecks() {
    clearCheckTimers();
    checks.forEach((el) => el.classList.remove('is-done'));
  }

  function runExtractAnim() {
    if (!extractScreen || !extractPct || !barFill) return;
    resetExtractAnim();
    const token = extractAnimId;

    if (prefersReducedMotion()) {
      extractPct.textContent = '100%';
      barFill.style.width = '100%';
      extractScreen.classList.add('is-anim-extract');
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      if (token !== extractAnimId) return;
      const t = Math.min(1, (now - start) / duration);
      const pct = Math.round(t * 100);
      extractPct.textContent = `${pct}%`;
      barFill.style.width = `${pct}%`;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        extractScreen.classList.add('is-anim-extract');
      }
    }
    requestAnimationFrame(frame);
  }

  function runCheckAnim() {
    resetChecks();
    if (prefersReducedMotion()) {
      checks.forEach((el) => el.classList.add('is-done'));
      return;
    }
    checks.forEach((el, i) => {
      const id = window.setTimeout(() => {
        el.classList.add('is-done');
      }, 400 + i * 600);
      checkAnimTimers.push(id);
    });
  }

  function runFileAnim(screen) {
    if (!screen) return;
    screen.classList.remove('is-anim-files');
    void screen.offsetWidth;
    screen.classList.add('is-anim-files');
  }

  function updateSidebar(step) {
    const key = SIDEBAR_ACTIVE[step] || 'new';
    sidebarItems.forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-exp-sidebar') === key);
    });
  }

  function updateMobilePreview(step) {
    const preview = storySteps[step]?.querySelector('.exp-story-preview');
    const screen = screens[step];
    if (!preview || !screen) return;

    preview.innerHTML = '';
    const shell = document.createElement('div');
    shell.className = 'exp-app exp-app--preview';
    shell.innerHTML =
      '<div class="exp-app__chrome"><div class="exp-app__dots" aria-hidden="true"><span class="exp-app__dot"></span><span class="exp-app__dot"></span><span class="exp-app__dot"></span></div><div class="exp-app__url"></div></div><div class="exp-app__body"><div class="exp-app__main"></div></div>';
    const url = shell.querySelector('.exp-app__url');
    if (url) url.textContent = URLS[step] || URLS[0];
    const main = shell.querySelector('.exp-app__main');
    if (main) {
      const clone = screen.cloneNode(true);
      clone.classList.add('is-active');
      main.appendChild(clone);
    }
    preview.appendChild(shell);
    preview.setAttribute('aria-hidden', 'false');
  }

  function runStepAnimations(step) {
    const screen = screens[step];
    if (step === 1) runFileAnim(screen);
    if (step === 2) runExtractAnim();
    if (step === 4) runCheckAnim();
    if (step !== 2) resetExtractAnim();
    if (step !== 4) resetChecks();
    if (step !== 1 && screen) screen.classList.remove('is-anim-files');
  }

  function setStep(index, { scrollToStory = false } = {}) {
    const next = Math.max(0, Math.min(STEP_COUNT - 1, index));
    if (next === current && !scrollToStory) return;
    current = next;

    root.dataset.expStep = String(current);
    storySteps.forEach((el, i) => el.classList.toggle('is-active', i === current));
    screens.forEach((el, i) => {
      el.classList.toggle('is-active', i === current);
      if (i !== current) {
        el.classList.remove('was-active');
      } else {
        el.classList.add('was-active');
      }
    });
    dots.forEach((el, i) => {
      el.classList.toggle('is-active', i === current);
      el.classList.toggle('is-done', i < current);
      if (i === current) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });

    if (urlEl) urlEl.textContent = URLS[current] || URLS[0];
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) {
      nextBtn.disabled = current === STEP_COUNT - 1;
      nextBtn.textContent = window.DppI18n?.t('exp.nav.next') ?? 'Weiter';
    }

    updateSidebar(current);
    updateMobilePreview(current);
    runStepAnimations(current);

    if (scrollToStory && storySteps[current]) {
      scrollLock = true;
      storySteps[current].scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        scrollLock = false;
      }, 600);
    }
  }

  prevBtn?.addEventListener('click', () => setStep(current - 1, { scrollToStory: true }));
  nextBtn?.addEventListener('click', () => setStep(current + 1, { scrollToStory: true }));

  const observer = new IntersectionObserver(
    (entries) => {
      if (scrollLock) return;
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const idx = storySteps.indexOf(visible.target);
      if (idx >= 0) setStep(idx);
    },
    { threshold: [0.35, 0.5, 0.65], rootMargin: '-20% 0px -20% 0px' },
  );
  storySteps.forEach((el) => observer.observe(el));

  window.addEventListener('dppflash:langchange', () => setStep(current));

  setStep(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperience);
} else {
  initExperience();
}
