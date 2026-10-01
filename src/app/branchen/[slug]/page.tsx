/**
 * /branchen/[slug] — Statically generated pages for indirect (ToFu/MoFu) searches.
 * Targets users searching for EU regulations and compliance pain points.
 *
 * Schema: Article + FAQPage + BreadcrumbList
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { BRANCHEN_PAGES, BRANCHEN_PAGE_MAP, type BranchenPage } from '@/app/_data/branchen.data';
import { JsonLd } from '@/app/_components/seo/JsonLd';
import { BreadcrumbJsonLd } from '@/app/_components/seo/BreadcrumbJsonLd';
import { RelatedLinks } from '@/app/_components/layout/RelatedLinks';
import { ConversionCta } from '@/app/_components/layout/ConversionCta';

const BASE_URL = 'https://dppflash.de';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BRANCHEN_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = BRANCHEN_PAGE_MAP.get(slug);

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
      type: 'article',
      siteName: 'DPP-Flash',
      publishedTime: page.publishedAt,
      modifiedTime: page.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

function buildArticleSchema(page: BranchenPage): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.intro,
    datePublished: page.publishedAt,
    dateModified: page.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'DPP-Flash',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DPP-Flash',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${page.meta.canonicalPath}`,
    },
  };
}

function buildFaqSchema(page: BranchenPage): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export default async function BranchenDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = (BRANCHEN_PAGE_MAP.get(slug) ?? notFound()) as BranchenPage;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Startseite', href: '/' },
          { name: 'Branchen & Regulierung', href: '/branchen' },
          { name: page.h1, href: page.meta.canonicalPath },
        ]}
      />
      <JsonLd schema={buildArticleSchema(page)} />
      <JsonLd schema={buildFaqSchema(page)} />

      <main>
        <article>
          <header>
            <h1>{page.h1}</h1>
            <p>{page.intro}</p>
          </header>

          <section aria-labelledby="context-heading">
            <h2 id="context-heading">Was das für Ihr Unternehmen bedeutet</h2>
            <p>{page.bodySummary}</p>
          </section>

          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading">Häufige Fragen</h2>
            {page.faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </section>

          <ConversionCta
            headline="DPP-Konformität in 5 Minuten – kostenlos testen"
            subtext="DPP-Flash erstellt Ihren rechtssicheren Digitalen Produktpass automatisch aus bestehenden PDFs. Jetzt in der Pilotphase kostenlos starten."
          />
        </article>

        <RelatedLinks
          heading="Passende DPP-Flash Lösungen"
          links={page.relatedLoesungen}
        />
      </main>
    </>
  );
}
