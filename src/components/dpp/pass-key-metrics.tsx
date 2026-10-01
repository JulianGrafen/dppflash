import { PassAnimatedKpiValue } from '@/components/dpp/pass-animated-kpi-value';
import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

export function PassKeyMetrics({
  capacity,
  cycleLife,
  carbonFootprint,
}: {
  capacity: string;
  cycleLife: string;
  carbonFootprint: string;
}) {
  const items = [
    { label: 'Kapazität', value: capacity },
    { label: 'Ladezyklen', value: cycleLife },
    { label: 'CO₂e', value: carbonFootprint },
  ];

  return (
    <div className={cn(passTokens.px, 'pb-3 pt-0')}>
      <div
        className="grid grid-cols-3 items-stretch gap-2"
        role="list"
        aria-label="Kernkennzahlen"
      >
        {items.map((item, index) => (
          <div key={item.label} role="listitem" className={passTokens.kpiBox}>
            <div className={passTokens.kpiLabelSlot}>
              <p className={passTokens.textKpiLabel}>{item.label}</p>
            </div>
            <div className={passTokens.kpiValueSlot}>
              <PassAnimatedKpiValue value={item.value} delayMs={index * 90} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
