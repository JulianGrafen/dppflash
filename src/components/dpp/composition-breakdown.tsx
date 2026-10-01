import type {
  DppComposition,
  DppFieldTier,
  DppPassField,
  DppRole,
} from '@/app/_data/sample-dpp.data';
import { PassDisclosure } from '@/components/dpp/pass-disclosure';
import { PassRow } from '@/components/dpp/pass-row';
import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

function visibleForRole(tier: DppFieldTier | undefined, role: DppRole) {
  if (!tier) return true;
  if (tier === 'public') return true;
  if (tier === 'recycler') return role === 'recycler' || role === 'auditor';
  return role === 'auditor';
}

function formatKg(kg: number) {
  return kg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CompositionBreakdown({
  composition,
  role,
  detailFields = [],
}: {
  composition: DppComposition;
  role: DppRole;
  detailFields?: DppPassField[];
}) {
  const { totalKg, segments, materials } = composition;
  const visibleMaterials = materials.filter((m) => visibleForRole(m.tier, role));

  const barSummary = segments
    .map((s) => `${s.label} ${s.percent} %`)
    .join(', ');

  return (
    <div className="space-y-4">
      <div>
        <p className={cn('mb-2 text-xs', passTokens.textMuted)}>
          Massenverteilung ({formatKg(totalKg)} kg gesamt)
        </p>
        <div
          className="flex h-7 w-full overflow-hidden rounded-md"
          role="img"
          aria-label={`Massenverteilung: ${barSummary}`}
        >
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={cn('h-full min-w-[2px]', segment.colorClass)}
              style={{ width: `${segment.percent}%` }}
              title={`${segment.label}: ${formatKg(segment.kg)} kg (${segment.percent} %)`}
            />
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-start gap-2 text-sm">
              <span
                className={cn('mt-1 size-2.5 shrink-0 rounded-sm', segment.colorClass)}
                aria-hidden
              />
              <span className={cn('min-w-0 flex-1', passTokens.textLabel)}>{segment.label}</span>
              <span className={cn('shrink-0 tabular-nums', passTokens.textMuted)}>
                {formatKg(segment.kg)} kg · {segment.percent} %
              </span>
            </li>
          ))}
        </ul>
      </div>

      {detailFields.length > 0 ? (
        <PassDisclosure title="Chemie & Stoffe" meta={`${detailFields.length} Angaben`}>
          <ul className="flex flex-col">
            {detailFields.map((field) => (
              <PassRow
                key={field.label}
                label={field.label}
                value={field.value}
                href={field.href}
                boolean={field.boolean}
                listItems={field.listItems}
              />
            ))}
          </ul>
        </PassDisclosure>
      ) : null}

      {visibleMaterials.length > 0 ? (
        <PassDisclosure
          title="Relevante Materialien"
          meta={`${visibleMaterials.length} Einträge`}
        >
          <div className={cn('overflow-x-auto', passTokens.borderT)}>
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className={cn(passTokens.borderB, passTokens.muted, 'text-xs', passTokens.textMuted)}>
                  <th className={cn(passTokens.px, 'py-2 font-medium')}>Material</th>
                  <th className={cn(passTokens.px, 'py-2 text-right font-medium')}>Anteil</th>
                  <th className={cn(passTokens.px, 'py-2 text-right font-medium')}>Recycelt</th>
                </tr>
              </thead>
              <tbody>
                {visibleMaterials.map((row) => (
                  <tr key={row.label} className={cn(passTokens.borderB, 'last:border-0')}>
                    <td className={cn(passTokens.px, 'py-2', passTokens.textLabel)}>{row.label}</td>
                    <td
                      className={cn(
                        passTokens.px,
                        'py-2 text-right tabular-nums',
                        passTokens.textMuted,
                      )}
                    >
                      {row.share}
                    </td>
                    <td
                      className={cn(
                        passTokens.px,
                        'py-2 text-right tabular-nums',
                        passTokens.textMuted,
                      )}
                    >
                      {row.recycled ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PassDisclosure>
      ) : null}
    </div>
  );
}
