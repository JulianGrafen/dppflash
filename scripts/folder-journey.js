function getScrollKit() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return null;
  return { gsap, ScrollTrigger };
}

/** GSAP defaultiert auf documentElement — bei height:100% scrollt oft body. */
function resolvePageScroller() {
  const html = document.documentElement;
  const body = document.body;
  if (!body) return html;
  if (body.scrollTop > 0 && html.scrollTop === 0) return body;
  const bodyY = getComputedStyle(body).overflowY;
  if (
    (bodyY === 'auto' || bodyY === 'scroll') &&
    body.scrollHeight > body.clientHeight + 1 &&
    html.scrollHeight <= html.clientHeight + 1
  ) {
    return body;
  }
  return document.scrollingElement || html;
}

let scrollDefaultsApplied = false;

function ensureScrollTriggerScroller(ScrollTrigger) {
  const scroller = resolvePageScroller();
  if (!scrollDefaultsApplied) {
    ScrollTrigger.defaults({ scroller });
    scrollDefaultsApplied = true;
  }
  return scroller;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function getFolderInstance() {
  const mount = document.querySelector('[data-folder-connect] [data-folder-float]');
  return mount?._folderFloatInstance ?? null;
}

function isJourneyStepsInView() {
  const vh = window.innerHeight;
  const steps = document.querySelectorAll('.step-item--ingest, .step-item--extract');
  return [...steps].some((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > vh * 0.06 && r.top < vh * 0.94;
  });
}

/** Schritt 1: Ordner öffnet sich beim Sichtbarwerden (bleibt offen bis Schritt 2 vorbei). */
function initFolderConnect(row, instance) {
  const step = row.closest('.step-item--ingest');
  const step2 = document.querySelector('.step-item--extract');
  if (!step || !instance) return null;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    instance.setOpen(true);
    return null;
  }

  let open = false;

  const syncOpen = () => {
    const visible = isJourneyStepsInView();
    if (visible && !open) {
      open = true;
      instance.setOpen(true);
    } else if (!visible && open) {
      open = false;
      instance.setOpen(false);
      instance.pillEls.forEach((btn) => {
        btn.style.opacity = '';
        btn.style.transform = '';
      });
    }
  };

  const io = new IntersectionObserver(() => syncOpen(), {
    threshold: [0, 0.12, 0.35],
    rootMargin: '0px 0px -4% 0px',
  });

  [step, step2].filter(Boolean).forEach((el) => io.observe(el));
  window.addEventListener('scroll', syncOpen, { passive: true });
  syncOpen();

  return () => {
    io.disconnect();
    window.removeEventListener('scroll', syncOpen);
    instance.setOpen(false);
  };
}

function getFlyPortal() {
  const how = document.getElementById('how');
  if (!how) return null;
  let portal = how.querySelector(':scope > .ingest-fly-portal-root');
  if (!portal) {
    portal = document.createElement('div');
    portal.className = 'ingest-fly-portal-root';
    portal.setAttribute('aria-hidden', 'true');
    how.prepend(portal);
  }
  return portal;
}

function buildIngestPills(seedRoot) {
  const seed = seedRoot.querySelector('[data-folder-ingest-seed]');
  const portal = getFlyPortal();
  if (!seed || !portal) return { layer: null, pills: [] };

  const labels = [...seed.querySelectorAll('[data-folder-float-item]')].map((el) =>
    el.textContent.trim(),
  );

  const existing = portal.querySelector('.ingest-pill-layer');
  if (existing) existing.remove();

  const layer = document.createElement('div');
  layer.className = 'ingest-fly-portal ingest-pill-layer';
  layer.setAttribute('aria-hidden', 'true');
  portal.appendChild(layer);

  const pills = labels.map((label) => {
    const btn = document.createElement('span');
    btn.className = 'ingest-pill';
    btn.textContent = label;
    btn.style.opacity = '0';
    layer.appendChild(btn);
    return btn;
  });

  return { layer, pills };
}

function pointInLayer(layer, clientX, clientY) {
  const lr = layer.getBoundingClientRect();
  return { x: clientX - lr.left, y: clientY - lr.top };
}

function liveFolderStart(layer, pillIndex) {
  const instance = getFolderInstance();
  const btn = instance?.pillEls?.[pillIndex];
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return pointInLayer(layer, r.left + r.width / 2, r.top + r.height / 2);
}

function setFolderJourneyMode(mode) {
  const root = getFolderInstance()?.root;
  if (!root) return;
  root.removeAttribute('data-journey-scrub');
  root.removeAttribute('data-journey-fly');
  root.removeAttribute('data-journey-done');
  if (mode === 'scrub' || mode === 'fly') root.setAttribute('data-journey-scrub', '');
  if (mode === 'fly') root.setAttribute('data-journey-fly', '');
  if (mode === 'done') root.setAttribute('data-journey-done', '');
}

function sourceStackPoint(layer, lane, sourcesEl, pillIndex) {
  const laneRect = lane.getBoundingClientRect();
  const sourceRect = sourcesEl.getBoundingClientRect();
  const folderMidY = laneRect.top + Math.min(108, laneRect.height * 0.38);
  const sourceMidX = sourceRect.left + sourceRect.width / 2;
  const sourceMidY = sourceRect.top + sourceRect.height / 2;
  const blend = Math.min(1, pillIndex / 5);
  const clientX = sourceMidX + (laneRect.left + laneRect.width / 2 - sourceMidX) * (1 - blend);
  const clientY = folderMidY + (sourceMidY - folderMidY) * blend - pillIndex * 11;
  const jitter = (pillIndex % 3 - 1) * 2;
  return pointInLayer(layer, clientX + jitter, clientY);
}

function targetCenterInLayer(layer, targetEl) {
  const tr = targetEl.getBoundingClientRect();
  return pointInLayer(layer, tr.left + tr.width / 2, tr.top + tr.height / 2);
}

function pillOpacityForPath(path) {
  if (path < 0.03) return 0;
  if (path < 0.92) return 1;
  return 1 - smoothstep((path - 0.92) / 0.08);
}

function setFolderPillsHidden(hidden) {
  const instance = getFolderInstance();
  instance?.pillEls?.forEach((btn) => {
    if (hidden) {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    }
  });
}

/** Schritt 2: Ordner-Pills fließen per Scroll in Ingest. */
function initIngestDataJourney(row) {
  const kit = getScrollKit();
  if (!kit) return null;
  const { gsap, ScrollTrigger } = kit;

  const lane = row.querySelector('.step-ingest-folder-lane');
  const sourcesEl = row.querySelector('[data-ingest-sources]');
  const target = row.querySelector('[data-folder-journey-target]');
  if (!lane || !sourcesEl || !target) return null;

  const portal = getFlyPortal();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { layer, pills } = buildIngestPills(row);
  if (!layer || !pills.length) return null;

  let scrollTrigger = null;
  let scrubActive = false;
  let flightStarts = null;
  const howSection = document.getElementById('how');

  const captureStarts = () => {
    flightStarts = pills.map((_, i) =>
      liveFolderStart(layer, i) ?? sourceStackPoint(layer, lane, sourcesEl, i),
    );
  };

  const startForPill = (i, progress) => {
    const live = liveFolderStart(layer, i);
    if (progress < 0.22 && live) return live;
    if (!flightStarts) captureStarts();
    return flightStarts[i] ?? sourceStackPoint(layer, lane, sourcesEl, i);
  };

  const reset = () => {
    scrubActive = false;
    flightStarts = null;
    howSection?.classList.remove('is-ingest-fly-active');
    setFolderJourneyMode('idle');
    setFolderPillsHidden(false);
    target.classList.remove('is-ingest-active');
    pills.forEach((btn) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translate(-50%, -50%) scale(0.92)';
    });
  };

  const applyFlight = (t) => {
    getFolderInstance()?.setOpen(true);
    const end = targetCenterInLayer(layer, target);
    setFolderPillsHidden(t > 0.03);
    setFolderJourneyMode(t > 0.06 ? 'fly' : 'scrub');
    if (t > 0.02 && !flightStarts) captureStarts();

    pills.forEach((btn, i) => {
      const stagger = i * 0.055;
      const path = smoothstep((t - stagger) / (1 - stagger * 0.75));
      const start =
        (t < 0.12 ? liveFolderStart(layer, i) : null) ??
        flightStarts?.[i] ??
        sourceStackPoint(layer, lane, sourcesEl, i);
      const move = smoothstep(Math.min(1, path * 1.04));
      const x = start.x + (end.x - start.x) * move;
      const y = start.y + (end.y - start.y) * move;
      const scale = 1 - path * 0.26;
      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
      btn.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      btn.style.opacity = String(pillOpacityForPath(path));
    });

    if (t > 0.48) target.classList.add('is-ingest-active');
    else target.classList.remove('is-ingest-active');
  };

  const applyProgress = (progress) => {
    const p = clamp(progress, 0, 1);
    if (p < 0.005) {
      reset();
      return;
    }

    howSection?.classList.add('is-ingest-fly-active');
    getFolderInstance()?.setOpen(true);

    if (p < 0.08) {
      captureStarts();
      const showT = smoothstep(p / 0.08);
      setFolderJourneyMode('scrub');
      setFolderPillsHidden(showT > 0.15);
      pills.forEach((btn, i) => {
        const { x, y } = startForPill(i, p);
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.opacity = String(showT * 0.98);
        btn.style.transform = `translate(-50%, -50%) scale(${0.92 + showT * 0.08})`;
      });
      target.classList.remove('is-ingest-active');
      return;
    }

    if (p < 0.96) {
      if (!flightStarts) captureStarts();
      applyFlight(smoothstep((p - 0.08) / 0.88));
      return;
    }

    setFolderJourneyMode('done');
    setFolderPillsHidden(false);
    target.classList.add('is-ingest-active');
    pills.forEach((btn) => {
      btn.style.opacity = '0';
    });
  };

  reset();

  if (reduce) {
    target.classList.add('is-ingest-active');
    return () => layer?.remove();
  }

  const step1 = document.querySelector('.step-item--ingest');
  const folderLane = document.querySelector('[data-folder-connect] .step-ingest-folder-lane');

  const scroller = ensureScrollTriggerScroller(ScrollTrigger);

  scrollTrigger = ScrollTrigger.create({
    id: 'dpp-ingest-journey',
    scroller,
    trigger: folderLane || step1 || row,
    start: 'top 82%',
    endTrigger: target,
    end: 'center 52%',
    scrub: 0.42,
    invalidateOnRefresh: true,
    onToggle: (self) => {
      scrubActive = self.isActive;
      row.classList.toggle('is-ingest-pin-active', self.isActive);
      if (self.isActive) getFolderInstance()?.setOpen(true);
      window.dispatchEvent(new Event('dppflash:steps-spine'));
    },
    onUpdate: (self) => applyProgress(self.progress),
    onLeaveBack: () => reset(),
    onRefresh: () => applyProgress(scrollTrigger.progress),
  });

  const onTick = () => {
    if (!scrubActive || !scrollTrigger) return;
    applyProgress(scrollTrigger.progress);
  };
  gsap.ticker.add(onTick);

  applyProgress(scrollTrigger.progress);
  requestAnimationFrame(() => ScrollTrigger.refresh(true));

  const onLayout = () => {
    ScrollTrigger.refresh(true);
    if (scrollTrigger) applyProgress(scrollTrigger.progress);
    window.dispatchEvent(new Event('dppflash:steps-spine'));
  };

  const onLoad = () => onLayout();
  window.addEventListener('load', onLoad, { once: true });
  window.addEventListener('resize', onLayout);

  return () => {
    gsap.ticker.remove(onTick);
    window.removeEventListener('load', onLoad);
    window.removeEventListener('resize', onLayout);
    row.classList.remove('is-ingest-pin-active');
    scrollTrigger?.kill();
    reset();
    howSection?.classList.remove('is-ingest-fly-active');
    layer?.remove();
  };
}

async function setupConnect(row) {
  const mount = row.querySelector('[data-folder-float]');
  const instance = mount?._folderFloatInstance;
  if (!instance) return false;

  await (document.fonts?.ready ?? Promise.resolve());
  instance.syncContent();
  instance.measure();
  await new Promise((r) => requestAnimationFrame(r));

  const cleanup = initFolderConnect(row, instance);
  if (cleanup) row._folderConnectCleanup = cleanup;
  return true;
}

function setupIngest(row) {
  if (row._ingestJourneyCleanup) return true;
  if (row.dataset.folderJourneyInit === '1') return true;
  if (!getScrollKit()) return false;
  const cleanup = initIngestDataJourney(row);
  if (!cleanup) return false;
  row._ingestJourneyCleanup = cleanup;
  requestAnimationFrame(() => getScrollKit()?.ScrollTrigger.refresh(true));
  return true;
}

function teardownConnect(row) {
  row._folderConnectCleanup?.();
  row._folderConnectCleanup = null;
  delete row.dataset.folderConnectInit;
}

function teardownIngest(row) {
  row._ingestJourneyCleanup?.();
  row._ingestJourneyCleanup = null;
  delete row.dataset.folderJourneyInit;
}

function bootConnect(row) {
  if (row.dataset.folderConnectInit === '1') return;
  setupConnect(row).then((ok) => {
    if (!ok) return;
    row.dataset.folderConnectInit = '1';
  });
}

function bootIngest(row) {
  if (row.dataset.folderJourneyInit === '1') return;
  if (!getFolderInstance() || !getScrollKit()) return;
  if (!setupIngest(row)) return;
  row.dataset.folderJourneyInit = '1';
}

function onFolderReady(e) {
  const row = e.target.closest('[data-folder-connect]');
  if (row) bootConnect(row);
  document.querySelectorAll('[data-folder-journey="ingest"]').forEach(bootIngest);
  requestAnimationFrame(() => getScrollKit()?.ScrollTrigger.refresh(true));
}

document.addEventListener('dpp:folder-float-ready', onFolderReady);

function attachAll() {
  const kit = getScrollKit();
  if (!kit) {
    requestAnimationFrame(attachAll);
    return;
  }
  ensureScrollTriggerScroller(kit.ScrollTrigger);
  document.querySelectorAll('[data-folder-connect]').forEach((row) => {
    const mount = row.querySelector('[data-folder-float]');
    if (mount?._folderFloatInstance) bootConnect(row);
  });
  document.querySelectorAll('[data-folder-journey="ingest"]').forEach(bootIngest);
}

window.addEventListener('dppflash:langchange', () => {
  document.querySelectorAll('[data-folder-connect]').forEach((row) => {
    teardownConnect(row);
    bootConnect(row);
  });
  document.querySelectorAll('[data-folder-journey="ingest"]').forEach((row) => {
    teardownIngest(row);
    bootIngest(row);
  });
});

function refreshAfterLoad() {
  const ST = getScrollKit()?.ScrollTrigger;
  ST?.refresh(true);
  document.querySelectorAll('[data-folder-journey="ingest"]').forEach((row) => {
    if (row.dataset.folderJourneyInit !== '1') bootIngest(row);
  });
}

if (document.readyState === 'complete') {
  refreshAfterLoad();
} else {
  window.addEventListener('load', refreshAfterLoad, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachAll);
} else {
  attachAll();
}
