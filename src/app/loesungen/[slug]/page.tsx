/**
 * /loesungen/[slug] — Statically generated pages for direct (BoFu) searches.
 * Targets users explicitly searching for DPP software, tools, and solutions.
 *
 * Schema: SoftwareApplication + Offer + BreadcrumbList
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import { LOESUNGEN_PAGES, LOESUNGEN_PAGE_MAP, type LoesungenPage } from '@/app/_data/loesungen.data';
import { JsonLd } from '@/app/_components/seo/JsonLd';
import { BreadcrumbJsonLd } from '@/app/_components/seo/BreadcrumbJsonLd';
import { RelatedLinks } from '@/app/_components/layout/RelatedLinks';

const BASE_URL = 'https://dppflash.de';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LOESUNGEN_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = LOESUNGEN_PAGE_MAP.get(slug);

  if (!page) return {};

  const { meta } = page as NonNullable<typeof page>;
  const canonicalUrl = `${BASE_URL}${meta.canonicalPath}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'DPP-Flash',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

function buildSoftwareApplicationSchema(page: LoesungenPage): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DPP-Flash',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: page.intro,
    featureList: page.benefits,
    datePublished: page.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'DPP-Flash',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: page.offer.price,
      priceCurrency: page.offer.priceCurrency,
      description: page.offer.description,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}${page.meta.canonicalPath}`,
    },
    url: `${BASE_URL}${page.meta.canonicalPath}`,
  };
}

export default async function LoesungenDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = (LOESUNGEN_PAGE_MAP.get(slug) ?? notFound()) as LoesungenPage;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Startseite', href: '/' },
          { name: 'Lösungen', href: '/loesungen' },
          { name: page.h1, href: page.meta.canonicalPath },
        ]}
      />
      <JsonLd schema={buildSoftwareApplicationSchema(page)} />

      <main>
        <article>
          <header>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
          </header>

          <section aria-labelledby="benefits-heading">
            <h2 id="benefits-heading">Ihre Vorteile mit DPP-Flash</h2>
            <ul>
              {page.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="offer-heading">
            <h2 id="offer-heading">Jetzt kostenlos starten</h2>
            <p>{page.offer.description} — kein Risiko, keine Vertragsbindung.</p>
            <Link href="https://dppflash.de/#kontakt">Pilotkunde werden</Link>
          </section>
        </article>

        <RelatedLinks
          heading="Hintergründe & Regulierung"
          links={page.relatedBranchen}
        />
      </main>
    </>
  );
}
