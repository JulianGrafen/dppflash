/**
 * Vanilla port of React Bits “Blinking Dots” (density / dotSize / layerFade)
 * with optional grid network lines for data-graph feel.
 */

const DEFAULTS = {
  density: 4,
  coverage: 0.85,
  jitter: 0.35,
  dotSize: 0.95,
  sizeVariation: 0.85,
  falloff: 1.15,
  layers: 3,
  layerScale: 1.9,
  layerFade: 0.01,
  colorFrom: '#5b4fd9',
  colorTo: '#00d4ff',
  backgroundColor: 'transparent',
  twinkle: 0.45,
  twinkleSpeed: 0.9,
  driftSpeed: 0.004,
  driftAngle: 92,
  depthPerspective: 1,
  vignette: 0.42,
  brightness: 1,
  opacity: 1,
  cursorInteraction: true,
  cursorParallax: 0.06,
  dpr: 2,
  network: true,
  networkAlpha: 0.22,
};

function parseOpts(el) {
  const n = (key, fallback) => {
    const v = el.dataset[key];
    if (v === undefined || v === '') return fallback;
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  };
  const b = (key, fallback) => {
    const v = el.dataset[key];
    if (v === undefined || v === '') return fallback;
    return v === 'true' || v === '1';
  };
  return {
    density: n('density', DEFAULTS.density),
    coverage: n('coverage', DEFAULTS.coverage),
    jitter: n('jitter', DEFAULTS.jitter),
    dotSize: n('dotSize', DEFAULTS.dotSize),
    sizeVariation: n('sizeVariation', DEFAULTS.sizeVariation),
    falloff: n('falloff', DEFAULTS.falloff),
    layers: Math.min(6, Math.max(1, Math.round(n('layers', DEFAULTS.layers)))),
    layerScale: n('layerScale', DEFAULTS.layerScale),
    layerFade: n('layerFade', DEFAULTS.layerFade),
    colorFrom: el.dataset.colorFrom || DEFAULTS.colorFrom,
    colorTo: el.dataset.colorTo || DEFAULTS.colorTo,
    backgroundColor: el.dataset.backgroundColor || DEFAULTS.backgroundColor,
    twinkle: n('twinkle', DEFAULTS.twinkle),
    twinkleSpeed: n('twinkleSpeed', DEFAULTS.twinkleSpeed),
    driftSpeed: n('driftSpeed', DEFAULTS.driftSpeed),
    driftAngle: n('driftAngle', DEFAULTS.driftAngle),
    depthPerspective: n('depthPerspective', DEFAULTS.depthPerspective),
    vignette: n('vignette', DEFAULTS.vignette),
    brightness: n('brightness', DEFAULTS.brightness),
    opacity: n('opacity', DEFAULTS.opacity),
    cursorInteraction: b('cursorInteraction', DEFAULTS.cursorInteraction),
    cursorParallax: n('cursorParallax', DEFAULTS.cursorParallax),
    dpr: n('dpr', DEFAULTS.dpr),
    network: b('network', DEFAULTS.network),
    networkAlpha: n('networkAlpha', DEFAULTS.networkAlpha),
  };
}

function hash2(a, b) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function lerpColor(c0, c1, t) {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const a = p(c0);
  const b = p(c1);
  const m = (i) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}

function layerBrightness(layerIndex, layers, layerFade) {
  if (layers <= 1) return 1;
  const t = layerIndex / (layers - 1);
  return layerFade + (1 - layerFade) * t;
}

function buildGrid(w, h, density, layerIndex, opts) {
  const scale = Math.pow(opts.layerScale, layerIndex);
  const base = Math.max(2, density * scale);
  const short = Math.min(w, h);
  const cols = Math.max(2, Math.round(base * (w / short)));
  const rows = Math.max(2, Math.round(base * (h / short)));
  const cell = short / base;
  const dots = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seed = hash2(col * 0.71 + layerIndex, row * 1.13 + layerIndex * 2);
      if (seed > opts.coverage) continue;
      const jx = (hash2(col, row) - 0.5) * opts.jitter * cell;
      const jy = (hash2(row, col) - 0.5) * opts.jitter * cell;
      const cx = (col + 0.5) * (w / cols) + jx;
      const cy = (row + 0.5) * (h / rows) + jy;
      const sizeT = hash2(col + 3, row + 7);
      const radius = (cell * 0.062) * opts.dotSize * (1 + opts.sizeVariation * (sizeT - 0.5));
      dots.push({
        col,
        row,
        x: cx,
        y: cy,
        radius,
        phase: seed * Math.PI * 2,
        color: lerpColor(opts.colorFrom, opts.colorTo, sizeT),
      });
    }
  }
  return { dots, cols, rows, cell };
}

function networkEdges(dots, cols, rows) {
  const byKey = new Map();
  dots.forEach((d) => byKey.set(`${d.col},${d.row}`, d));
  const edges = [];
  const seen = new Set();
  const neighbors = [
    [0, 1],
    [1, 0],
  ];
  for (const d of dots) {
    for (const [dc, dr] of neighbors) {
        const k = `${d.col + dc},${d.row + dr}`;
        const o = byKey.get(k);
        if (!o) continue;
        const id = d.col < o.col || (d.col === o.col && d.row < o.row)
          ? `${d.col},${d.row}|${o.col},${o.row}`
          : `${o.col},${o.row}|${d.col},${d.row}`;
        if (seen.has(id)) continue;
        seen.add(id);
        edges.push([d, o]);
    }
  }
  return edges;
}

function initBlinkingDots(mount) {
  if (mount.dataset.blinkingDotsInit) return;
  mount.dataset.blinkingDotsInit = '1';

  const opts = parseOpts(mount);
  const canvas = document.createElement('canvas');
  canvas.className = 'blinking-dots__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  mount.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  const space = mount.closest('.produktdaten-space') || mount.parentElement;
  const headline = space?.querySelector('.produktdaten-einwand');

  const state = {
    w: 0,
    h: 0,
    pointer: { x: 0, y: 0, tx: 0, ty: 0, active: false },
    reveal: 0,
    scrollReveal: 0,
    raf: 0,
    t0: performance.now(),
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    layerCache: null,
  };

  function rebuildLayerCache() {
    const layers = [];
    for (let li = 0; li < opts.layers; li++) {
      const grid = buildGrid(state.w, state.h, opts.density, li, opts);
      const drawNet = opts.network && li === opts.layers - 1;
      const edges = drawNet ? networkEdges(grid.dots, grid.cols, grid.rows) : [];
      layers.push({ grid, edges });
    }
    state.layerCache = layers;
  }

  const motionScale = () => (state.reduced ? 0.35 : 1);

  const smoothstep = (t) => t * t * (3 - 2 * t);

  let headlinePeak = 0;

  const updateScrollReveal = () => {
    if (!space) return;
    const vh = window.innerHeight;
    const spaceRect = space.getBoundingClientRect();
    const inSpace = spaceRect.bottom > 48 && spaceRect.top < vh;

    if (headline) {
      const rect = headline.getBoundingClientRect();
      const start = vh * 0.95;
      const end = vh * 0.22;
      const raw = (start - rect.top) / (start - end);
      const headP = smoothstep(Math.max(0, Math.min(1, raw)));
      if (spaceRect.top > vh * 0.5) headlinePeak = 0;
      headlinePeak = Math.max(headlinePeak, headP);
      headline.style.setProperty('--einwand-reveal', headlinePeak.toFixed(4));
    }

    const tailFade = Math.min(1, Math.max(0.35, spaceRect.bottom / (vh * 0.55)));
    const enterFade = Math.min(1, Math.max(0, (vh * 0.92 - spaceRect.top) / (vh * 0.35)));
    state.scrollReveal = inSpace ? Math.max(headlinePeak, enterFade) * tailFade : 0;

    if (state.scrollReveal > 0.03) mount.classList.add('is-active');
    else mount.classList.remove('is-active');
  };

  const trackRect = () => (space || mount).getBoundingClientRect();

  const onPointerMove = (e) => {
    if (!opts.cursorInteraction) return;
    const r = trackRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    ) {
      state.pointer.active = false;
      return;
    }
    state.pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    state.pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    state.pointer.active = true;
  };

  if (opts.cursorInteraction) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  window.addEventListener('scroll', updateScrollReveal, { passive: true });
  window.addEventListener('resize', updateScrollReveal, { passive: true });
  updateScrollReveal();

  function resize() {
    const dpr = Math.min(opts.dpr, window.devicePixelRatio || 1);
    const r = mount.getBoundingClientRect();
    state.w = Math.max(1, r.width);
    state.h = Math.max(1, r.height);
    canvas.width = Math.floor(state.w * dpr);
    canvas.height = Math.floor(state.h * dpr);
    canvas.style.width = `${state.w}px`;
    canvas.style.height = `${state.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildLayerCache();
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(space || mount);

  function drawDot(x, y, radius, color, alpha, falloff) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.4 + falloff * 0.15), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function projectDepth(x, y, w, h, scrollR, layerDepth) {
    const persp = opts.depthPerspective;
    const vanishX = w * 0.5;
    const vanishY = h * 0.5;
    const spread = (0.72 + layerDepth * 0.28) * (1 + (1 - scrollR) * 0.08 * persp);
    const dx = x - vanishX;
    const dy = y - vanishY;
    const lift = (layerDepth - 0.5) * h * 0.012;
    const z = 0.55 + layerDepth * 0.85;
    return {
      x: vanishX + dx * spread,
      y: vanishY + dy * spread + lift,
      scale: 0.55 + layerDepth * 0.45,
      z,
    };
  }

  function applyCursorSpace3D(x, y, w, h, depth, z, px, py) {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const dx = x - cx;
    const dy = y - cy;
    const shiftX = px * w * (0.02 + depth * 0.07);
    const shiftY = py * h * (0.02 + depth * 0.07);
    return {
      x: cx + dx + shiftX,
      y: cy + dy + shiftY,
    };
  }

  function frame(now) {
    state.raf = requestAnimationFrame(frame);
    updateScrollReveal();
    const scrollR = state.scrollReveal;
    if (scrollR <= 0.001) {
      ctx.clearRect(0, 0, state.w, state.h);
      return;
    }

    state.reveal += scrollR > state.reveal ? 0.06 : -0.05;
    state.reveal = Math.max(0, Math.min(1, scrollR));

    const t = (now - state.t0) / 1000 * motionScale();
    const w = state.w;
    const h = state.h;
    const driftRad = (opts.driftAngle * Math.PI) / 180;
    const driftMul = (0.18 + scrollR * 0.42) * motionScale();
    const driftPhase = t * opts.driftSpeed * 48;
    const driftAmpX = w * 0.055 * driftMul;
    const driftAmpY = h * 0.048 * driftMul;
    const driftX =
      Math.cos(driftRad + driftPhase) * driftAmpX +
      Math.sin(driftPhase * 0.37 + 1.2) * driftAmpX * 0.35;
    const driftY =
      Math.sin(driftRad + driftPhase * 0.92) * driftAmpY +
      Math.cos(driftPhase * 0.41) * driftAmpY * 0.3;

    const ptr = state.pointer;
    const lerp = state.reduced ? 1 : 0.07;
    ptr.x += (ptr.tx - ptr.x) * lerp;
    ptr.y += (ptr.ty - ptr.y) * lerp;
    if (!ptr.active) {
      ptr.x += (0 - ptr.x) * lerp;
      ptr.y += (0 - ptr.y) * lerp;
    }

    ctx.clearRect(0, 0, w, h);
    const bgBase = opts.backgroundColor === 'transparent' ? '#000000' : opts.backgroundColor;
    ctx.fillStyle = bgBase;
    ctx.globalAlpha = 0.92 * scrollR;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    const master = opts.opacity * opts.brightness * state.reveal;

    for (let li = 0; li < opts.layers; li++) {
      const depth = li / Math.max(1, opts.layers - 1);
      const parallax = 0.22 + (1 - depth) * 0.78;
      const px = opts.cursorInteraction ? ptr.x * opts.cursorParallax * w * (0.25 + depth * 1.35) : 0;
      const py = opts.cursorInteraction ? ptr.y * opts.cursorParallax * h * (0.25 + depth * 1.35) : 0;
      const ox = driftX * parallax + px * 0.42;
      const oy = driftY * parallax + py * 0.42;
      const depthBright = 0.35 + depth * 0.72;
      const layerBright = layerBrightness(li, opts.layers, opts.layerFade) * master * depthBright;
      const spaceAmp = (4 + depth * 14) * scrollR * motionScale();
      const depthShiftY = (depth - 0.5) * h * 0.022 * Math.sin(t * 0.08 + depth * 2.1);
      const twSlow = t * opts.twinkleSpeed * 0.32;

      const cached = state.layerCache?.[li];
      if (!cached) continue;
      const { grid, edges } = cached;

      const placeDot = (d) => {
        let x = d.x + ox;
        let y = d.y + oy;
        const floatT = t * (0.11 + depth * 0.05);
        x += Math.sin(floatT + d.phase) * spaceAmp;
        y += Math.cos(floatT * 0.88 + d.phase * 1.4) * spaceAmp * 0.85;
        const p = projectDepth(x, y + depthShiftY, w, h, scrollR, depth);
        const c3 = applyCursorSpace3D(p.x, p.y, w, h, depth, p.z, ptr.x, ptr.y);
        const depthScale = p.scale * (0.55 + scrollR * 0.22);
        const depthAlpha = 0.4 + depth * 0.65;
        return { x: c3.x, y: c3.y, r: d.radius * depthScale, a: depthAlpha };
      };

      if (opts.network && edges.length) {
        ctx.lineWidth = 0.65;
        for (const [a, b] of edges) {
          const pa = placeDot(a);
          const pb = placeDot(b);
          const tw = 0.5 + 0.5 * Math.sin(twSlow + (a.phase + b.phase) * 0.5);
          const la = opts.networkAlpha * layerBright * (0.45 + 0.55 * tw) * ((pa.a + pb.a) * 0.5);
          ctx.strokeStyle = lerpColor(opts.colorFrom, opts.colorTo, 0.55);
          ctx.globalAlpha = la;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      for (const d of grid.dots) {
        const tw = state.reduced
          ? 1
          : 1 - opts.twinkle * (0.5 + 0.5 * Math.sin(twSlow + d.phase));
        const pt = placeDot(d);
        const alpha = layerBright * tw * pt.a;
        drawDot(pt.x, pt.y, pt.r, d.color, alpha, opts.falloff);
      }
    }

    if (opts.vignette > 0) {
      const vg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        w * 0.15,
        w * 0.5,
        h * 0.5,
        w * 0.85,
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.55, `rgba(0,0,0,${opts.vignette * 0.35 * scrollR})`);
      vg.addColorStop(1, `rgba(0,0,0,${opts.vignette * scrollR})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    const topFade = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    topFade.addColorStop(0, `rgba(0,0,0,${0.65 * (1 - scrollR)})`);
    topFade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, w, h * 0.35);
  }

  state.raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(state.raf);
    window.removeEventListener('scroll', updateScrollReveal);
    window.removeEventListener('resize', updateScrollReveal);
    ro.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
  };
}

document.querySelectorAll('[data-blinking-dots]').forEach(initBlinkingDots);
