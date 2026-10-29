/** VoltStride demo pass — ProfileCard (react-bits) for static homepage hero. */

const THEMES = {
  dark: {
    '--pc-frame': 'rgba(38, 35, 46, 0.66)',
    '--pc-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--pc-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--pc-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--pc-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--pc-ink': '#f4f4f5',
    '--pc-muted': 'rgba(244, 244, 245, 0.6)',
    '--pc-hover': 'brightness(1.12)',
    '--pc-press': 'brightness(0.8)',
    '--pc-shade': 'rgba(0, 0, 0, 0.4)',
  },
};

const FOILS = {
  dark: {
    '--pc-blend': 'color-dodge',
    '--pc-holo-filter': 'hue-rotate(0deg)',
    '--pc-sheen': 'rgba(255, 255, 255, 0.16)',
  },
};

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>",
)}")`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Fallback clip height if pass DOM is not ready. */
const PASS_IFRAME_HEIGHT_FALLBACK = 2000;

const PASS_PREVIEW_STOP_SECTION_ID = 'pass-section-technical';
const PASS_PREVIEW_CLIP_STYLE_ID = 'hero-pass-preview-clip';

function preparePassPreviewDocument(doc) {
  if (!doc.getElementById(PASS_PREVIEW_CLIP_STYLE_ID)) {
    const style = doc.createElement('style');
    style.id = PASS_PREVIEW_CLIP_STYLE_ID;
    style.textContent = `
      footer { display: none !important; }
      .dpp-pass .min-h-dvh { min-height: 0 !important; height: auto !important; }
      section[aria-labelledby="${PASS_PREVIEW_STOP_SECTION_ID}"] .pass-details-panel {
        display: none !important;
      }
      section[aria-labelledby="${PASS_PREVIEW_STOP_SECTION_ID}"] ~ * {
        display: none !important;
      }
    `;
    doc.head.appendChild(style);
  }

  doc.documentElement.style.overflow = 'hidden';
  doc.body.style.overflow = 'hidden';
  doc.body.style.minHeight = '0';

  const techSection = doc.getElementById(PASS_PREVIEW_STOP_SECTION_ID)?.closest('section');
  const details = techSection?.querySelector(':scope > details');
  if (details) details.open = false;
}

function lockPassPreviewDocumentHeight(doc, height) {
  const px = `${Math.ceil(height)}px`;
  doc.documentElement.style.height = px;
  doc.body.style.height = px;
  doc.body.style.minHeight = '0';
  doc.body.style.paddingBottom = '0';
  const pass = doc.querySelector('.dpp-pass');
  if (pass) {
    pass.style.minHeight = '0';
    pass.style.height = px;
    pass.style.overflow = 'hidden';
  }
  const shell = doc.querySelector('.dpp-pass .min-h-dvh.bg-white');
  if (shell) {
    shell.style.minHeight = '0';
    shell.style.height = px;
    shell.style.paddingBottom = '0';
    shell.style.overflow = 'hidden';
  }
}

function measurePassPreviewHeight(doc) {
  preparePassPreviewDocument(doc);

  const techHeading = doc.getElementById(PASS_PREVIEW_STOP_SECTION_ID);
  const techSection = techHeading?.closest('section');
  if (!techSection) return PASS_IFRAME_HEIGHT_FALLBACK;

  const summary = techSection.querySelector('summary');
  if (summary) void summary.offsetHeight;

  const rootTop = doc.documentElement.getBoundingClientRect().top + doc.documentElement.scrollTop;
  const cut =
    (summary || techSection).getBoundingClientRect().bottom + doc.documentElement.scrollTop - rootTop + 1;

  const height = Math.max(720, Math.ceil(cut));
  lockPassPreviewDocumentHeight(doc, height);
  return height;
}

function applyPassPreviewClip(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return;
    iframe.style.height = `${measurePassPreviewHeight(doc)}px`;
    if (iframe.parentElement) iframe.parentElement.scrollTop = 0;
  } catch {
    iframe.style.height = `${PASS_IFRAME_HEIGHT_FALLBACK}px`;
  }
}

function syncPassIframeHeight(iframe) {
  const apply = () => applyPassPreviewClip(iframe);

  iframe.addEventListener('load', () => {
    apply();
    window.setTimeout(apply, 400);
    window.setTimeout(apply, 1200);
    window.setTimeout(apply, 2600);
  });
  iframe.style.height = `${PASS_IFRAME_HEIGHT_FALLBACK}px`;
}

const IFRAME_TITLES = {
  de: 'VoltStride 720 — Digitaler Batteriepass (Demo)',
  en: 'VoltStride 720 — EU battery passport (demo)',
};

function getLang() {
  return window.DppI18n?.getLang?.() === 'en' ? 'en' : 'de';
}

function attachTiltEngine(root, settings) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = { width: root.offsetWidth, height: root.offsetHeight };
  const x = { p: 0, v: 0, target: 0 };
  const y = { p: 0, v: 0, target: 0 };
  const light = { p: 0, target: 0 };
  let raf = 0;
  let last = 0;
  let slowUntil = 0;
  let touchId = null;

  const write = () => {
    const tiltOn = settings.enableTilt && !reduced;
    const angle = tiltOn ? settings.tiltStrength : 0;
    const tilt = Math.min(1, Math.hypot(x.p, y.p));
    const style = root.style;
    style.setProperty('--pc-light-x', `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
    style.setProperty('--pc-light-y', `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
    style.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
    style.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
    style.setProperty('--pc-band-x', `${(50 + x.p * 15).toFixed(2)}%`);
    style.setProperty('--pc-band-y', `${(50 + y.p * 15).toFixed(2)}%`);
    style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
    style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
    style.setProperty('--pc-shift-x', `${(x.p * (reduced ? 0 : settings.parallax)).toFixed(2)}px`);
    style.setProperty('--pc-shift-y', `${(y.p * (reduced ? 0 : settings.parallax)).toFixed(2)}px`);
    style.setProperty('--pc-reach', tilt.toFixed(4));
    style.setProperty('--pc-tilt', (tilt * light.p).toFixed(4));
    style.setProperty('--pc-active', light.p.toFixed(4));
  };

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    const slow = now < slowUntil;
    const stiffness = slow ? 24 : 120;
    const damping = slow ? 9 : 16;
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (const axis of [x, y]) {
        axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
        axis.p += axis.v * h;
      }
    }
    const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
    light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
    write();
    const moving =
      Math.abs(x.target - x.p) > 0.0005 ||
      Math.abs(y.target - y.p) > 0.0005 ||
      Math.abs(x.v) > 0.0005 ||
      Math.abs(y.v) > 0.0005 ||
      Math.abs(light.target - light.p) > 0.002;
    if (moving) raf = requestAnimationFrame(frame);
    else {
      x.p = x.target;
      y.p = y.target;
      light.p = light.target;
      write();
      raf = 0;
    }
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const aim = (nx, ny, on = true) => {
    x.target = clamp(nx, -1, 1);
    y.target = clamp(ny, -1, 1);
    light.target = on ? 1 : 0;
    slowUntil = 0;
    wake();
  };

  const aimAt = (event) => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const release = () => aim(0, 0, false);

  const onEnter = (event) => {
    if (event.pointerType === 'mouse') aimAt(event);
  };
  const onMove = (event) => {
    if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
  };
  const onLeave = (event) => {
    if (event.pointerType === 'mouse') release();
  };
  const onDown = (event) => {
    if (event.pointerType === 'mouse') return;
    touchId = event.pointerId;
    aimAt(event);
  };
  const onUp = (event) => {
    if (event.pointerId !== touchId) return;
    touchId = null;
    release();
  };

  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);

  const observer = new ResizeObserver(() => {
    size.width = root.offsetWidth;
    size.height = root.offsetHeight;
    write();
  });
  observer.observe(root);

  if (settings.intro && !reduced) {
    x.p = 0.62;
    y.p = -0.55;
    light.p = 1;
    slowUntil = performance.now() + 1400;
    write();
    wake();
  } else write();

  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onUp);
  };
}

function applyThemeVars(root) {
  Object.entries({ ...THEMES.dark, ...FOILS.dark }).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.style.setProperty('--pc-radius', '16px');
  root.style.setProperty(
    '--pc-backdrop',
    'linear-gradient(180deg, color-mix(in srgb, #1a2b4a, #ffffff 8%) 0%, color-mix(in srgb, #0f172a, #000000 12%) 100%)',
  );
  root.style.setProperty('--pc-holo', '0');
  root.style.setProperty('--pc-glare', '0');
  root.style.setProperty('--pc-parallax', '8px');
  root.style.setProperty('--pc-status', '#22c55e');
  root.style.setProperty('--pc-grain', GRAIN);
  root.style.setProperty('--pc-pattern', 'linear-gradient(#000, #000)');
  root.style.setProperty('--pc-pattern-size', '100% 100%');
  root.style.setProperty('--pc-holo-gain', '0.75');
  root.style.setProperty('--pc-holo-detail', '0');
}

function syncPassIframeHeight(iframe) {
  const apply = () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const height = Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        PASS_IFRAME_HEIGHT_FALLBACK,
      );
      iframe.style.height = `${height}px`;
    } catch {
      iframe.style.height = `${PASS_IFRAME_HEIGHT_FALLBACK}px`;
    }
  };

  iframe.addEventListener('load', () => {
    apply();
    window.setTimeout(apply, 400);
    window.setTimeout(apply, 1200);
  });
  iframe.style.height = `${PASS_IFRAME_HEIGHT_FALLBACK}px`;
}

function trapScrollInPreview(root, scrollEl) {
  root.addEventListener(
    'wheel',
    (event) => {
      const max = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (max <= 0) return;
      const atTop = scrollEl.scrollTop <= 0;
      const atBottom = scrollEl.scrollTop >= max - 1;
      if (event.deltaY < 0 && atTop) return;
      if (event.deltaY > 0 && atBottom) return;
      scrollEl.scrollTop = clamp(scrollEl.scrollTop + event.deltaY, 0, max);
      event.preventDefault();
      event.stopPropagation();
    },
    { passive: false, capture: true },
  );
}

function renderCard(mount) {
  const passUrl = mount.dataset.passUrl || '/p/voltstride-720/';
  const lang = getLang();

  mount.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'profile-card hero-pass-profile-card';
  applyThemeVars(root);

  root.innerHTML = `
    <div class="profile-card__body">
      <div class="profile-card__tile profile-card__tile--pass-preview">
        <div class="hero-pass-mobile-scroll">
          <iframe
            class="hero-pass-mobile-iframe"
            src="${passUrl}"
            title=""
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </div>
      </div>
    </div>`;

  mount.appendChild(root);

  const iframe = root.querySelector('.hero-pass-mobile-iframe');
  const scrollEl = root.querySelector('.hero-pass-mobile-scroll');
  iframe.title = IFRAME_TITLES[lang];
  syncPassIframeHeight(iframe);
  trapScrollInPreview(root, scrollEl);

  const cleanup = attachTiltEngine(root, {
    enableTilt: true,
    tiltStrength: 10,
    parallax: 0,
    intro: false,
  });

  return { root, cleanup };
}

let active = null;

function initHeroProfileCard() {
  const mount = document.getElementById('heroPassProfileCard');
  if (!mount) return;
  active?.cleanup?.();
  active = renderCard(mount);
}

function boot() {
  initHeroProfileCard();
  window.addEventListener('dppflash:langchange', initHeroProfileCard);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
