const ORB_STRIDE = 9;
const MAX_DATAPOINTS = 26;
const NETWORK_LINK_DIST = 0.22;
const TITLE_FOCAL_FALLBACK = { x: 0.5, y: 0.24 };
const TITLE_CLUSTER_RADIUS = 0.19;
const TITLE_CLUSTER_PULL = 0.62;
const TITLE_CLUSTER_MAX_PICK = 0.2;
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

function measureTitleFocal(root) {
  const headline = document.getElementById('produktdaten-einwand-heading');
  if (!headline || !root) return { ...TITLE_FOCAL_FALLBACK };
  const rr = root.getBoundingClientRect();
  if (rr.width < 1 || rr.height < 1) return { ...TITLE_FOCAL_FALLBACK };
  const hr = headline.getBoundingClientRect();
  const x = (hr.left + hr.width / 2 - rr.left) / rr.width;
  const y = (hr.top + hr.height * 0.5 - rr.top) / rr.height;
  return {
    x: clamp(x, 0.4, 0.6),
    y: clamp(y, 0.18, 0.38),
  };
}

function clusterAroundTitle(x, y, focal) {
  let nx = x + (focal.x - x) * TITLE_CLUSTER_PULL;
  let ny = y + (focal.y - y) * TITLE_CLUSTER_PULL;
  const dx = nx - focal.x;
  const dy = ny - focal.y;
  const dist = Math.hypot(dx, dy);
  if (dist > TITLE_CLUSTER_RADIUS) {
    const scale = TITLE_CLUSTER_RADIUS / dist;
    nx = focal.x + dx * scale;
    ny = focal.y + dy * scale;
  }
  if (Math.abs(nx - focal.x) < 0.1 && Math.abs(ny - focal.y) < 0.05) {
    const angle = Math.atan2(ny - focal.y, nx - focal.x) || 0;
    nx = focal.x + Math.cos(angle) * TITLE_CLUSTER_RADIUS * 0.52;
    ny = focal.y + Math.sin(angle) * TITLE_CLUSTER_RADIUS * 0.4;
  }
  return { x: nx, y: ny };
}

function bindOrbsLayerToEinwand(galaxy, space, root, motion) {
  if (!galaxy?.classList.contains('produktdaten-galaxy--orbs-only') || !space) return () => {};
  const einwand = document.getElementById('produktdaten-einwand');
  if (!einwand) return () => {};

  const sync = () => {
    const sr = space.getBoundingClientRect();
    const er = einwand.getBoundingClientRect();
    const topPx = er.top - sr.top;
    galaxy.classList.add('is-einwand-bound');
    galaxy.style.top = `${Math.round(topPx)}px`;
    galaxy.style.height = `${Math.round(er.height)}px`;
    galaxy.style.bottom = 'auto';
    motion.titleFocal = measureTitleFocal(root);
  };

  const ro = new ResizeObserver(sync);
  ro.observe(einwand);
  ro.observe(space);
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('load', sync, { once: true });
  sync();

  return () => {
    ro.disconnect();
    window.removeEventListener('resize', sync);
    galaxy.classList.remove('is-einwand-bound');
  };
}

function filterAnchorsInView(anchors, motion, root, tick) {
  const w = Math.max(1, root.clientWidth);
  const h = Math.max(1, root.clientHeight);
  const focal = motion.titleFocal || TITLE_FOCAL_FALLBACK;
  const scored = [];

  for (const anchor of anchors) {
    const p = orbToPercent(anchor, tick, motion, w, h);
    if (p.x < 0.06 || p.x > 0.94 || p.y < 0.08 || p.y > 0.9) continue;
    const dx = p.x - focal.x;
    const dy = p.y - focal.y;
    const dist = Math.hypot(dx, dy * 1.08);
    if (dist > TITLE_CLUSTER_MAX_PICK) continue;
    scored.push({ anchor, score: dist - p.depth * 0.04 });
  }

  scored.sort((a, b) => a.score - b.score);
  const picked = scored.slice(0, MAX_DATAPOINTS).map((s) => s.anchor);
  return picked.length ? picked : anchors.slice(0, MAX_DATAPOINTS);
}

/** Monochrome blue nodes for network look (less rainbow than shader stars). */
function starRgbFromAnchor(anchor) {
  const seed = hash21(anchor.si[0], anchor.si[1]);
  const mix = 0.42 + seed * 0.48;
  return {
    r: Math.round(72 + mix * 42),
    g: Math.round(148 + mix * 78),
    b: Math.round(228 + mix * 24),
  };
}

function ensureNetworkLayer(root) {
  let svg = root.querySelector('.galaxy-datapoints__network');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('galaxy-datapoints__network');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'none');
    root.prepend(svg);
  }
  return svg;
}

function updateNetworkLines(svg, slots, w, h) {
  if (!svg || !slots.length) return;
  const maxDist = Math.min(w, h) * NETWORK_LINK_DIST;
  const pts = slots.map((slot) => {
    const x = parseFloat(slot.el.style.left);
    const y = parseFloat(slot.el.style.top);
    return {
      x: (Number.isFinite(x) ? x / 100 : 0.5) * w,
      y: (Number.isFinite(y) ? y / 100 : 0.5) * h,
    };
  });

  const parts = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d = Math.hypot(dx, dy);
      if (d > maxDist) continue;
      const a = 0.34 * (1 - d / maxDist);
      parts.push(
        `<line x1="${pts[i].x.toFixed(1)}" y1="${pts[i].y.toFixed(1)}" x2="${pts[j].x.toFixed(1)}" y2="${pts[j].y.toFixed(1)}" stroke="rgba(72,168,255,${a.toFixed(3)})" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
      );
    }
  }

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = parts.join('');
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

  const focal = motion.titleFocal || TITLE_FOCAL_FALLBACK;
  const focalPxX = w * focal.x;
  const focalPxY = h * (1 - focal.y);
  const pxX = uv0x * h + focalPxX;
  const pxY = uv0y * h + focalPxY;

  let x = pxX / w;
  let y = 1 - pxY / h;

  const clustered = clusterAroundTitle(x, y, focal);
  x = clustered.x;
  y = clustered.y;

  if (anchor.xBias) x += anchor.xBias;
  if (anchor.yBias) y += anchor.yBias;

  return {
    x: clamp(x, 0.08, 0.92),
    y: clamp(y, 0.08, 0.9),
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

function startPinnedTracking(slot, motion, root, getTick, networkState) {
  slot.tracking = true;
  const step = () => {
    if (!slot.tracking) return;
    const w = Math.max(1, root.clientWidth);
    const h = Math.max(1, root.clientHeight);
    const p = orbToPercent(slot.anchor, getTick(), motion, w, h);
    slot.el.style.left = `${p.x * 100}%`;
    slot.el.style.top = `${p.y * 100}%`;
    const depthScale = 0.82 + p.depth * 0.48 + p.size * 0.16;
    const depthOpacity = 0.62 + p.depth * 0.38 + p.size * 0.22;
    slot.el.style.setProperty('--orb-scale', depthScale.toFixed(3));
    slot.el.style.setProperty('--orb-opacity', clamp(depthOpacity, 0.58, 1).toFixed(3));
    slot.el.style.zIndex = String(Math.round(10 + p.depth * 40));
    if (networkState && slot === networkState.slots[0]) {
      networkState.frame += 1;
      if (networkState.frame % 2 === 0) {
        updateNetworkLines(networkState.svg, networkState.slots, w, h);
      }
    }
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
  motion.titleFocal = measureTitleFocal(root);
  const cleanupEinwandBind = bindOrbsLayerToEinwand(galaxy, space, root, motion);
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
  const networkSvg = ensureNetworkLayer(root);
  const networkState = { svg: networkSvg, slots, frame: 0 };
  let visible = false;

  const startAll = () => {
    if (visible) return;
    visible = true;
    slots.forEach((slot, index) => {
      slot.el.classList.add('is-visible');
      if (!reduced) startPinnedTracking(slot, motion, root, getTick, index === 0 ? networkState : null);
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
    cleanupEinwandBind();
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
