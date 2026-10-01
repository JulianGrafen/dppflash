import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

export function PassKeyMetrics({
  capacity,
  cycleLife,
  carbonFootprint,
  batteryStatusPercent,
  batteryStatusNote,
}: {
  capacity: string;
  cycleLife: string;
  carbonFootprint: string;
  batteryStatusPercent: number;
  batteryStatusNote?: string;
}) {
  const items = [
    { label: 'Kapazität', value: capacity },
    { label: 'Ladezyklen', value: cycleLife },
    { label: 'CO₂e', value: carbonFootprint },
  ];

  const status = Math.min(100, Math.max(0, Math.round(batteryStatusPercent)));

  return (
    <div className={cn(passTokens.px, 'pb-3 pt-3')}>
      <div
        className={cn(
          'mb-2 flex w-full flex-col items-start rounded-xl border border-[#e8ecf2] bg-[#f8fafc] px-3 py-2.5 shadow-sm sm:px-3.5',
        )}
      >
        <div className="w-full">
          <p className={cn(passTokens.textKpiLabel, 'text-left')}>Batteriestatus</p>
          {batteryStatusNote ? (
            <p
              className="mt-1 flex w-full max-w-full items-start gap-1.5 text-[0.58rem] leading-snug text-muted-foreground sm:text-[0.62rem]"
            >
              <span
                className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                aria-hidden
              />
              <span className="min-w-0 flex-1 text-pretty [overflow-wrap:anywhere]">
                {batteryStatusNote}
              </span>
            </p>
          ) : null}
        </div>
        <div className="mt-2 flex w-full items-center gap-2.5">
          <div
            className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e8ecf2]"
            role="progressbar"
            aria-valuenow={status}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Batteriestatus ${status} Prozent`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5b6cff] to-[#7c5cff] transition-[width]"
              style={{ width: `${status}%` }}
            />
          </div>
          <p
            className="shrink-0 text-[0.85rem] font-medium tabular-nums leading-none text-[#1a2b4a] sm:text-[0.95rem]"
            aria-hidden
          >
            {status}%
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-3 items-stretch gap-2"
        role="list"
        aria-label="Kernkennzahlen"
      >
        {items.map((item) => (
          <div key={item.label} role="listitem" className={passTokens.kpiBox}>
            <div className={passTokens.kpiLabelSlot}>
              <p className={passTokens.textKpiLabel}>{item.label}</p>
            </div>
            <div className={passTokens.kpiValueSlot}>
              <p className={passTokens.textKpiValue}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
