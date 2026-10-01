'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { passTokens } from '@/components/dpp/pass-tokens';
import { easeOutCubic } from '@/lib/easing';
import { formatKpiAnimatedValue, parseKpiValue } from '@/lib/kpi-value-animation';
import { cn } from '@/lib/utils';

const DURATION_MS = 1200;

export function PassAnimatedKpiValue({
  value,
  delayMs = 0,
}: {
  value: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const parsed = useMemo(() => parseKpiValue(value), [value]);
  const [display, setDisplay] = useState(() =>
    parsed ? formatKpiAnimatedValue(parsed, 0) : value,
  );

  useEffect(() => {
    if (!parsed) {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let timeout = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        const current = parsed.target * easeOutCubic(t);
        setDisplay(formatKpiAnimatedValue(parsed, current));
        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setDisplay(value);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timeout = window.setTimeout(run, delayMs);
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [value, parsed, delayMs]);

  return (
    <p ref={ref} className={cn(passTokens.textKpiValue)}>
      {display}
    </p>
  );
}
