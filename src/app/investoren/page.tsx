import type { Metadata } from 'next';
import Link from 'next/link';

import { BreadcrumbJsonLd } from '@/app/_components/seo/BreadcrumbJsonLd';
import { JsonLd } from '@/app/_components/seo/JsonLd';

const BASE_URL = 'https://dppflash.de';

export const metadata: Metadata = {
  title: 'Für Investoren — DPP-Flash',
  description:
    'Investment in DPP-Flash: B2B SaaS für den Digitalen Produktpass — regulatorischer Rückenwind, KI-Automatisierung für den Mittelstand.',
  alternates: { canonical: `${BASE_URL}/investoren/` },
  openGraph: {
    title: 'Für Investoren — DPP-Flash',
    description:
      'DPP-Flash automatisiert EU-konforme Digital Product Passports für den Mittelstand.',
    url: `${BASE_URL}/investoren/`,
    type: 'website',
    siteName: 'DPP-Flash',
  },
};

export default function InvestorenPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Startseite', href: '/' },
          { name: 'Für Investoren', href: '/investoren/' },
        ]}
      />
      <JsonLd
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Für Investoren — DPP-Flash',
          url: `${BASE_URL}/investoren/`,
        }}
      />

      <main>
        <article>
          <header>
            <h1>Regulierung schafft eine Kategorie — wir automatisieren Compliance für Millionen KMU</h1>
            <p>
              DPP-Flash ist B2B-SaaS für den EU-Digitalen Produktpass: KI extrahiert Daten aus PDFs,
              schließt Lücken in der Lieferkette und veröffentlicht GS1-fähige Pässe mit QR-Code.
            </p>
          </header>

          <section aria-labelledby="market-heading">
            <h2 id="market-heading">Markt</h2>
            <p>
              Ab 2027 verlangen ESPR und Branchenregeln maschinenlesbare Produktdaten von Millionen
              Herstellern und Importeuren in der EU.
            </p>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading">Investoren-Unterlagen</h2>
            <p>Deck und Kennzahlen auf Anfrage unter NDA.</p>
            <p>
              <Link href="mailto:kontakt@dppflash.de?subject=Investorenanfrage">
                Investoren-Unterlagen anfragen
              </Link>
              {' · '}
              <Link href="/ueber-uns/">Team &amp; Mission</Link>
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
