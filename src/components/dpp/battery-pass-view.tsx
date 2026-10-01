import Link from 'next/link';

import type { DppPassSectionId, DppRole, SampleDppPass } from '@/app/_data/sample-dpp.data';
import { getAllPassFields } from '@/app/_data/sample-dpp.data';
import { PassCarbonSection } from '@/components/dpp/pass-carbon-section';
import { CompositionBreakdown } from '@/components/dpp/composition-breakdown';
import { PassFieldList } from '@/components/dpp/pass-field-list';
import { PassHero } from '@/components/dpp/pass-hero';
import { PassIssuerFooter } from '@/components/dpp/pass-issuer-footer';
import { PassKeyMetrics } from '@/components/dpp/pass-key-metrics';
import { PassSectionCard } from '@/components/dpp/pass-section-card';
import { passTokens } from '@/components/dpp/pass-tokens';
import { sectionHasVisibleFields, visibleForRole } from '@/components/dpp/pass-visibility';
import { cn } from '@/lib/utils';

const PUBLIC_ROLE: DppRole = 'public';

function sectionIsVisible(
  sectionId: DppPassSectionId,
  allFields: ReturnType<typeof getAllPassFields>,
  role: DppRole,
): boolean {
  if (sectionId === 'composition') return true;
  return sectionHasVisibleFields(sectionId, allFields, role);
}

export function BatteryPassView({ pass }: { pass: SampleDppPass }) {
  const allFields = getAllPassFields(pass);
  const contentSections = pass.contentSections ?? [];
  return (
    <div className={cn('dpp-pass min-h-dvh', passTokens.page)}>
      <div className={cn('min-h-dvh', passTokens.surface)}>
        <PassHero
          title={pass.title}
          category={pass.category}
          passUuid={pass.passUuid}
          imageUrl={pass.imageUrl}
          imageAlt={pass.imageAlt}
        />
        <PassKeyMetrics
          capacity={pass.capacity}
          cycleLife={pass.cycleLife}
          carbonFootprint={pass.carbonFootprint}
          batteryStatusPercent={pass.batteryStatusPercent}
          batteryStatusNote={pass.batteryStatusNote}
        />

        <div className={cn('flex flex-col gap-3 pb-4', passTokens.px)}>
          {contentSections
            .filter((section) => sectionIsVisible(section.id, allFields, PUBLIC_ROLE))
            .map((section) => (
              <PassSectionCard
                key={section.id}
                id={section.id}
                title={section.title}
              >
                {section.id === 'carbon' ? (
                  <PassCarbonSection
                    pass={pass}
                    fields={allFields}
                    fieldGroups={pass.publicSection.fieldGroups}
                    role={PUBLIC_ROLE}
                  />
                ) : section.id !== 'composition' ? (
                  <PassFieldList
                    sectionId={section.id}
                    fields={allFields}
                    fieldGroups={pass.publicSection.fieldGroups}
                    role={PUBLIC_ROLE}
                  />
                ) : (
                  <CompositionBreakdown
                    composition={pass.composition}
                    role={PUBLIC_ROLE}
                    detailFields={allFields.filter(
                      (f) =>
                        f.sectionId === 'composition' && visibleForRole(f.tier, PUBLIC_ROLE),
                    )}
                  />
                )}
              </PassSectionCard>
            ))}
        </div>

        <div className={cn(passTokens.borderT, passTokens.px, 'py-5')}>
          <Link href="/experience.html" className={passTokens.cta}>
            So wurde dieser Pass erstellt
          </Link>
        </div>
      </div>

      <footer className={cn(passTokens.px, 'py-5 text-center text-[0.75rem] leading-relaxed', passTokens.textMuted)}>
        <p className={cn('text-[0.72rem] font-semibold uppercase tracking-wide', passTokens.textAccent)}>
          Digitaler Produktpass (EU)
        </p>
        <PassIssuerFooter dataAsOf={pass.dataAsOf} />
        <p className="mt-3">
          Gehostet mit{' '}
          <Link href="/" className={cn('font-bold no-underline hover:underline', passTokens.textLink)}>
            DPP-Flash
          </Link>
          {' · '}
          <Link
            href="/experience.html"
            className={cn('font-bold no-underline hover:underline', passTokens.textLink)}
          >
            Zur Sandbox
          </Link>
        </p>
      </footer>
    </div>
  );
}
