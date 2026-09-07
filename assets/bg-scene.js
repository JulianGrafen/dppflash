"use strict";(()=>{var b={colors:["#d93d62","#6f42e8","#00a89a"],rotation:90,speed:.35,scale:1,frequency:1,warpStrength:1,mouseInfluence:1,noise:.12,parallax:.5,iterations:4,intensity:1.22,bandWidth:5.2,transparent:!0,autoRotate:6,scrim:.32},U=`
#define MAX_COLORS 8
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
`,T=`
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;function B(t,a,c){let o=t.createShader(a);return t.shaderSource(o,c),t.compileShader(o),t.getShaderParameter(o,t.COMPILE_STATUS)?o:(console.error(t.getShaderInfoLog(o)),t.deleteShader(o),null)}function O(t,a,c){let o=B(t,t.VERTEX_SHADER,a),u=B(t,t.FRAGMENT_SHADER,c);if(!o||!u)return null;let e=t.createProgram();return t.attachShader(e,o),t.attachShader(e,u),t.linkProgram(e),t.deleteShader(o),t.deleteShader(u),t.getProgramParameter(e,t.LINK_STATUS)?e:(console.error(t.getProgramInfoLog(e)),t.deleteProgram(e),null)}function _(t){let a=t.replace("#","").trim(),c=a.length===3?[parseInt(a[0]+a[0],16),parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16)]:[parseInt(a.slice(0,2),16),parseInt(a.slice(2,4),16),parseInt(a.slice(4,6),16)];return[c[0]/255,c[1]/255,c[2]/255]}function k(t,a=b){let c=window.matchMedia("(prefers-reduced-motion: reduce)").matches,o={...b,...a},u=document.createElement("canvas");u.style.width="100%",u.style.height="100%",u.style.display="block",t.appendChild(u);let e=u.getContext("webgl",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"})||u.getContext("experimental-webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!0});if(!e)return null;let r=O(e,T,U);if(!r)return null;let h=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,h),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let L=e.getAttribLocation(r,"aPosition"),i={uCanvas:e.getUniformLocation(r,"uCanvas"),uTime:e.getUniformLocation(r,"uTime"),uSpeed:e.getUniformLocation(r,"uSpeed"),uRot:e.getUniformLocation(r,"uRot"),uColorCount:e.getUniformLocation(r,"uColorCount"),uColors:e.getUniformLocation(r,"uColors"),uTransparent:e.getUniformLocation(r,"uTransparent"),uScale:e.getUniformLocation(r,"uScale"),uFrequency:e.getUniformLocation(r,"uFrequency"),uWarpStrength:e.getUniformLocation(r,"uWarpStrength"),uPointer:e.getUniformLocation(r,"uPointer"),uMouseInfluence:e.getUniformLocation(r,"uMouseInfluence"),uParallax:e.getUniformLocation(r,"uParallax"),uNoise:e.getUniformLocation(r,"uNoise"),uIterations:e.getUniformLocation(r,"uIterations"),uIntensity:e.getUniformLocation(r,"uIntensity"),uBandWidth:e.getUniformLocation(r,"uBandWidth"),uScrim:e.getUniformLocation(r,"uScrim")},s=(o.colors||[]).filter(Boolean).slice(0,8).map(_),f=new Float32Array(24);for(let n=0;n<8;n+=1)n<s.length&&(f[n*3]=s[n][0],f[n*3+1]=s[n][1],f[n*3+2]=s[n][2]);e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,0);let v=1,g=1,S=Math.min(window.devicePixelRatio||1,1.5),R=0,A=0,w=0,C=0,F=performance.now(),x=F,m=null,y=!0,I=n=>{e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,h),e.enableVertexAttribArray(L),e.vertexAttribPointer(L,2,e.FLOAT,!1,0,0);let p=(o.rotation%360+o.autoRotate*n)*Math.PI/180;e.uniform2f(i.uCanvas,v,g),e.uniform1f(i.uTime,n),e.uniform1f(i.uSpeed,c?o.speed*.25:o.speed),e.uniform2f(i.uRot,Math.cos(p),Math.sin(p)),e.uniform1i(i.uColorCount,s.length),e.uniform3fv(i.uColors,f),e.uniform1i(i.uTransparent,o.transparent?1:0),e.uniform1f(i.uScale,o.scale),e.uniform1f(i.uFrequency,o.frequency),e.uniform1f(i.uWarpStrength,o.warpStrength),e.uniform2f(i.uPointer,w,C),e.uniform1f(i.uMouseInfluence,o.mouseInfluence),e.uniform1f(i.uParallax,o.parallax),e.uniform1f(i.uNoise,o.noise),e.uniform1i(i.uIterations,o.iterations),e.uniform1f(i.uIntensity,o.intensity),e.uniform1f(i.uBandWidth,o.bandWidth),e.uniform1f(i.uScrim,o.scrim??.28),e.viewport(0,0,u.width,u.height),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)},d=()=>{v=t.clientWidth||window.innerWidth||1,g=t.clientHeight||window.innerHeight||1,S=Math.min(window.devicePixelRatio||1,1.5),u.width=Math.max(1,Math.floor(v*S)),u.height=Math.max(1,Math.floor(g*S))},P=n=>{let l=t.getBoundingClientRect();R=(n.clientX-l.left)/(l.width||1)*2-1,A=-((n.clientY-l.top)/(l.height||1)*2-1)},M=n=>{if(y){let l=Math.min(.05,(n-x)/1e3);x=n;let p=(n-F)/1e3,q=Math.min(1,l*8);w+=(R-w)*q,C+=(A-C)*q,I(p)}m=requestAnimationFrame(M)};return d(),I(0),t.classList.add("is-ready"),window.addEventListener("resize",d),window.addEventListener("pointermove",P,{passive:!0}),document.addEventListener("visibilitychange",()=>{y=!document.hidden,y&&(x=performance.now())}),"ResizeObserver"in window&&new ResizeObserver(d).observe(t),m=requestAnimationFrame(M),()=>{m!==null&&cancelAnimationFrame(m),window.removeEventListener("resize",d),window.removeEventListener("pointermove",P),e.deleteProgram(r),e.deleteBuffer(h),u.parentElement===t&&t.removeChild(u)}}function E(){let t=document.getElementById("bgCanvas");t&&k(t)}E();})();
