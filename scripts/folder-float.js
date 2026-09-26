import Matter from 'matter-js';

const { Bodies, Body, Composite, Engine } = Matter;

const PAD = 28;
const CHAR = 6.8;
const GAP = 12;
const ROW = 52;
const DRAG_MIN = 4;
const ZONE_PAD = 8;

function jitter(i) {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
}

function layout(list, spread, lift, tilt, sizes) {
  const rows = [];
  let row = [];
  let width = 0;
  list.forEach((item, i) => {
    const pw = sizes[i]?.w ?? PAD + item.label.length * CHAR;
    if (row.length && width + GAP + pw > spread * 2) {
      rows.push({ items: row, width });
      row = [];
      width = 0;
    }
    row.push({ i, pw });
    width += (row.length > 1 ? GAP : 0) + pw;
  });
  if (row.length) rows.push({ items: row, width });
  const pos = [];
  rows.forEach((r, ri) => {
    let x = -r.width / 2;
    const shift = (ri % 2 ? 1 : -1) * Math.min(16, spread * 0.1);
    r.items.forEach(({ i, pw }) => {
      const j = jitter(i);
      pos[i] = {
        x: x + pw / 2 + shift + (j - 0.5) * 6,
        y: -lift - ri * ROW - j * 6,
        r: tilt * (j * 2 - 1),
      };
      x += pw + GAP;
    });
  });
  return pos;
}

function getWrap(mount) {
  return mount.closest('[data-folder-float-wrap]') || mount.parentElement;
}

function readItems(mount) {
  const seed = getWrap(mount)?.querySelector('[data-folder-float-seed]');
  if (!seed) return [];
  return [...seed.querySelectorAll('[data-folder-float-item]')].map((el) => ({
    label: el.textContent.trim(),
    value: el.getAttribute('data-value') || el.textContent.trim(),
  }));
}

function readText(mount, attr, fallback) {
  const el = getWrap(mount)?.querySelector(`[${attr}]`);
  return el?.textContent.trim() || fallback;
}

class FolderFloat {
  constructor(mount) {
    this.mount = mount;
    this.opts = {
      trigger: mount.dataset.trigger || 'hover',
      physics: mount.dataset.physics !== 'false',
      closeOnSelect: mount.dataset.closeOnSelect !== 'false',
      drift: Number(mount.dataset.drift) || 0.5,
      width: Number(mount.dataset.width) || 240,
      height: Number(mount.dataset.height) || 148,
      radius: Number(mount.dataset.radius) || 14,
      spread: Number(mount.dataset.spread) || 200,
      lift: Number(mount.dataset.lift) || 36,
      tilt: Number(mount.dataset.tilt) || 8,
      flapAngle: Number(mount.dataset.flapAngle) || 34,
      restAngle: Number(mount.dataset.restAngle) || 16,
      openDuration: Number(mount.dataset.openDuration) || 520,
      stagger: Number(mount.dataset.stagger) || 45,
      bounce: Number(mount.dataset.bounce) || 0.3,
      folderColor: mount.dataset.folderColor || '#1a2438',
      frontColor: mount.dataset.frontColor || '#2a354d',
      paperColor: mount.dataset.paperColor || '#e8eef5',
      itemColor: mount.dataset.itemColor || 'rgba(246,251,255,0.96)',
      itemTextColor: mount.dataset.itemTextColor || '#0c1220',
      labelColor: mount.dataset.labelColor || '#f6fbff',
    };

    this.open = false;
    this.popped = -1;
    this.live = false;
    this.sizes = [];
    this.list = [];
    this.pos = [];
    this.pillEls = [];
    this.world = {
      engine: null,
      bodies: [],
      sizes: [],
      raf: 0,
      last: 0,
      t0: 0,
      drag: null,
      zone: null,
      live: false,
    };
    this.reduce = false;
    this.popTimer = null;
    this.liveTimer = null;
    this.root = null;
    this.anchor = null;

    this.build();
    this.syncContent();
    this.measure();
    this.bind();
  }

  build() {
    this.mount.innerHTML = '';
    this.root = document.createElement('div');
    this.root.className = 'folder-float';
    this.root.dataset.trigger = this.opts.trigger;
    if (this.opts.physics) this.root.dataset.physics = '';

    this.anchor = document.createElement('div');
    this.anchor.className = 'folder-float__items';
    this.root.appendChild(this.anchor);

    const folder = document.createElement('div');
    folder.className = 'folder-float__folder';
    folder.innerHTML = `
      <span class="folder-float__back" aria-hidden="true"></span>
      <span class="folder-float__paper" aria-hidden="true"></span>
      <span class="folder-float__front" aria-hidden="true">
        <span class="folder-float__label"></span>
        <span class="folder-float__sub"></span>
      </span>
      <button type="button" class="folder-float__trigger" aria-expanded="false"></button>
    `;
    this.root.appendChild(folder);
    this.labelEl = folder.querySelector('.folder-float__label');
    this.subEl = folder.querySelector('.folder-float__sub');
    this.triggerBtn = folder.querySelector('.folder-float__trigger');
    this.mount.appendChild(this.root);
    this.applyVars();
  }

  applyVars() {
    const o = this.opts;
    const n = this.list.length;
    Object.assign(this.root.style, {
      '--ff-w': `${o.width}px`,
      '--ff-h': `${o.height}px`,
      '--ff-r': `${o.radius}px`,
      '--ff-back': o.folderColor,
      '--ff-front': o.frontColor,
      '--ff-paper': o.paperColor,
      '--ff-item': o.itemColor,
      '--ff-item-ink': o.itemTextColor,
      '--ff-label': o.labelColor,
      '--ff-spread': `${o.spread}px`,
      '--ff-lift': `${o.lift}px`,
      '--ff-angle': `${o.flapAngle}deg`,
      '--ff-rest': `${o.restAngle}deg`,
      '--ff-open': `${o.openDuration}ms`,
      '--ff-close': `${Math.round(o.openDuration * 0.6)}ms`,
      '--ff-stagger': `${o.stagger}ms`,
      '--ff-n': String(n),
      '--ff-spring': `cubic-bezier(0.34, ${(1 + o.bounce * 1.9).toFixed(2)}, 0.64, 1)`,
    });
  }

  syncContent() {
    this.list = readItems(this.mount);
    const label = readText(this.mount, 'data-folder-float-label', 'Produktdaten');
    const sub = readText(this.mount, 'data-folder-float-sublabel', '');
    const n = this.list.length;
    this.labelEl.textContent = label;
    this.subEl.textContent = sub || `${n} Quellen`;
    this.triggerBtn.setAttribute('aria-label', `${label}, ${this.subEl.textContent}`);
    this.applyVars();
  }

  measure() {
    this.anchor.innerHTML = '';
    this.pillEls = [];
    const sizes = [];
    this.list.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'folder-float__item';
      btn.innerHTML = `<span class="folder-float__drift">${item.label}</span>`;
      btn.style.visibility = 'hidden';
      btn.style.position = 'absolute';
      this.anchor.appendChild(btn);
      this.pillEls.push(btn);
      sizes.push({ w: btn.offsetWidth, h: btn.offsetHeight });
    });
    if (sizes.some((s) => !s.w)) {
      document.fonts?.ready.then(() => this.measure());
      return;
    }
    this.sizes = sizes;
    this.pos = layout(this.list, this.opts.spread, this.opts.lift, this.opts.tilt, sizes);
    this.pillEls.forEach((btn, i) => {
      const p = this.pos[i];
      btn.style.visibility = '';
      btn.style.setProperty('--i', String(i));
      btn.style.setProperty('--x', `${p.x.toFixed(1)}px`);
      btn.style.setProperty('--y', `${p.y.toFixed(1)}px`);
      btn.style.setProperty('--r', `${p.r.toFixed(2)}deg`);
      btn.tabIndex = this.open ? 0 : -1;
      btn.setAttribute('aria-hidden', this.open ? 'false' : 'true');
      const item = this.list[i];
      btn.onpointerdown = (e) => this.onDown(e, i);
      btn.onpointermove = (e) => this.onMove(e, i);
      btn.onpointerup = (e) => this.onUp(e, i, item);
      btn.onpointercancel = (e) => this.onUp(e, i, item);
      btn.onclick = (e) => {
        if (!this.world.live || e.detail === 0) this.pick(item, i);
      };
    });
  }

  setOpen(next) {
    if (this.open === next) return;
    if (!next) this.stopPhysics();
    this.open = next;
    this.root.toggleAttribute('data-open', next);
    this.triggerBtn.setAttribute('aria-expanded', String(next));
    this.pillEls.forEach((btn) => {
      btn.tabIndex = next ? 0 : -1;
      btn.setAttribute('aria-hidden', next ? 'false' : 'true');
    });
    clearTimeout(this.liveTimer);
    if (next && this.opts.physics && !this.reduce) {
      const delay = this.opts.openDuration + (this.list.length - 1) * this.opts.stagger + 80;
      this.liveTimer = setTimeout(() => this.startPhysics(), delay);
    }
  }

  stopPhysics() {
    const w = this.world;
    clearTimeout(this.liveTimer);
    cancelAnimationFrame(w.raf);
    w.raf = 0;
    if (w.engine) {
      w.bodies.forEach((b, i) => {
        const el = this.pillEls[i];
        if (!el) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty('--y', `${(b.position.y - w.sizes[i].h / 2).toFixed(1)}px`);
      });
      Composite.clear(w.engine.world, false, true);
      Engine.clear(w.engine);
      w.engine = null;
    }
    w.bodies = [];
    w.drag = null;
    w.live = false;
    this.live = false;
    this.root.removeAttribute('data-live');
  }

  startPhysics() {
    const w = this.world;
    if (w.engine) return;
    const els = this.pillEls;
    if (!els.length || els.some((el) => !el)) return;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engine.enableSleeping = false;
    w.engine = engine;
    w.sizes = els.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
    const ys = this.pos.map((p) => p.y);
    const spread = this.opts.spread;
    const lift = this.opts.lift;
    const zone = {
      left: -spread - ZONE_PAD,
      right: spread + ZONE_PAD,
      top: Math.min(...ys) - ZONE_PAD,
      bottom: -lift + Math.max(...w.sizes.map((s) => s.h)),
    };
    w.zone = zone;
    w.bodies = els.map((el, i) => {
      const { w: bw, h: bh } = w.sizes[i];
      const b = Bodies.rectangle(this.pos[i].x, this.pos[i].y + bh / 2, bw, bh, {
        chamfer: { radius: Math.min(bh / 2 - 1, 16) },
        restitution: 0.55,
        friction: 0,
        frictionAir: 0.08,
        inertia: Infinity,
      });
      b.plugin = { phase: jitter(i) * Math.PI * 2 };
      return b;
    });
    const T = 80;
    const walls = [
      Bodies.rectangle((zone.left + zone.right) / 2, zone.top - T / 2, zone.right - zone.left + 2 * T, T, {
        isStatic: true,
      }),
      Bodies.rectangle((zone.left + zone.right) / 2, zone.bottom + T / 2, zone.right - zone.left + 2 * T, T, {
        isStatic: true,
      }),
      Bodies.rectangle(zone.left - T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, {
        isStatic: true,
      }),
      Bodies.rectangle(zone.right + T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, {
        isStatic: true,
      }),
    ];
    Composite.add(engine.world, [...w.bodies, ...walls]);
    w.live = true;
    w.last = 0;
    w.t0 = performance.now();
    this.live = true;
    this.root.setAttribute('data-live', '');

    const tick = (now) => {
      const s = this.world;
      if (!s.engine) return;
      const dt = s.last ? Math.min(32, now - s.last) : 16;
      s.last = now;
      const t = (now - s.t0) / 1000;
      const k = this.opts.drift * 0.00005 * Math.min(1, t / 2);
      s.bodies.forEach((b, i) => {
        if (s.drag && s.drag.i === i) return;
        const ph = b.plugin.phase;
        Body.applyForce(b, b.position, {
          x: Math.sin(t * 0.9 + ph) * k * b.mass,
          y: Math.cos(t * 1.3 + ph * 1.7) * k * b.mass,
        });
      });
      Engine.update(s.engine, dt);
      s.bodies.forEach((b, i) => {
        const el = this.pillEls[i];
        if (!el) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty('--y', `${(b.position.y - s.sizes[i].h / 2).toFixed(1)}px`);
      });
      s.raf = requestAnimationFrame(tick);
    };
    w.raf = requestAnimationFrame(tick);
  }

  pick(item, i) {
    clearTimeout(this.popTimer);
    this.popped = i;
    this.pillEls[i]?.setAttribute('data-pop', '');
    this.popTimer = setTimeout(() => {
      this.popped = -1;
      this.pillEls[i]?.removeAttribute('data-pop');
    }, 320);
    if (this.opts.closeOnSelect) this.setOpen(false);
  }

  pointerAt(e) {
    const r = this.anchor.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  onDown(e, i) {
    const w = this.world;
    if (!w.live || e.button !== 0) return;
    const b = w.bodies[i];
    if (!b) return;
    const p = this.pointerAt(e);
    w.drag = {
      i,
      id: e.pointerId,
      dx: b.position.x - p.x,
      dy: b.position.y - p.y,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  onMove(e, i) {
    const w = this.world;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) >= DRAG_MIN) {
      d.moved = true;
      e.currentTarget.setAttribute('data-drag', '');
    }
    if (!d.moved) return;
    const b = w.bodies[i];
    const { w: bw, h: bh } = w.sizes[i];
    const z = w.zone;
    const p = this.pointerAt(e);
    const x = Math.min(z.right - bw / 2, Math.max(z.left + bw / 2, p.x + d.dx));
    const y = Math.min(z.bottom - bh / 2, Math.max(z.top + bh / 2, p.y + d.dy));
    Body.setVelocity(b, { x: (x - b.position.x) * 0.6, y: (y - b.position.y) * 0.6 });
    Body.setPosition(b, { x, y });
  }

  onUp(e, i, item) {
    const w = this.world;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    w.drag = null;
    e.currentTarget.removeAttribute('data-drag');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!d.moved && e.type === 'pointerup') this.pick(item, i);
  }

  bind() {
    const hover = this.opts.trigger === 'hover';
    if (hover) {
      this.root.addEventListener('pointerenter', () => this.setOpen(true));
      this.root.addEventListener('pointerleave', () => {
        if (!this.world.drag) this.setOpen(false);
      });
    }
    this.triggerBtn.addEventListener('click', () => this.setOpen(!this.open));
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.open) {
        e.stopPropagation();
        this.setOpen(false);
      }
    });

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduce = () => {
      this.reduce = mq.matches;
      if (this.reduce) this.stopPhysics();
    };
    syncReduce();
    mq.addEventListener('change', syncReduce);

    window.addEventListener('dppflash:langchange', () => {
      setTimeout(() => {
        this.syncContent();
        this.measure();
      }, 0);
    });
  }

  destroy() {
    this.stopPhysics();
    clearTimeout(this.popTimer);
  }
}

const instances = new WeakMap();

function initFolderFloat(mount) {
  if (instances.has(mount)) return;
  instances.set(mount, new FolderFloat(mount));
}

function initAll() {
  document.querySelectorAll('[data-folder-float]').forEach(initFolderFloat);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
