'use client';

import { useEffect, useRef, useState } from 'react';

import { usePassLocale } from '@/components/dpp/pass-locale-context';
import { cn } from '@/lib/utils';

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

export function PassHeroId({ passUuid }: { passUuid: string }) {
  const { ui } = usePassLocale();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyId() {
    try {
      await writeClipboard(passUuid);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyId}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition-opacity hover:opacity-90"
      aria-label={copied ? ui.copiedId : `${ui.copyId}: ${passUuid}`}
      title={copied ? ui.copiedId : ui.copyId}
    >
      <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-wide text-white/75">
        ID
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[0.65rem] leading-none text-white/95 select-all sm:text-xs">
        {passUuid}
      </span>
      <span
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white',
          copied && 'border-emerald-300/50 bg-emerald-400/20',
        )}
        aria-hidden
      >
        {copied ? (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
            <rect
              x="5.25"
              y="5.25"
              width="7.5"
              height="7.5"
              rx="1.25"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3.5 10.5V4.25C3.5 3.56 4.06 3 4.75 3H10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
