import Matter from 'matter-js';

const HIGHLIGHT_CLASS = 'falling-text-highlighted';

function parseList(value) {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function wrapWords(textEl, text, highlightWords) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  textEl.innerHTML = words
    .map((word) => {
      const isHighlighted = highlightWords.some((hw) => word.startsWith(hw));
      return `<span class="word${isHighlighted ? ` ${HIGHLIGHT_CLASS}` : ''}">${word}</span>`;
    })
    .join(' ');
}

function getFallArenaHeight(stage) {
  const gap = 20;
  const nextHeading =
    document.querySelector('#how .journey-header h2') ||
    document.querySelector('#how h2') ||
    document.querySelector('#how');

  if (!nextHeading) return 360;

  const stageTop = stage.getBoundingClientRect().top + window.scrollY;
  const nextTop = nextHeading.getBoundingClientRect().top + window.scrollY;
  const available = nextTop - stageTop - gap;

  return Math.max(available, 320);
}

function startPhysics(container, textEl, options) {
  const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

  const stage =
    container.closest('.compliance-fall-stage') ||
    container.closest('.compliance-fall-inner') ||
    container.closest('section');
  const flowRoot = container.closest('.compliance-fall-flow') || container;

  const stageRect = stage.getBoundingClientRect();
  const flowRect = flowRoot.getBoundingClientRect();
  const columnLeft = flowRect.left - stageRect.left;
  const columnWidth = flowRect.width;

  const wordSpans = [...textEl.querySelectorAll('.word')];
  const wordData = wordSpans.map((elem) => {
    const rect = elem.getBoundingClientRect();
    return {
      elem,
      x: rect.left - flowRect.left + rect.width / 2,
      y: rect.top - stageRect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  });

  const fallHeight = getFallArenaHeight(stage);

  stage.classList.add('is-active');
  flowRoot.classList.add('is-active');
  container.classList.add('is-active');
  stage.style.minHeight = `${fallHeight}px`;

  if (container.parentElement !== stage) {
    stage.appendChild(container);
  }

  container.style.position = 'absolute';
  container.style.left = `${columnLeft}px`;
  container.style.top = '0';
  container.style.width = `${columnWidth}px`;
  container.style.height = `${fallHeight}px`;
  container.style.transform = 'none';

  const width = columnWidth;
  const height = fallHeight;
  if (width <= 0 || height <= 0) return null;

  const canvasHost = container.querySelector('.falling-text-canvas');
  const engine = Engine.create();
  engine.world.gravity.y = options.gravity;

  const render = Render.create({
    element: canvasHost,
    engine,
    options: {
      width,
      height,
      background: 'transparent',
      wireframes: false,
    },
  });

  const boundary = { isStatic: true, render: { fillStyle: 'transparent' } };
  const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundary);
  const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundary);
  const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundary);
  const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundary);

  const wordBodies = wordData.map(({ elem, x, y, w, h }) => {
    const body = Bodies.rectangle(x, y, w, h, {
      render: { fillStyle: 'transparent' },
      restitution: 0.75,
      frictionAir: 0.02,
      friction: 0.25,
    });

    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.2, y: 0 });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);

    elem.style.position = 'absolute';
    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
    elem.style.transform = 'translate(-50%, -50%)';

    return { elem, body };
  });

  const mouse = Mouse.create(container);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: options.mouseConstraintStiffness,
      render: { visible: false },
    },
  });
  render.mouse = mouse;

  World.add(engine.world, [
    floor,
    leftWall,
    rightWall,
    ceiling,
    mouseConstraint,
    ...wordBodies.map((wb) => wb.body),
  ]);

  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  let rafId = 0;
  const updateLoop = () => {
    wordBodies.forEach(({ body, elem }) => {
      const { x, y } = body.position;
      elem.style.left = `${x}px`;
      elem.style.top = `${y}px`;
      elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
    });
    rafId = requestAnimationFrame(updateLoop);
  };
  updateLoop();

  return () => {
    cancelAnimationFrame(rafId);
    Render.stop(render);
    Runner.stop(runner);
    if (render.canvas && canvasHost.contains(render.canvas)) {
      canvasHost.removeChild(render.canvas);
    }
    World.clear(engine.world);
    Engine.clear(engine);
  };
}

function initFallingText(container) {
  const text = container.dataset.text || '';
  const highlightWords = parseList(container.dataset.highlight);
  const trigger = container.dataset.trigger || 'scroll';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const textEl = document.createElement('span');
  textEl.className = 'falling-text-target';
  container.appendChild(textEl);

  if (reducedMotion) {
    wrapWords(textEl, text, highlightWords);
    container.classList.add('is-static');
    return;
  }

  const canvasHost = document.createElement('span');
  canvasHost.className = 'falling-text-canvas';
  canvasHost.setAttribute('aria-hidden', 'true');
  container.appendChild(canvasHost);

  wrapWords(textEl, text, highlightWords);

  const options = {
    gravity: Number(container.dataset.gravity) || 1.1,
    mouseConstraintStiffness: Number(container.dataset.mouseStiffness) || 0.2,
  };

  let started = false;

  function run() {
    if (started) return;
    started = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startPhysics(container, textEl, options);
      });
    });
  }

  if (trigger === 'auto') {
    run();
    return;
  }

  const triggerEl = container.closest('.compliance-fall-flow') || container;
  const triggerRatio = Number(container.dataset.triggerRatio) || 0.55;
  const triggerPosition = Number(container.dataset.triggerPosition) || 0.58;

  function hasReachedText(entry) {
    if (!entry?.isIntersecting) return false;

    const rect = entry.boundingClientRect();
    const vh = window.innerHeight;
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, vh);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleRatio = visibleHeight / Math.max(rect.height, 1);

    const scrolledToText = rect.top <= vh * triggerPosition;
    const enoughVisible = visibleRatio >= triggerRatio;
    const notPastTop = rect.bottom >= vh * 0.18;

    return scrolledToText && enoughVisible && notPastTop;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!hasReachedText(entry)) return;
      run();
      observer.disconnect();
    },
    { threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
  );
  observer.observe(triggerEl);

  function tryStartFromLayout() {
    if (started) return;
    const rect = triggerEl.getBoundingClientRect();
    if (hasReachedText({ isIntersecting: true, boundingClientRect: rect })) {
      run();
      observer.disconnect();
    }
  }

  window.addEventListener('load', tryStartFromLayout, { once: true });
  window.addEventListener('hashchange', tryStartFromLayout);
  window.addEventListener('scroll', tryStartFromLayout, { passive: true });
  requestAnimationFrame(tryStartFromLayout);
}

function initAll() {
  document.querySelectorAll('[data-falling-text]').forEach(initFallingText);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
