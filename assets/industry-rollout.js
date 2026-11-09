(function () {
  const root = document.querySelector('[data-industry-rollout]');
  if (!root) return;

  const viewport = root.querySelector('.industry-rollout__viewport');
  const track = root.querySelector('.industry-rollout__track');
  const prev = root.querySelector('[data-industry-prev]');
  const next = root.querySelector('[data-industry-next]');
  const fill = root.querySelector('[data-industry-progress-fill]');
  if (!viewport || !track) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTO_PX_PER_FRAME = 0.42;
  const USER_PAUSE_MS = 4500;

  let pausedHover = false;
  let pausedUserUntil = 0;
  let pausedOffscreen = true;
  let rafId = null;

  function stepPx() {
    const card = track.querySelector('.industry-rollout__card');
    if (!card) return viewport.clientWidth * 0.75;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function scrollByDir(dir) {
    pauseForUser();
    viewport.scrollBy({ left: dir * stepPx(), behavior: 'smooth' });
  }

  function pauseForUser(ms = USER_PAUSE_MS) {
    pausedUserUntil = Date.now() + ms;
  }

  function updateProgress() {
    if (!fill) return;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const ratio = max > 0 ? viewport.scrollLeft / max : 0;
    const min = 0.08;
    const width = min + ratio * (1 - min);
    fill.style.transform = `scaleX(${width})`;
  }

  function canAutoScroll() {
    if (reducedMotion.matches || document.hidden) return false;
    if (pausedHover || pausedOffscreen) return false;
    if (Date.now() < pausedUserUntil) return false;
    return viewport.scrollWidth > viewport.clientWidth + 2;
  }

  function autoTick() {
    if (canAutoScroll()) {
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (viewport.scrollLeft >= max - 0.5) {
        viewport.scrollLeft = 0;
      } else {
        viewport.scrollLeft += AUTO_PX_PER_FRAME;
      }
      updateProgress();
    }
    rafId = requestAnimationFrame(autoTick);
  }

  prev?.addEventListener('click', () => scrollByDir(-1));
  next?.addEventListener('click', () => scrollByDir(1));

  viewport.addEventListener(
    'scroll',
    () => {
      updateProgress();
    },
    { passive: true },
  );

  viewport.addEventListener('pointerenter', () => {
    pausedHover = true;
  });
  viewport.addEventListener('pointerleave', () => {
    pausedHover = false;
  });
  viewport.addEventListener(
    'wheel',
    () => {
      pauseForUser();
    },
    { passive: true },
  );
  viewport.addEventListener('touchstart', () => pauseForUser(), { passive: true });

  reducedMotion.addEventListener?.('change', updateProgress);
  window.addEventListener('resize', updateProgress, { passive: true });
  document.addEventListener('visibilitychange', updateProgress);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        pausedOffscreen = !entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.12);
      },
      { threshold: [0, 0.12, 0.35] },
    );
    io.observe(root);
  } else {
    pausedOffscreen = false;
  }

  updateProgress();
  rafId = requestAnimationFrame(autoTick);
})();
