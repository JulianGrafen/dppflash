// src/app/qr/[qrUuid]/page.tsx
// Öffentliche QR-Scan-Seite — kein Auth erforderlich.
// Zeigt SDB/BA-Links für einen einzelnen Gefahrstoff.

import { notFound } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client';
import { getSubstanceByQrUuid } from '@/infrastructure/repositories/substance.repository';

interface Props {
  params: Promise<{ qrUuid: string }>;
}

export default async function QrScanPage({ params }: Props) {
  const { qrUuid } = await params;
  // Anon-Client: RLS erlaubt nur Lesen via substance_qr_public View
  const supabase = createSupabaseBrowserClient();
  const substance = await getSubstanceByQrUuid(supabase, qrUuid);

  if (!substance) notFound();

  return (
    <main className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{substance.name}</h1>
      <p className="text-gray-500">{substance.manufacturer}</p>
      {substance.sdb_url && (
        <a href={substance.sdb_url} target="_blank" rel="noopener noreferrer"
           className="block rounded bg-blue-600 text-white text-center py-3 font-medium">
          Sicherheitsdatenblatt (SDB) öffnen
        </a>
      )}
      {substance.ba_url && (
        <a href={substance.ba_url} target="_blank" rel="noopener noreferrer"
           className="block rounded bg-amber-500 text-white text-center py-3 font-medium">
          Betriebsanweisung (BA) öffnen
        </a>
      )}
    </main>
  );
}
