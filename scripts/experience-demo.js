const URLS = [
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new/extract',
  'app.dppflash.de/passports/voltstride-720',
  'app.dppflash.de/passports/voltstride-720/publish',
  'app.dppflash.de/p/voltstride-720',
];

const SIDEBAR_ACTIVE = ['new', 'new', 'new', 'passports', 'passports', 'registry'];
const STEP_COUNT = 6;
const MOBILE_LAYOUT_MQ = window.matchMedia?.('(max-width: 999px)');

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

function isMobileLayout() {
  return MOBILE_LAYOUT_MQ?.matches ?? false;
}

function initExperience() {
  const root = document.getElementById('expRoot');
  const urlEl = document.getElementById('expUrl');
  const mobilePreviewMount = document.getElementById('expMobilePreview');
  const stageMain = document.querySelector('.exp-stage .exp-app__main');
  const storySteps = [...document.querySelectorAll('.exp-story-step')];
  const screens = stageMain ? [...stageMain.querySelectorAll('.exp-screen')] : [];
  const dots = [...document.querySelectorAll('[data-step-dot]')];
  const sidebarItems = [...document.querySelectorAll('[data-exp-sidebar]')];
  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');

  if (!root || !storySteps.length || !stageMain) return;

  let current = 0;
  let scrollLock = false;
  let extractAnimId = 0;
  let checkAnimTimers = [];

  function clearInlineStoryPreviews() {
    storySteps.forEach((story) => {
      const inline = story.querySelector('.exp-story-preview');
      if (!inline) return;
      inline.innerHTML = '';
      inline.setAttribute('aria-hidden', 'true');
    });
  }

  function clearMobileMount() {
    if (!mobilePreviewMount) return;
    mobilePreviewMount.innerHTML = '';
    mobilePreviewMount.hidden = true;
  }

  function getPreviewScreen(step) {
    if (isMobileLayout()) {
      return mobilePreviewMount?.querySelector('.exp-screen') ?? null;
    }
    return storySteps[step]?.querySelector('.exp-story-preview .exp-screen') ?? null;
  }

  function getStepScreen(step) {
    if (isMobileLayout()) {
      return getPreviewScreen(step) ?? screens[step] ?? null;
    }
    return screens[step] ?? null;
  }

  function getExtractSurfaces() {
    const surfaces = [screens[2], getPreviewScreen(2)].filter(Boolean);
    return [...new Set(surfaces)];
  }

  function getCheckSurfaces() {
    const surfaces = [screens[4], getPreviewScreen(4)].filter(Boolean);
    return [...new Set(surfaces)];
  }

  function queryExtractParts(screen) {
    if (!screen) return null;
    const pct = screen.querySelector('.exp-extract-status span:first-child');
    const bar = screen.querySelector('.exp-bar__fill');
    if (!pct || !bar) return null;
    return { screen, pct, bar };
  }

  function clearCheckTimers() {
    checkAnimTimers.forEach((id) => window.clearTimeout(id));
    checkAnimTimers = [];
  }

  function resetExtractAnim() {
    extractAnimId += 1;
    getExtractSurfaces().forEach((screen) => {
      screen.classList.remove('is-anim-extract');
      const parts = queryExtractParts(screen);
      if (!parts) return;
      parts.pct.textContent = '0%';
      parts.bar.style.width = '0%';
    });
  }

  function resetChecks() {
    clearCheckTimers();
    getCheckSurfaces().forEach((screen) => {
      screen.querySelectorAll('[data-exp-check]').forEach((el) => el.classList.remove('is-done'));
    });
  }

  function runExtractAnim() {
    const surfaces = getExtractSurfaces()
      .map(queryExtractParts)
      .filter(Boolean);
    if (!surfaces.length) return;

    resetExtractAnim();
    const token = extractAnimId;

    if (prefersReducedMotion()) {
      surfaces.forEach(({ screen, pct, bar }) => {
        pct.textContent = '100%';
        bar.style.width = '100%';
        screen.classList.add('is-anim-extract');
      });
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      if (token !== extractAnimId) return;
      const t = Math.min(1, (now - start) / duration);
      const pct = Math.round(t * 100);
      surfaces.forEach(({ screen, pct: pctEl, bar }) => {
        pctEl.textContent = `${pct}%`;
        bar.style.width = `${pct}%`;
        if (t >= 1) screen.classList.add('is-anim-extract');
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function runCheckAnim() {
    resetChecks();
    const checkLists = getCheckSurfaces().map((screen) => [
      ...screen.querySelectorAll('[data-exp-check]'),
    ]);
    const maxLen = Math.max(0, ...checkLists.map((list) => list.length));
    if (!maxLen) return;

    if (prefersReducedMotion()) {
      checkLists.forEach((list) => list.forEach((el) => el.classList.add('is-done')));
      return;
    }

    for (let i = 0; i < maxLen; i += 1) {
      const id = window.setTimeout(() => {
        checkLists.forEach((list) => {
          if (list[i]) list[i].classList.add('is-done');
        });
      }, 400 + i * 600);
      checkAnimTimers.push(id);
    }
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

  function buildPreviewShell(step, screen) {
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
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      main.appendChild(clone);
    }
    return shell;
  }

  function updateMobilePreview(step) {
    if (!isMobileLayout()) {
      clearMobileMount();
      return;
    }

    const screen = screens[step];
    if (!mobilePreviewMount || !screen) {
      clearMobileMount();
      return;
    }

    clearInlineStoryPreviews();
    mobilePreviewMount.innerHTML = '';
    mobilePreviewMount.appendChild(buildPreviewShell(step, screen));
    mobilePreviewMount.hidden = false;
  }

  function clearPreviewFileAnims() {
    screens.forEach((el) => el.classList.remove('is-anim-files'));
    storySteps.forEach((story) => {
      story.querySelectorAll('.exp-story-preview .exp-screen').forEach((el) => {
        el.classList.remove('is-anim-files');
      });
    });
    mobilePreviewMount?.querySelectorAll('.exp-screen').forEach((el) => {
      el.classList.remove('is-anim-files');
    });
  }

  function runStepAnimations(step) {
    const screen = getStepScreen(step);
    const stageScreen = screens[step];

    if (step !== 2) resetExtractAnim();
    if (step !== 4) resetChecks();

    if (step === 1) {
      runFileAnim(screen);
      if (stageScreen && stageScreen !== screen) runFileAnim(stageScreen);
    }
    if (step === 2) runExtractAnim();
    if (step === 4) runCheckAnim();

    if (step !== 1) clearPreviewFileAnims();
  }

  function setStep(index, { scrollToStory = false, refresh = false } = {}) {
    const next = Math.max(0, Math.min(STEP_COUNT - 1, index));
    if (next === current && !scrollToStory && !refresh) return;
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

    if (isMobileLayout()) {
      if (scrollToStory && mobilePreviewMount && !mobilePreviewMount.hidden) {
        mobilePreviewMount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else if (scrollToStory && storySteps[current]) {
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

  window.addEventListener('dppflash:langchange', () => setStep(current, { refresh: true }));
  MOBILE_LAYOUT_MQ?.addEventListener('change', () => {
    clearMobileMount();
    clearInlineStoryPreviews();
    setStep(current, { refresh: true });
  });

  setStep(0, { refresh: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperience);
} else {
  initExperience();
}
