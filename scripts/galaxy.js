import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

gsap.registerPlugin(ScrollTrigger);

function resolvePageScroller() {
  const html = document.documentElement;
  const body = document.body;
  if (!body) return html;
  if (body.scrollTop > 0 && html.scrollTop === 0) return body;
  return document.scrollingElement || html;
}

function applyScrollTriggerDefaults() {
  ScrollTrigger.defaults({ scroller: resolvePageScroller() });
}

if (typeof window !== 'undefined') {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScrollTriggerDefaults);
  } else {
    applyScrollTriggerDefaults();
  }
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uMouseParallax;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;

  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * uMouseParallax * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(26.0 * uDensity, 0.28 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

const DEFAULTS = {
  focal: [0.5, 0.5],
  rotation: [1, 0],
  starSpeed: 0.5,
  density: 1,
  hueShift: 140,
  speed: 1,
  glowIntensity: 0.3,
  saturation: 0,
  mouseRepulsion: true,
  mouseInteraction: true,
  repulsionStrength: 2,
  twinkleIntensity: 0.3,
  rotationSpeed: 0.1,
  autoCenterRepulsion: 0,
  transparent: true,
  lightMode: false,
  disableAnimation: false,
  mouseParallax: 0.14,
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
    focal: [0.5, 0.5],
    rotation: [1, 0],
    starSpeed: n('starSpeed', DEFAULTS.starSpeed),
    density: n('density', DEFAULTS.density),
    hueShift: n('hueShift', DEFAULTS.hueShift),
    speed: n('speed', DEFAULTS.speed),
    glowIntensity: n('glowIntensity', DEFAULTS.glowIntensity),
    saturation: n('saturation', DEFAULTS.saturation),
    mouseRepulsion: b('mouseRepulsion', DEFAULTS.mouseRepulsion),
    mouseInteraction: b('mouseInteraction', DEFAULTS.mouseInteraction),
    repulsionStrength: n('repulsionStrength', DEFAULTS.repulsionStrength),
    twinkleIntensity: n('twinkleIntensity', DEFAULTS.twinkleIntensity),
    rotationSpeed: n('rotationSpeed', DEFAULTS.rotationSpeed),
    autoCenterRepulsion: n('autoCenterRepulsion', DEFAULTS.autoCenterRepulsion),
    transparent: b('transparent', DEFAULTS.transparent),
    lightMode: b('lightMode', DEFAULTS.lightMode),
    disableAnimation: b('disableAnimation', DEFAULTS.disableAnimation),
    mouseParallax: n('mouseParallax', DEFAULTS.mouseParallax),
    stars: b('stars', true),
  };
}

function initGalaxyOrbsOnly(mount, opts, space, headline) {
  const cleanupReveal = initEinwandScrollReveal(space, headline);
  const cleanupCrossfade = initGalaxyCrossfade(space);

  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
    },
    { root: null, threshold: 0 },
  );
  io.observe(space || mount);

  const startTime = performance.now();
  const frame = (t) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;

    const elapsed = (t - startTime) * 0.001;
    mount.dispatchEvent(
      new CustomEvent('galaxy-tick', {
        bubbles: false,
        detail: {
          time: elapsed,
          starSpeed: (elapsed * opts.starSpeed) / 4,
          mouseX: 0.5,
          mouseY: 0.5,
          mouseActive: 0,
          mouseParallax: opts.mouseParallax,
        },
      }),
    );
  };

  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    cleanupReveal();
    cleanupCrossfade();
    io.disconnect();
  };
}

function initGalaxyCrossfade(space) {
  if (!space) return () => {};

  const how = document.getElementById('how');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clampFade(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

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
      let fade = rect.top < vh ? 1 : 0;
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

function initGalaxy(mount) {
  if (mount.dataset.galaxyInit === '1') return;
  mount.dataset.galaxyInit = '1';

  const opts = parseOpts(mount);
  const space = mount.closest('.produktdaten-space') || mount.parentElement;
  const headline = space?.querySelector('.produktdaten-einwand');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!opts.stars) {
    return initGalaxyOrbsOnly(mount, opts, space, headline);
  }

  const disableAnimation = opts.disableAnimation || reducedMotion;
  const mouseInteraction = opts.mouseInteraction && !reducedMotion;

  const cleanupReveal = initEinwandScrollReveal(space, headline);
  const cleanupCrossfade = initGalaxyCrossfade(space);

  const renderer = new Renderer({
    alpha: opts.transparent,
    premultipliedAlpha: false,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  });
  const gl = renderer.gl;
  mount.appendChild(gl.canvas);
  gl.canvas.className = 'produktdaten-galaxy__canvas';

  if (opts.lightMode) {
    gl.clearColor(1, 1, 1, 1);
  } else if (opts.transparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  const targetMouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };
  let targetMouseActive = 0;
  let smoothMouseActive = 0;

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
      },
      uFocal: { value: new Float32Array(opts.focal) },
      uRotation: { value: new Float32Array(opts.rotation) },
      uStarSpeed: { value: opts.starSpeed },
      uDensity: { value: opts.density },
      uHueShift: { value: opts.hueShift },
      uSpeed: { value: opts.speed },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uGlowIntensity: { value: opts.glowIntensity },
      uSaturation: { value: opts.saturation },
      uMouseRepulsion: { value: opts.mouseRepulsion },
      uTwinkleIntensity: { value: opts.twinkleIntensity },
      uRotationSpeed: { value: opts.rotationSpeed },
      uRepulsionStrength: { value: opts.repulsionStrength },
      uMouseActiveFactor: { value: 0 },
      uMouseParallax: { value: opts.mouseParallax },
      uAutoCenterRepulsion: { value: opts.autoCenterRepulsion },
      uTransparent: { value: opts.transparent },
      uLightMode: { value: opts.lightMode ? 1 : 0 },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  function resize() {
    const host = space || mount;
    const w = Math.max(1, host.clientWidth || mount.clientWidth || 1);
    const h = Math.max(1, host.clientHeight || mount.clientHeight || 1);
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = new Color(
      gl.canvas.width,
      gl.canvas.height,
      gl.canvas.width / gl.canvas.height,
    );
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(space || mount);
  window.addEventListener('resize', resize);

  let raf = 0;
  let visible = true;

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
    },
    { root: null, threshold: 0 },
  );
  io.observe(space || mount);

  const trackRect = () => (space || mount).getBoundingClientRect();

  const onPointerMove = (e) => {
    if (!mouseInteraction) return;
    const r = trackRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      targetMouseActive = 0;
      return;
    }
    targetMouse.x = (e.clientX - r.left) / r.width;
    targetMouse.y = 1 - (e.clientY - r.top) / r.height;
    targetMouseActive = 1;
  };

  if (mouseInteraction) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  if (space) {
    space.style.setProperty('--galaxy-tilt-x', '0');
    space.style.setProperty('--galaxy-tilt-y', '0');
    space.style.setProperty('--galaxy-mouse', '0');
  }

  const frame = (t) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;

    if (!disableAnimation) {
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uStarSpeed.value = (t * 0.001 * opts.starSpeed) / 10;
    }

    const lerp = 0.05;
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
    smoothMouseActive += (targetMouseActive - smoothMouseActive) * lerp;

    program.uniforms.uMouse.value[0] = smoothMouse.x;
    program.uniforms.uMouse.value[1] = smoothMouse.y;
    program.uniforms.uMouseActiveFactor.value = smoothMouseActive;

    if (space) {
      const tiltX = (smoothMouse.x - 0.5) * 2;
      const tiltY = (smoothMouse.y - 0.5) * 2;
      space.style.setProperty('--galaxy-tilt-x', tiltX.toFixed(4));
      space.style.setProperty('--galaxy-tilt-y', tiltY.toFixed(4));
      space.style.setProperty('--galaxy-mouse', smoothMouseActive.toFixed(4));
    }

    mount.dispatchEvent(
      new CustomEvent('galaxy-tick', {
        bubbles: false,
        detail: {
          time: program.uniforms.uTime.value,
          starSpeed: program.uniforms.uStarSpeed.value,
          mouseX: program.uniforms.uMouse.value[0],
          mouseY: program.uniforms.uMouse.value[1],
          mouseActive: program.uniforms.uMouseActiveFactor.value,
          mouseParallax: opts.mouseParallax,
        },
      }),
    );

    renderer.render({ scene: mesh });
  };

  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    cleanupReveal();
    cleanupCrossfade();
    ro.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    io.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    mount.removeChild(gl.canvas);
  };
}

document.querySelectorAll('[data-galaxy]').forEach(initGalaxy);
