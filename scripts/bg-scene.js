import * as THREE from 'three';

const MAX_COLORS = 8;

const CONFIG = {
  colors: ['#d93d62', '#6f42e8', '#00a89a'],
  rotation: 90,
  speed: 0.35,
  scale: 1,
  frequency: 1,
  warpStrength: 1,
  mouseInfluence: 1,
  noise: 0.12,
  parallax: 0.5,
  iterations: 4,
  intensity: 1.22,
  bandWidth: 5.2,
  transparent: true,
  autoRotate: 6,
  scrim: 0.32,
};

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
uniform float uScrim;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += vec2(sin(t * 0.55), cos(t * 0.41)) * 0.28;
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency + t * 0.45));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency + t * 0.45));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency + t * 0.45));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

    col *= uIntensity;
    float peak = max(max(col.r, col.g), col.b);
    col *= mix(1.0, 0.62, smoothstep(0.42, 0.9, peak));
    col = mix(col, col * (1.0 - uScrim), step(0.001, max(max(col.r, col.g), col.b)));

    if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

function hexToVec3(hex) {
  const h = hex.replace('#', '').trim();
  const parts =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return new THREE.Vector3(parts[0] / 255, parts[1] / 255, parts[2] / 255);
}

function initColorBends(container, options = CONFIG) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { ...CONFIG, ...options };

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));
  const colorVectors = (settings.colors || []).filter(Boolean).slice(0, MAX_COLORS).map(hexToVec3);
  for (let i = 0; i < MAX_COLORS; i += 1) {
    if (i < colorVectors.length) uColorsArray[i].copy(colorVectors[i]);
    else uColorsArray[i].set(0, 0, 0);
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uCanvas: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uSpeed: { value: reducedMotion ? settings.speed * 0.25 : settings.speed },
      uRot: { value: new THREE.Vector2(1, 0) },
      uColorCount: { value: colorVectors.length },
      uColors: { value: uColorsArray },
      uTransparent: { value: settings.transparent ? 1 : 0 },
      uScale: { value: settings.scale },
      uFrequency: { value: settings.frequency },
      uWarpStrength: { value: settings.warpStrength },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: settings.mouseInfluence },
      uParallax: { value: settings.parallax },
      uNoise: { value: settings.noise },
      uIterations: { value: settings.iterations },
      uIntensity: { value: settings.intensity },
      uBandWidth: { value: settings.bandWidth },
      uScrim: { value: settings.scrim ?? 0.28 },
    },
    premultipliedAlpha: true,
    transparent: true,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, settings.transparent ? 0 : 1);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);
  const pointerSmooth = 8;
  let rafId = null;
  let running = true;

  const handleResize = () => {
    const width = container.clientWidth || window.innerWidth || 1;
    const height = container.clientHeight || window.innerHeight || 1;
    renderer.setSize(width, height, false);
    material.uniforms.uCanvas.value.set(width, height);
  };

  const handlePointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
    const y = -(((event.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
    pointerTarget.set(x, y);
  };

  const loop = () => {
    if (running) {
      const dt = clock.getDelta();
      const elapsed = clock.elapsedTime;
      material.uniforms.uTime.value = elapsed;

      const deg = (settings.rotation % 360) + settings.autoRotate * elapsed;
      const rad = (deg * Math.PI) / 180;
      material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));

      const amount = Math.min(1, dt * pointerSmooth);
      pointerCurrent.lerp(pointerTarget, amount);
      material.uniforms.uPointer.value.copy(pointerCurrent);

      renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(loop);
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
  }

  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', handlePointerMove);
    mesh.geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };
}

function initBackground() {
  const container = document.getElementById('bgCanvas');
  if (!container) return;
  initColorBends(container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackground);
} else {
  initBackground();
}
