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

const fragSource = `
#define MAX_COLORS ${MAX_COLORS}
precision highp float;
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

const vertSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const parts =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

function initColorBends(container, options = CONFIG) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { ...CONFIG, ...options };

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const gl =
    canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    }) ||
    canvas.getContext('experimental-webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });

  if (!gl) return null;

  const program = createProgram(gl, vertSource, fragSource);
  if (!program) return null;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const uniforms = {
    uCanvas: gl.getUniformLocation(program, 'uCanvas'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    uRot: gl.getUniformLocation(program, 'uRot'),
    uColorCount: gl.getUniformLocation(program, 'uColorCount'),
    uColors: gl.getUniformLocation(program, 'uColors'),
    uTransparent: gl.getUniformLocation(program, 'uTransparent'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uFrequency: gl.getUniformLocation(program, 'uFrequency'),
    uWarpStrength: gl.getUniformLocation(program, 'uWarpStrength'),
    uPointer: gl.getUniformLocation(program, 'uPointer'),
    uMouseInfluence: gl.getUniformLocation(program, 'uMouseInfluence'),
    uParallax: gl.getUniformLocation(program, 'uParallax'),
    uNoise: gl.getUniformLocation(program, 'uNoise'),
    uIterations: gl.getUniformLocation(program, 'uIterations'),
    uIntensity: gl.getUniformLocation(program, 'uIntensity'),
    uBandWidth: gl.getUniformLocation(program, 'uBandWidth'),
    uScrim: gl.getUniformLocation(program, 'uScrim'),
  };

  const colorVectors = (settings.colors || []).filter(Boolean).slice(0, MAX_COLORS).map(hexToRgb);
  const colorFlat = new Float32Array(MAX_COLORS * 3);
  for (let i = 0; i < MAX_COLORS; i += 1) {
    if (i < colorVectors.length) {
      colorFlat[i * 3] = colorVectors[i][0];
      colorFlat[i * 3 + 1] = colorVectors[i][1];
      colorFlat[i * 3 + 2] = colorVectors[i][2];
    }
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let width = 1;
  let height = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  let startTime = performance.now();
  let lastFrame = startTime;
  let rafId = null;
  let running = true;

  const draw = (elapsed) => {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const deg = (settings.rotation % 360) + settings.autoRotate * elapsed;
    const rad = (deg * Math.PI) / 180;

    gl.uniform2f(uniforms.uCanvas, width, height);
    gl.uniform1f(uniforms.uTime, elapsed);
    gl.uniform1f(uniforms.uSpeed, reducedMotion ? settings.speed * 0.25 : settings.speed);
    gl.uniform2f(uniforms.uRot, Math.cos(rad), Math.sin(rad));
    gl.uniform1i(uniforms.uColorCount, colorVectors.length);
    gl.uniform3fv(uniforms.uColors, colorFlat);
    gl.uniform1i(uniforms.uTransparent, settings.transparent ? 1 : 0);
    gl.uniform1f(uniforms.uScale, settings.scale);
    gl.uniform1f(uniforms.uFrequency, settings.frequency);
    gl.uniform1f(uniforms.uWarpStrength, settings.warpStrength);
    gl.uniform2f(uniforms.uPointer, pointerCurrentX, pointerCurrentY);
    gl.uniform1f(uniforms.uMouseInfluence, settings.mouseInfluence);
    gl.uniform1f(uniforms.uParallax, settings.parallax);
    gl.uniform1f(uniforms.uNoise, settings.noise);
    gl.uniform1i(uniforms.uIterations, settings.iterations);
    gl.uniform1f(uniforms.uIntensity, settings.intensity);
    gl.uniform1f(uniforms.uBandWidth, settings.bandWidth);
    gl.uniform1f(uniforms.uScrim, settings.scrim ?? 0.28);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    width = container.clientWidth || window.innerWidth || 1;
    height = container.clientHeight || window.innerHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
  };

  const handlePointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    pointerTargetX = ((event.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
    pointerTargetY = -(((event.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
  };

  const loop = (now) => {
    if (running) {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const elapsed = (now - startTime) / 1000;
      const amount = Math.min(1, dt * 8);
      pointerCurrentX += (pointerTargetX - pointerCurrentX) * amount;
      pointerCurrentY += (pointerTargetY - pointerCurrentY) * amount;
      draw(elapsed);
    }
    rafId = requestAnimationFrame(loop);
  };

  resize();
  draw(0);
  container.classList.add('is-ready');

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) lastFrame = performance.now();
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(container);
  }

  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', handlePointerMove);
    gl.deleteProgram(program);
    gl.deleteBuffer(positionBuffer);
    if (canvas.parentElement === container) container.removeChild(canvas);
  };
}

function initBackground() {
  const container = document.getElementById('bgCanvas');
  if (!container) return;
  initColorBends(container);
}

initBackground();
