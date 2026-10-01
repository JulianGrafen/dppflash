import { passTokens } from '@/components/dpp/pass-tokens';
import { cn } from '@/lib/utils';

export function PassIssuerFooter({
  dataAsOf,
  regulationNote,
}: {
  dataAsOf: string;
  regulationNote?: string;
}) {
  const note =
    regulationNote ??
    'Ausgestellt gemäß Verordnung (EU) 2023/1542, Art. 77 und Anhang XIII. Die Angaben stammen vom Herausgeber; verifizierte Felder sind in der Pass-Akte belegt.';

  return (
    <p className={cn('mt-3 text-[0.7rem] leading-relaxed', passTokens.textMuted)}>
      {note} Stand: {dataAsOf}.
    </p>
  );
}
