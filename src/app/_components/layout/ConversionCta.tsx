import Link from 'next/link';

interface ConversionCtaProps {
  headline: string;
  subtext: string;
  ctaLabel?: string;
}

/**
 * High-intent CTA block placed on informational (branchen) pages
 * to bridge the gap towards conversion (kontakt / pilotphase).
 */
export function ConversionCta({
  headline,
  subtext,
  ctaLabel = 'Jetzt Pilotkunde werden',
}: ConversionCtaProps) {
  return (
    <section aria-labelledby="cta-heading">
      <h2 id="cta-heading">{headline}</h2>
      <p>{subtext}</p>
      <Link href="https://dppflash.de/#kontakt">{ctaLabel}</Link>
    </section>
  );
}
