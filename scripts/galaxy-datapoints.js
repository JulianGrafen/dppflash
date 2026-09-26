const ORB_STRIDE = 4;
const MAX_DATAPOINTS = 80;
const SI_MIN = -14;
const SI_MAX = 14;
const SI_STEP = 2;

const LABEL_KEYS = [
  'story.datapoint.gtin',
  'story.datapoint.origin',
  'story.datapoint.co2',
  'story.datapoint.supplier',
  'story.datapoint.recycled',
  'story.datapoint.reach',
  'story.datapoint.transport',
  'story.datapoint.battery',
  'story.datapoint.lca',
  'story.datapoint.material',
  'story.datapoint.weee',
  'story.datapoint.certificate',
  'story.datapoint.gs1',
  'story.datapoint.espr',
  'story.datapoint.jsonld',
  'story.datapoint.sku',
  'story.datapoint.weight',
  'story.datapoint.repair',
  'story.datapoint.carbon',
  'story.datapoint.durability',
  'story.datapoint.packaging',
  'story.datapoint.hosting',
  'story.datapoint.ean',
  'story.datapoint.batch',
  'story.datapoint.serial',
  'story.datapoint.manufacturer',
  'story.datapoint.brand',
  'story.datapoint.category',
  'story.datapoint.hscode',
  'story.datapoint.ce',
  'story.datapoint.rohs',
  'story.datapoint.pfas',
  'story.datapoint.scip',
  'story.datapoint.cas',
  'story.datapoint.epd',
  'story.datapoint.dppuri',
  'story.datapoint.qruuid',
  'story.datapoint.version',
  'story.datapoint.validuntil',
  'story.datapoint.conformity',
  'story.datapoint.tier3',
  'story.datapoint.water',
  'story.datapoint.energy',
  'story.datapoint.circularity',
];

const FALLBACK_DE = [
  'GTIN',
  'Herkunftsland',
  'CO₂-Bilanz',
  'Lieferant T2',
  'Recyclat %',
  'REACH',
  'Transportweg',
  'Batterie-ID',
  'LCA-Daten',
  'Materialmix',
  'WEEE-Klasse',
  'ISO 14001',
  'GS1',
  'ESPR-Status',
  'JSON-LD',
  'Artikel-Nr.',
  'Gewicht',
  'Reparierbarkeit',
  'CO₂e Scope 3',
  'Haltbarkeit',
  'Verpackung',
  '15J Archiv',
  'EAN',
  'Charge / Lot',
  'Serien-Nr.',
  'Hersteller',
  'Marke',
  'Kategorie',
  'HS-Code',
  'CE-Kennung',
  'RoHS',
  'PFAS',
  'SCIP',
  'CAS-Nr.',
  'EPD',
  'DPP-URI',
  'QR-UUID',
  'Version',
  'Gültig bis',
  'Konformität',
  'Lieferant T3',
  'Wasserfußabdruck',
  'Energieverbrauch',
  'Zirkularität',
];

const FALLBACK_EN = [
  'GTIN',
  'Country of origin',
  'CO₂ footprint',
  'Tier-2 supplier',
  'Recycled %',
  'REACH',
  'Transport route',
  'Battery ID',
  'LCA data',
  'Material mix',
  'WEEE class',
  'ISO 14001',
  'GS1',
  'ESPR status',
  'JSON-LD',
  'SKU',
  'Weight',
  'Repairability',
  'CO₂e scope 3',
  'Durability',
  'Packaging',
  '15y archive',
  'EAN',
  'Batch / lot',
  'Serial no.',
  'Manufacturer',
  'Brand',
  'Category',
  'HS code',
  'CE mark',
  'RoHS',
  'PFAS',
  'SCIP',
  'CAS no.',
  'EPD',
  'DPP URI',
  'QR UUID',
  'Version',
  'Valid until',
  'Conformity',
  'Tier-3 supplier',
  'Water footprint',
  'Energy use',
  'Circularity',
];

const NUM_LAYERS = 4;
const STAR_COLOR_CUTOFF = 0.2;

function fract(x) {
  return x - Math.floor(x);
}

function hash21(sx, sy) {
  let x = fract(sx * 123.34);
  let y = fract(sy * 456.21);
  const d = x * (x + 45.32) + y * (y + 45.32);
  x += d;
  y += d;
  return fract(x * y);
}

/** Same size metric as galaxy fragment shader StarLayer. */
function starSize(siX, siY) {
  const seed = hash21(siX, siY);
  return fract(seed * 345.32);
}

function tris(x) {
  const t = fract(x);
  const a = Math.abs(2 * t - 1);
  const s = Math.max(0, Math.min(1, a));
  return 1 - s * s * (3 - 2 * s);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Every ORB_STRIDE-th star cell per layer becomes a label anchor. */
function buildOrbAnchors() {
  const anchors = [];
  let starOrdinal = 0;

  for (let layer = 0; layer < NUM_LAYERS; layer++) {
    for (let siX = SI_MIN; siX <= SI_MAX; siX += SI_STEP) {
      for (let siY = SI_MIN; siY <= SI_MAX; siY += SI_STEP) {
        if (starSize(siX, siY) < 0.06) continue;

        const isDatapoint = starOrdinal % ORB_STRIDE === 0;
        starOrdinal += 1;
        if (!isDatapoint) continue;

        anchors.push({ si: [siX, siY], layer });
      }
    }
  }

  return anchors;
}

function filterAnchorsInView(anchors, motion, root, tick) {
  const w = Math.max(1, root.clientWidth);
  const h = Math.max(1, root.clientHeight);
  const inView = [];

  for (const anchor of anchors) {
    const p = orbToPercent(anchor, tick, motion, w, h);
    if (p.x < 0.025 || p.x > 0.975 || p.y < 0.04 || p.y > 0.96) continue;
    if (p.x > 0.32 && p.x < 0.68 && p.y > 0.34 && p.y < 0.58) continue;
    inView.push(anchor);
    if (inView.length >= MAX_DATAPOINTS) break;
  }

  return inView.length ? inView : anchors.slice(0, MAX_DATAPOINTS);
}

/** Match Galaxy fragment StarLayer base color per cell. */
function starRgbFromAnchor(anchor) {
  const siX = anchor.si[0];
  const siY = anchor.si[1];
  const seed = hash21(siX, siY);
  const red = smoothstep(STAR_COLOR_CUTOFF, 1, hash21(siX + 1, siY)) + STAR_COLOR_CUTOFF;
  const blu = smoothstep(STAR_COLOR_CUTOFF, 1, hash21(siX + 3, siY)) + STAR_COLOR_CUTOFF;
  const grn = Math.min(red, blu) * seed;
  return {
    r: Math.round(clamp(red, 0, 1) * 255),
    g: Math.round(clamp(grn, 0, 1) * 255),
    b: Math.round(clamp(blu, 0, 1) * 255),
  };
}

function labelText(index) {
  const key = LABEL_KEYS[index % LABEL_KEYS.length];
  const t = window.DppI18n?.t?.(key);
  if (t && t !== key) return t;
  const en = window.DppI18n?.getLang?.() === 'en';
  const fallbacks = en ? FALLBACK_EN : FALLBACK_DE;
  return fallbacks[index % fallbacks.length];
}

function readMotionOpts(galaxyEl) {
  const n = (key, fallback) => {
    const v = galaxyEl?.dataset?.[key];
    if (v === undefined || v === '') return fallback;
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  };
  return {
    speed: n('speed', 0.42),
    starSpeed: n('starSpeed', 0.26),
    rotationSpeed: n('rotationSpeed', 0.035),
    density: n('density', 1.5),
  };
}

/** Inverse of Galaxy fragment shader (StarLayer cell center + pad). */
function orbToPercent(anchor, tick, motion, w, h) {
  const time = tick.time;
  const uStarSpeed = tick.starSpeed;
  const layerI = anchor.layer / NUM_LAYERS;
  const depth = fract(layerI + uStarSpeed * motion.speed);
  const scale = mix(26 * motion.density, 0.28 * motion.density, depth);
  const layerOffset = layerI * 453.32;

  const siX = anchor.si[0];
  const siY = anchor.si[1];
  const seed = hash21(siX, siY);
  const padX = tris(seed * 34 + time * motion.speed / 10) - 0.5;
  const padY = tris(seed * 38 + time * motion.speed / 30) - 0.5;
  const layerUvX = siX + 0.5 + padX;
  const layerUvY = siY + 0.5 + padY;

  const wx = (layerUvX - layerOffset) / scale;
  const wy = (layerUvY - layerOffset) / scale;

  const rot = time * motion.rotationSpeed;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const uv1x = c * wx + s * wy;
  const uv1y = -s * wx + c * wy;

  const mouseNormX = (tick.mouseX ?? 0.5) - 0.5;
  const mouseNormY = (tick.mouseY ?? 0.5) - 0.5;
  const active = tick.mouseActive ?? 0;
  const parallax = tick.mouseParallax ?? 0.14;
  const uv0x = uv1x - mouseNormX * parallax * active;
  const uv0y = uv1y - mouseNormY * parallax * active;

  const focalPxX = w * 0.5;
  const focalPxY = h * 0.5;
  const pxX = uv0x * h + focalPxX;
  const pxY = uv0y * h + focalPxY;

  let x = pxX / w;
  let y = 1 - pxY / h;

  if (x > 0.34 && x < 0.66 && y > 0.36 && y < 0.56) {
    const push = x < 0.5 ? -0.14 : 0.14;
    x += push;
    if (y > 0.44 && y < 0.52) y += y < 0.48 ? -0.08 : 0.08;
  }

  if (anchor.xBias) x += anchor.xBias;
  if (anchor.yBias) y += anchor.yBias;

  return {
    x: clamp(x, 0.03, 0.97),
    y: clamp(y, 0.05, 0.97),
    depth,
    size: starSize(siX, siY),
  };
}

function createPinnedSlot(root, labelIndex, anchor) {
  const el = document.createElement('div');
  el.className = 'galaxy-datapoint galaxy-datapoint--pinned';

  const rgb = starRgbFromAnchor(anchor);
  const twinklePhase = hash21(anchor.si[0] * 2.1, anchor.si[1] * 1.7);
  el.style.setProperty('--orb-r', String(rgb.r));
  el.style.setProperty('--orb-g', String(rgb.g));
  el.style.setProperty('--orb-b', String(rgb.b));
  el.style.setProperty('--orb-twinkle-delay', `${(twinklePhase * -4.2).toFixed(2)}s`);

  const orb = document.createElement('span');
  orb.className = 'galaxy-datapoint__orb';
  orb.setAttribute('aria-hidden', 'true');
  orb.innerHTML =
    '<span class="galaxy-datapoint__orb-halo"></span>' +
    '<span class="galaxy-datapoint__orb-flare"></span>' +
    '<span class="galaxy-datapoint__orb-core"></span>';

  const text = document.createElement('span');
  text.className = 'galaxy-datapoint__text';
  text.textContent = labelText(labelIndex);

  el.append(orb, text);
  root.appendChild(el);

  return {
    el,
    text,
    labelIndex,
    anchor,
    tracking: false,
    trackRaf: 0,
  };
}

function startPinnedTracking(slot, motion, root, getTick) {
  slot.tracking = true;
  const step = () => {
    if (!slot.tracking) return;
    const w = Math.max(1, root.clientWidth);
    const h = Math.max(1, root.clientHeight);
    const p = orbToPercent(slot.anchor, getTick(), motion, w, h);
    slot.el.style.left = `${p.x * 100}%`;
    slot.el.style.top = `${p.y * 100}%`;
    const depthScale = 0.68 + p.depth * 0.42 + p.size * 0.12;
    const depthOpacity = 0.45 + p.depth * 0.45 + p.size * 0.18;
    slot.el.style.setProperty('--orb-scale', depthScale.toFixed(3));
    slot.el.style.setProperty('--orb-opacity', clamp(depthOpacity, 0.35, 1).toFixed(3));
    slot.el.style.zIndex = String(Math.round(10 + p.depth * 40));
    slot.trackRaf = window.requestAnimationFrame(step);
  };
  if (slot.trackRaf) window.cancelAnimationFrame(slot.trackRaf);
  step();
}

function stopPinnedTracking(slot) {
  slot.tracking = false;
  if (slot.trackRaf) window.cancelAnimationFrame(slot.trackRaf);
  slot.trackRaf = 0;
}

function initGalaxyDatapoints(root) {
  if (root.dataset.galaxyDatapointsInit === '1') return;
  root.dataset.galaxyDatapointsInit = '1';

  const space = root.closest('.produktdaten-space');
  const galaxy = root.closest('[data-galaxy]');
  const motion = readMotionOpts(galaxy);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tickState = {
    time: 0,
    starSpeed: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    mouseActive: 0,
    mouseParallax: 0.14,
  };
  const getTick = () => tickState;

  galaxy?.addEventListener('galaxy-tick', (e) => {
    tickState.time = e.detail.time;
    tickState.starSpeed = e.detail.starSpeed;
    tickState.mouseX = e.detail.mouseX;
    tickState.mouseY = e.detail.mouseY;
    tickState.mouseActive = e.detail.mouseActive;
    if (e.detail.mouseParallax != null) tickState.mouseParallax = e.detail.mouseParallax;
  });

  const built = buildOrbAnchors();
  const anchors = filterAnchorsInView(built, motion, root, tickState);
  const slots = anchors.map((anchor, i) => createPinnedSlot(root, i, anchor));
  let visible = false;

  const startAll = () => {
    if (visible) return;
    visible = true;
    slots.forEach((slot) => {
      slot.el.classList.add('is-visible');
      if (!reduced) startPinnedTracking(slot, motion, root, getTick);
    });
  };

  const stopAll = () => {
    visible = false;
    slots.forEach((slot) => {
      stopPinnedTracking(slot);
      slot.el.classList.remove('is-visible');
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) startAll();
      else stopAll();
    },
    { threshold: 0.08 },
  );

  io.observe(space || root);

  window.addEventListener('dppflash:langchange', () => {
    slots.forEach((slot) => {
      slot.text.textContent = labelText(slot.labelIndex);
    });
  });

  return () => {
    stopAll();
    io.disconnect();
    slots.forEach((slot) => slot.el.remove());
  };
}

function initAll() {
  document.querySelectorAll('[data-galaxy-datapoints]').forEach(initGalaxyDatapoints);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
