import type { ReactNode } from 'react';

import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

export function PassSectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const headingId = `pass-section-${id}`;

  return (
    <section className={passTokens.card} aria-labelledby={headingId}>
      <header className={cn(passTokens.borderB, passTokens.px, 'py-3')}>
        <h2 id={headingId} className={passTokens.textSection}>
          {title}
        </h2>
      </header>
      <div className={cn(passTokens.px, 'py-2.5')}>{children}</div>
    </section>
  );
}
