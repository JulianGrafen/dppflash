const URLS = [
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new',
  'app.dppflash.de/passports/new/extract',
  'app.dppflash.de/passports/voltstride-720',
  'app.dppflash.de/passports/voltstride-720/publish',
  'dppflash.de/p/voltstride-720',
];

const SIDEBAR_ACTIVE = ['new', 'new', 'new', 'passports', 'passports', 'registry'];
const STEP_COUNT = 6;
const USER_NAV_GUARD_MS = 2800;
const SCROLL_SETTLE_MAX_MS = 2800;
const MOBILE_LAYOUT_MQ = window.matchMedia?.('(max-width: 999px)');

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

function isMobileLayout() {
  return MOBILE_LAYOUT_MQ?.matches ?? false;
}

function scrollStoryIntoView(storyEl, block = 'center', { instant = false } = {}) {
  if (!storyEl) return;
  const behavior = instant || prefersReducedMotion() ? 'auto' : 'smooth';
  const lenis = window.DppLenis;
  if (lenis && !instant) {
    const offset = window.innerHeight * (block === 'start' ? 0.12 : 0.35);
    const y = lenis.scroll + storyEl.getBoundingClientRect().top - offset;
    lenis.scrollTo(Math.max(0, y), { duration: 0.85 });
    return;
  }
  storyEl.scrollIntoView({ behavior, block });
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
  let userNavUntil = 0;
  let scrollReleaseTimer = 0;
  let scrollSyncRaf = 0;
  let extractAnimId = 0;
  let checkAnimTimers = [];

  function storyScrollAnchorY() {
    if (isMobileLayout()) return window.innerHeight * 0.18;
    return window.innerHeight * 0.5;
  }

  function beginScrollSettlement(targetIdx) {
    if (scrollReleaseTimer) {
      window.clearTimeout(scrollReleaseTimer);
      scrollReleaseTimer = 0;
    }
    scrollLock = true;
    const target = storySteps[targetIdx];
    if (!target || prefersReducedMotion()) {
      scrollLock = false;
      return;
    }

    const started = performance.now();
    const settle = () => {
      const rect = target.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const aligned = Math.abs(center - storyScrollAnchorY()) < window.innerHeight * 0.22;
      if (aligned || performance.now() - started > SCROLL_SETTLE_MAX_MS) {
        scrollLock = false;
        return;
      }
      requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
    scrollReleaseTimer = window.setTimeout(() => {
      scrollLock = false;
      scrollReleaseTimer = 0;
    }, SCROLL_SETTLE_MAX_MS);
  }

  function syncStepFromStoryScroll() {
    if (isMobileLayout() || scrollLock || performance.now() < userNavUntil) return;
    const anchorY = storyScrollAnchorY();
    let best = -1;
    let bestDist = Infinity;
    storySteps.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - anchorY);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best >= 0 && best !== current) setStep(best);
  }

  function onStoryScroll() {
    if (scrollSyncRaf) return;
    scrollSyncRaf = requestAnimationFrame(() => {
      scrollSyncRaf = 0;
      syncStepFromStoryScroll();
    });
  }

  let storyScrollSyncBound = false;
  function bindStoryScrollSync(enable) {
    if (storyScrollSyncBound === enable) return;
    storyScrollSyncBound = enable;
    if (enable) {
      window.addEventListener('scroll', onStoryScroll, { passive: true });
    } else {
      window.removeEventListener('scroll', onStoryScroll);
      if (scrollSyncRaf) cancelAnimationFrame(scrollSyncRaf);
      scrollSyncRaf = 0;
    }
  }

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

  function setStep(index, { scrollToStory = false, refresh = false, fromUser = false } = {}) {
    const next = Math.max(0, Math.min(STEP_COUNT - 1, index));
    if (next === current && !scrollToStory && !refresh) return;

    if (fromUser) userNavUntil = performance.now() + USER_NAV_GUARD_MS;

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
      const block = isMobileLayout() ? 'start' : 'center';
      if (fromUser) {
        scrollStoryIntoView(storySteps[current], block, { instant: true });
        scrollLock = false;
      } else {
        scrollStoryIntoView(storySteps[current], block);
        beginScrollSettlement(current);
      }
    }
  }

  prevBtn?.addEventListener('click', () =>
    setStep(current - 1, { scrollToStory: true, fromUser: true }),
  );
  nextBtn?.addEventListener('click', () =>
    setStep(current + 1, { scrollToStory: true, fromUser: true }),
  );
  dots.forEach((dot, i) => {
    const go = () => setStep(i, { scrollToStory: true, fromUser: true });
    const hit = dot.querySelector('.exp-progress__btn') ?? dot;
    hit.addEventListener('click', go);
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  bindStoryScrollSync(!isMobileLayout());

  window.addEventListener('dppflash:langchange', () => setStep(current, { refresh: true }));
  MOBILE_LAYOUT_MQ?.addEventListener('change', () => {
    clearMobileMount();
    clearInlineStoryPreviews();
    bindStoryScrollSync(!isMobileLayout());
    setStep(current, { refresh: true });
  });

  setStep(0, { refresh: true });
  window.DppExperienceDemo = { getStep: () => current, version: 3 };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperience);
} else {
  initExperience();
}
