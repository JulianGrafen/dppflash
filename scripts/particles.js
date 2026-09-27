import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolvePageScroller } from './scroll-scroller.js';

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== 'undefined' && !window.gsap) {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
  ScrollTrigger.defaults({ scroller: resolvePageScroller() });
}

const DEFAULT_COLORS = ['#ffffff', '#ffffff', '#ffffff'];

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

function hexToRgb(hex) {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const int = parseInt(h.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
}

function parseColors(raw) {
  if (!raw) return DEFAULT_COLORS;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      /* fall through */
    }
  }
  return trimmed.split(/[\s,]+/).filter(Boolean);
}

function readParticleOpts(el) {
  const num = (key, fallback) => {
    const v = el.dataset[key];
    if (v === undefined || v === '') return fallback;
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  };
  const bool = (key, fallback) => {
    const v = el.dataset[key];
    if (v === undefined || v === '') return fallback;
    return v === 'true' || v === '1';
  };

  return {
    particleCount: num('particleCount', 200),
    particleSpread: num('particleSpread', 10),
    speed: num('speed', 0.1),
    particleColors: parseColors(el.dataset.particleColors),
    moveParticlesOnHover: bool('moveParticlesOnHover', true),
    particleHoverFactor: num('particleHoverFactor', 1),
    alphaParticles: bool('alphaParticles', false),
    particleBaseSize: num('particleBaseSize', 100),
    sizeRandomness: num('sizeRandomness', 1),
    cameraDistance: num('cameraDistance', 20),
    disableRotation: bool('disableRotation', false),
    pixelRatio: num('pixelRatio', 1),
  };
}

function initParticles(container, opts, hoverHost) {
  const renderer = new Renderer({
    dpr: opts.pixelRatio,
    depth: false,
    alpha: true,
  });
  const gl = renderer.gl;
  container.appendChild(gl.canvas);
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 15 });
  camera.position.set(0, 0, opts.cameraDistance);

  const mouse = { x: 0, y: 0 };

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
  };

  const handleMouseMove = (e) => {
    const rect = hoverHost.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  if (opts.moveParticlesOnHover) {
    hoverHost.addEventListener('mousemove', handleMouseMove, { passive: true });
  }

  const count = opts.particleCount;
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const palette = opts.particleColors.length ? opts.particleColors : DEFAULT_COLORS;

  for (let i = 0; i < count; i++) {
    let x;
    let y;
    let z;
    let len;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = x * x + y * y + z * z;
    } while (len > 1 || len === 0);
    const r = Math.cbrt(Math.random());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
    colors.set(col, i * 3);
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    random: { size: 4, data: randoms },
    color: { size: 3, data: colors },
  });

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uSpread: { value: opts.particleSpread },
      uBaseSize: { value: opts.particleBaseSize * opts.pixelRatio },
      uSizeRandomness: { value: opts.sizeRandomness },
      uAlphaParticles: { value: opts.alphaParticles ? 1 : 0 },
    },
    transparent: true,
    depthTest: false,
  });

  const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

  let raf = 0;
  let visible = true;
  let lastTime = performance.now();
  let elapsed = 0;

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0 },
  );
  io.observe(container);

  const update = (t) => {
    raf = requestAnimationFrame(update);
    if (!visible) return;
    const delta = t - lastTime;
    lastTime = t;
    elapsed += delta * opts.speed;

    program.uniforms.uTime.value = elapsed * 0.001;

    if (opts.moveParticlesOnHover) {
      particles.position.x = -mouse.x * opts.particleHoverFactor;
      particles.position.y = -mouse.y * opts.particleHoverFactor;
    } else {
      particles.position.x = 0;
      particles.position.y = 0;
    }

    if (!opts.disableRotation) {
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.01 * opts.speed;
    }

    renderer.render({ scene: particles, camera });
  };

  window.addEventListener('resize', resize, false);
  resize();
  raf = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', resize);
    if (opts.moveParticlesOnHover) {
      hoverHost.removeEventListener('mousemove', handleMouseMove);
    }
    if (container.contains(gl.canvas)) {
      container.removeChild(gl.canvas);
    }
  };
}

function clampFade(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function initGalaxyCrossfade(space) {
  if (!space) return () => {};

  const how = document.getElementById('how');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const computeFade = (scrollProgress = 0) => {
    const vh = window.innerHeight;
    const rect = space.getBoundingClientRect();
    let fade = clampFade(scrollProgress);

    const enter = clampFade((vh * 1.02 - rect.top) / (vh * 0.58));
    fade = Math.max(fade, enter);

    if (how) {
      const howBottom = how.getBoundingClientRect().bottom;
      const howBlend = clampFade((vh * 1.08 - howBottom) / (vh * 0.72));
      fade = Math.max(fade, howBlend);
    }

    if (rect.top < vh * 0.5) {
      fade = Math.max(fade, clampFade((vh * 0.5 - rect.top) / (vh * 0.38)));
    }

    return Math.max(0, Math.min(1, fade));
  };

  const applyFade = (scrollProgress) => {
    const fade = computeFade(scrollProgress);
    const overlapMax = Math.min(240, window.innerHeight * 0.22);
    const overlap = fade * overlapMax;
    const overlapPx = `${overlap.toFixed(1)}px`;
    space.style.setProperty('--galaxy-crossfade', fade.toFixed(4));
    space.style.setProperty('--galaxy-depth', fade.toFixed(4));
    space.style.setProperty('--how-galaxy-overlap', overlapPx);
    if (how) {
      how.style.setProperty('--how-galaxy-overlap', overlapPx);
      how.style.setProperty('--how-fade', (1 - fade * 0.95).toFixed(4));
    }
  };

  let scrollTrigger = null;

  if (!reduced) {
    const syncFade = () => {
      const stProgress = scrollTrigger?.progress ?? 0;
      applyFade(stProgress);
    };

    scrollTrigger = ScrollTrigger.create({
      trigger: space,
      start: 'top bottom',
      end: 'top 22%',
      scrub: 0.55,
      invalidateOnRefresh: true,
      onUpdate: syncFade,
    });

    if (how) {
      ScrollTrigger.create({
        trigger: how,
        start: 'bottom 95%',
        end: 'bottom top',
        scrub: 0.55,
        invalidateOnRefresh: true,
        onUpdate: syncFade,
      });
    }

    syncFade();
  } else {
    const update = () => {
      const vh = window.innerHeight;
      const rect = space.getBoundingClientRect();
      const fade = rect.top < vh ? 1 : 0;
      applyFade(fade);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);

  return () => {
    scrollTrigger?.kill();
    window.removeEventListener('resize', onResize);
  };
}

function initEinwandScrollReveal(space, headline) {
  if (!space || !headline) return () => {};

  const smoothstep = (t) => t * t * (3 - 2 * t);
  let headlinePeak = 0;

  const update = () => {
    const vh = window.innerHeight;
    const spaceRect = space.getBoundingClientRect();
    const rect = headline.getBoundingClientRect();
    const start = vh * 0.95;
    const end = vh * 0.22;
    const raw = (start - rect.top) / (start - end);
    const headP = smoothstep(Math.max(0, Math.min(1, raw)));
    if (spaceRect.top > vh * 0.5) headlinePeak = 0;
    headlinePeak = Math.max(headlinePeak, headP);
    const peak = headlinePeak.toFixed(4);
    headline.style.setProperty('--einwand-reveal', peak);
    const section = headline.closest('.produktdaten-einwand');
    if (section) {
      section.style.setProperty('--einwand-reveal', peak);
      section.dispatchEvent(
        new CustomEvent('dpp:einwand-reveal', {
          bubbles: false,
          detail: { progress: headlinePeak },
        }),
      );
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

function initProduktdatenSpace(space) {
  const headline = space.querySelector('#produktdaten-einwand-heading');
  const cleanups = [initGalaxyCrossfade(space), initEinwandScrollReveal(space, headline)];
  return () => cleanups.forEach((fn) => fn());
}

function boot() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];

  document.querySelectorAll('.produktdaten-space--particles').forEach((space) => {
    cleanups.push(initProduktdatenSpace(space));
  });

  if (!reduced) {
    document.querySelectorAll('[data-particles]').forEach((container) => {
      if (container.dataset.particlesInit === '1') return;
      container.dataset.particlesInit = '1';
      const space = container.closest('.produktdaten-space') || container.parentElement;
      const opts = readParticleOpts(container);
      cleanups.push(initParticles(container, opts, space || container));
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

let teardown = null;

function start() {
  teardown?.();
  teardown = boot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
