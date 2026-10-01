import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSampleDppPass, normalizePass } from '@/app/_data/sample-dpp.data';
import { BatteryPassView } from '@/components/dpp/battery-pass-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pass = getSampleDppPass(slug);
  if (!pass) return { title: 'Produktpass nicht gefunden' };

  return {
    title: `${pass.title} — Digitaler Batteriepass (Demo)`,
    description:
      'Beispielansicht: Öffentlicher Digitaler Batteriepass nach EU-Batterierichtlinie — Demo von DPP-Flash.',
    robots: { index: false, follow: true },
    alternates: { canonical: `https://dppflash.de/p/${slug}/` },
  };
}

export default async function SampleDppPage({ params }: PageProps) {
  const { slug } = await params;
  const pass = getSampleDppPass(slug);
  if (!pass) notFound();

  return <BatteryPassView pass={normalizePass(pass)} />;
}
