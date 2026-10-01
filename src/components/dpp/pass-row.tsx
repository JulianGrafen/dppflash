import type { ReactNode } from 'react';

import type { DppPassMaterialOrigin } from '@/app/_data/sample-dpp.data';
import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

export function PassRow({
  label,
  value,
  href,
  boolean,
  listItems,
  as = 'li',
  className,
}: {
  label: string;
  value: string;
  href?: string;
  boolean?: boolean;
  listItems?: DppPassMaterialOrigin[];
  as?: 'li' | 'div';
  className?: string;
}) {
  let valueNode: ReactNode;

  if (listItems && listItems.length > 0) {
    valueNode = (
      <ul className="flex flex-col gap-1.5">
        {listItems.map((item) => (
          <li
            key={item.name}
            className="flex items-baseline justify-between gap-3 border-b border-[#e8ecf2] pb-1.5 last:border-0 last:pb-0"
          >
            <span className={passTokens.textRowValue}>{item.name}</span>
            <span className={cn('shrink-0 text-[0.68rem]', passTokens.textMuted)}>{item.origin}</span>
          </li>
        ))}
      </ul>
    );
  } else if (boolean !== undefined) {
    valueNode = (
      <span
        className={cn(
          'inline-flex items-center gap-1.5',
          passTokens.textRowValue,
          boolean ? 'text-emerald-700' : 'text-[#64748b]',
        )}
      >
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            boolean ? 'bg-emerald-500' : 'bg-[#cbd5e1]',
          )}
          aria-hidden
        />
        {boolean ? 'Ja' : 'Nein'}
      </span>
    );
  } else if (href) {
    valueNode = (
      <span
        className={cn(passTokens.textRowValue, passTokens.textLink, 'underline underline-offset-2')}
      >
        {value}
      </span>
    );
  } else {
    valueNode = <span className={cn(passTokens.textRowValue, 'text-pretty')}>{value}</span>;
  }

  const Tag = as;

  return (
    <Tag
      className={cn(
        'flex flex-col gap-0.5 py-2',
        passTokens.borderB,
        'last:border-0',
        className,
      )}
    >
      <span className={passTokens.textLabel}>{label}</span>
      <div className="min-w-0">{valueNode}</div>
    </Tag>
  );
}
