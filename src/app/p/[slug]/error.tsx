'use client';

import Link from 'next/link';

export default function PassError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center text-[#1a2b4a]">
      <h1 className="text-lg font-bold">Pass konnte nicht geladen werden</h1>
      <p className="max-w-sm text-sm text-[#64748b]">
        Bitte Dev-Server neu starten: <code className="text-xs">npm run dev:app</code> und{' '}
        <code className="text-xs">/p/voltstride-720</code> auf Port <strong>3001</strong> öffnen.
      </p>
      {process.env.NODE_ENV === 'development' ? (
        <p className="max-w-md break-all text-xs text-red-600">{error.message}</p>
      ) : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#5b6cff] px-4 py-2 text-sm font-semibold text-white"
        >
          Erneut laden
        </button>
        <Link href="/experience.html" className="rounded-lg border border-[#e8ecf2] px-4 py-2 text-sm">
          Zur Sandbox
        </Link>
      </div>
    </div>
  );
}
