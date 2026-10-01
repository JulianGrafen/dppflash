import Image from 'next/image';

import { cn } from '@/lib/utils';

const heroPill =
  'inline-flex items-center rounded-full border border-white/20 bg-slate-900/40 px-2.5 py-1 shadow-sm backdrop-blur-md';

export function PassHero({
  title,
  category,
  passUuid,
  imageUrl,
  imageAlt,
}: {
  title: string;
  category: string;
  passUuid: string;
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-[16/10]">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-contain object-center p-4 sm:p-6"
        sizes="100vw"
        priority
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4" role="group" aria-label="Pass-Kennung">
        <span className={cn(heroPill, 'max-w-full gap-1.5')}>
          <span className="text-[0.6rem] font-bold uppercase tracking-wide text-white/75">ID</span>
          <span className="truncate font-mono text-[0.65rem] leading-none text-white/95 sm:text-xs">
            {passUuid}
          </span>
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 text-white">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">{title}</h1>
        <span
          className={cn(
            heroPill,
            'text-[0.65rem] font-semibold uppercase tracking-wider text-white sm:text-xs',
          )}
        >
          {category}
        </span>
      </div>
    </div>
  );
}
