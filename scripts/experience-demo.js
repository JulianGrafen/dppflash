const URLS = [
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new/extract',
  'app.dppflash.de/passports/powercell-500',
  'app.dppflash.de/passports/powercell-500/publish',
  'app.dppflash.de/p/powercell-500',
];

const STEP_COUNT = 6;

function initExperience() {
  const root = document.getElementById('expRoot');
  const urlEl = document.getElementById('expUrl');
  const storySteps = [...document.querySelectorAll('.exp-story-step')];
  const screens = [...document.querySelectorAll('.exp-screen')];
  const dots = [...document.querySelectorAll('[data-step-dot]')];
  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');
  if (!root || !storySteps.length) return;

  let current = 0;
  let scrollLock = false;

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
    });

    if (urlEl) urlEl.textContent = URLS[current] || URLS[0];
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) {
      nextBtn.disabled = current === STEP_COUNT - 1;
      nextBtn.textContent =
        window.DppI18n?.t('exp.nav.next') ??
        (current === STEP_COUNT - 2 ? 'Weiter' : 'Weiter');
    }

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
