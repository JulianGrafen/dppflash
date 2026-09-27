const LABEL_COUNT = 10;
const NETWORK_LINK_DIST = 0.2;
const NETWORK_MAX_LINKS_PER_NODE = 4;
const ORB_FLOAT_AMP = 0.038;
const TITLE_FOCAL_FALLBACK = { x: 0.5, y: 0.28 };

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
  'story.datapoint.packaging',
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
  'Verpackung',
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
  'Packaging',
];

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

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function labelText(index) {
  const key = LABEL_KEYS[index % LABEL_KEYS.length];
  const t = window.DppI18n?.t?.(key);
  if (t && t !== key) return t;
  const en = window.DppI18n?.getLang?.() === 'en';
  const fallbacks = en ? FALLBACK_EN : FALLBACK_DE;
  return fallbacks[index % fallbacks.length];
}

function measureTitleFocal(root) {
  const headline = document.getElementById('produktdaten-einwand-heading');
  if (!headline || !root) return { ...TITLE_FOCAL_FALLBACK };
  const rr = root.getBoundingClientRect();
  if (rr.width < 1 || rr.height < 1) return { ...TITLE_FOCAL_FALLBACK };
  const hr = headline.getBoundingClientRect();
  return {
    x: clamp((hr.left + hr.width / 2 - rr.left) / rr.width, 0.4, 0.6),
    y: clamp((hr.top + hr.height * 0.5 - rr.top) / rr.height, 0.16, 0.4),
  };
}

function buildLabelAnchors(count, focal) {
  const anchors = [];
  for (let i = 0; i < count; i++) {
    const u = hash21(i * 2.1, i * 0.7);
    const v = hash21(i * 1.3, i * 3.9);
    const angle = (i / count) * Math.PI * 2 + (u - 0.5) * 0.65;
    const rx = 0.36 + u * 0.14;
    const ry = 0.4 + v * 0.12;
    const x = focal.x + Math.cos(angle) * rx;
    const y = focal.y + Math.sin(angle) * ry;
    anchors.push({
      si: [i, i * 2 + 1],
      layer: i % 4,
      homeX: clamp(x, 0.06, 0.94),
      homeY: clamp(y, 0.06, 0.9),
    });
  }
  return anchors;
}

function orbFloatOffset(anchor, time) {
  const u = hash21(anchor.si[0] * 1.9, anchor.si[1] + anchor.layer);
  const v = hash21(anchor.si[1] * 2.2, anchor.layer * 1.7);
  const speed = 0.11 + u * 0.1;
  const t = time * speed;
  const ax = ORB_FLOAT_AMP * (0.55 + u * 0.45);
  const ay = ORB_FLOAT_AMP * (0.55 + v * 0.45);
  const fx = 0.48 + u * 0.75;
  const fy = 0.52 + v * 0.7;
  const phaseX = u * Math.PI * 2;
  const phaseY = v * Math.PI * 2;
  return {
    ox: Math.sin(t * fx + phaseX) * ax + Math.sin(t * fx * 1.67 + phaseY) * ax * 0.32,
    oy: Math.cos(t * fy + phaseY) * ay + Math.cos(t * fy * 1.54 + phaseX) * ay * 0.32,
  };
}

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
  const linkCount = new Array(pts.length).fill(0);
  const edges = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d > maxDist) continue;
      edges.push({ i, j, d });
    }
  }
  edges.sort((a, b) => a.d - b.d);
  for (const { i, j, d } of edges) {
    if (linkCount[i] >= NETWORK_MAX_LINKS_PER_NODE || linkCount[j] >= NETWORK_MAX_LINKS_PER_NODE) {
      continue;
    }
    linkCount[i] += 1;
    linkCount[j] += 1;
    const a = 0.28 * (1 - d / maxDist);
    parts.push(
      `<line x1="${pts[i].x.toFixed(1)}" y1="${pts[i].y.toFixed(1)}" x2="${pts[j].x.toFixed(1)}" y2="${pts[j].y.toFixed(1)}" stroke="rgba(72,168,255,${a.toFixed(3)})" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
    );
  }
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = parts.join('');
}

function createLabelSlot(root, labelIndex, anchor) {
  const el = document.createElement('div');
  el.className = 'galaxy-datapoint galaxy-datapoint--pinned';

  const rgb = starRgbFromAnchor(anchor);
  const twinklePhase = hash21(anchor.si[0] * 2.1, anchor.si[1] * 1.7);
  el.style.setProperty('--orb-r', String(rgb.r));
  el.style.setProperty('--orb-g', String(rgb.g));
  el.style.setProperty('--orb-b', String(rgb.b));
  el.style.setProperty('--orb-twinkle-delay', `${(twinklePhase * -4.2).toFixed(2)}s`);
  el.style.setProperty('--orb-scale', '0.72');
  el.style.setProperty('--orb-opacity', '0.92');

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

  return { el, text, labelIndex, anchor, trackRaf: 0, tracking: false };
}

function initProduktdatenLabels(root) {
  if (root.dataset.produktdatenLabelsInit === '1') return () => {};
  root.dataset.produktdatenLabelsInit = '1';

  const space = root.closest('.produktdaten-space');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let focal = measureTitleFocal(root);
  const anchors = buildLabelAnchors(LABEL_COUNT, focal);
  const slots = anchors.map((anchor, i) => createLabelSlot(root, i, anchor));
  const networkSvg = ensureNetworkLayer(root);
  const networkState = { svg: networkSvg, slots };

  let visible = false;
  let startTime = performance.now();
  let focalRaf = 0;

  const repositionHomes = () => {
    focal = measureTitleFocal(root);
    const next = buildLabelAnchors(LABEL_COUNT, focal);
    next.forEach((anchor, i) => {
      slots[i].anchor.homeX = anchor.homeX;
      slots[i].anchor.homeY = anchor.homeY;
    });
  };

  const track = (slot) => {
    if (!slot.tracking) return;
    const w = Math.max(1, root.clientWidth);
    const h = Math.max(1, root.clientHeight);
    const time = (performance.now() - startTime) * 0.001;
    const float = reduced ? { ox: 0, oy: 0 } : orbFloatOffset(slot.anchor, time);
    const x = clamp(slot.anchor.homeX + float.ox, 0.05, 0.95);
    const y = clamp(slot.anchor.homeY + float.oy, 0.05, 0.92);
    slot.el.style.left = `${x * 100}%`;
    slot.el.style.top = `${y * 100}%`;
    slot.trackRaf = requestAnimationFrame(() => track(slot));
  };

  const startAll = () => {
    if (visible) return;
    visible = true;
    startTime = performance.now();
    repositionHomes();
    slots.forEach((slot, index) => {
      slot.el.classList.add('is-visible');
      if (!reduced) {
        slot.tracking = true;
        track(slot);
      } else {
        const a = slot.anchor;
        slot.el.style.left = `${a.homeX * 100}%`;
        slot.el.style.top = `${a.homeY * 100}%`;
      }
      if (index === 0) {
        updateNetworkLines(networkSvg, slots, root.clientWidth, root.clientHeight);
      }
    });

    if (!reduced) {
      const loopNetwork = () => {
        if (!visible) return;
        focalRaf = requestAnimationFrame(loopNetwork);
        updateNetworkLines(networkSvg, slots, root.clientWidth, root.clientHeight);
      };
      focalRaf = requestAnimationFrame(loopNetwork);
    }
  };

  const stopAll = () => {
    visible = false;
    slots.forEach((slot) => {
      slot.tracking = false;
      if (slot.trackRaf) cancelAnimationFrame(slot.trackRaf);
      slot.el.classList.remove('is-visible');
    });
    if (focalRaf) cancelAnimationFrame(focalRaf);
  };

  const onResize = () => {
    repositionHomes();
    updateNetworkLines(networkSvg, slots, root.clientWidth, root.clientHeight);
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) startAll();
      else stopAll();
    },
    { threshold: 0.06 },
  );
  io.observe(space || root);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize, { once: true });

  window.addEventListener('dppflash:langchange', () => {
    slots.forEach((slot) => {
      slot.text.textContent = labelText(slot.labelIndex);
    });
  });

  return () => {
    stopAll();
    io.disconnect();
    window.removeEventListener('resize', onResize);
    slots.forEach((slot) => slot.el.remove());
  };
}

function initAll() {
  document.querySelectorAll('[data-produktdaten-labels]').forEach(initProduktdatenLabels);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
